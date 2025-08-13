import { app, BrowserWindow, ipcMain, session } from 'electron';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import { runMigrations } from './database/migrationRunner.js';
import { migrate } from './storage/sqlite/migrate.js';
import IPCHandler from './main/ipc/handlers.js';
import { backupService } from './services/backup.js';
import { telemetry } from './services/telemetry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let currentTheme = 'light';
let db;
let _ipcHandler;
let backupTimer;

// Initialise SQLite database and run migrations
async function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'authentcare.db');

  // Apply SQL migrations from src/storage/sqlite/migrations
  await migrate(dbPath, path.join(__dirname, 'storage/sqlite/migrations'));

  // Open the SQLite DB
  db = await open({
    filename: dbPath,
    driver: sqlite3.verbose().Database,
  });

  // Run JS-based schema/index/data migrations
  await runMigrations(db);

  // Register IPC handlers that require DB access
  _ipcHandler = new IPCHandler(db);

  // Initialize services
  await telemetry.initialize();
  await backupService.initialize();

  // Schedule nightly backups (run at 2 AM)
  scheduleNightlyBackup();
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      sandbox: true, // renderer sandbox
    },
    show: false, // don’t show until ready
  });

  // Load the built index.html from the dist folder
  mainWindow.loadURL(`file://${path.join(__dirname, '../dist/index.html')}`);

  // Show window when ready to avoid visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Suppress common DevTools extension errors
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    const suppressed = [
      'devtools://',
      'Autofill.enable',
      'Autofill.setAddresses',
      'Service worker registration failed',
    ];
    if (suppressed.some(s => sourceId.includes(s) || message.includes(s))) return;
  });
}

// Theme IPC handlers
ipcMain.handle('get-theme', () => currentTheme);
ipcMain.on('set-theme', (event, theme) => {
  currentTheme = theme;
  BrowserWindow.getAllWindows().forEach(w => w.webContents.send('theme-changed', currentTheme));
});

// Simple user example (unchanged)
ipcMain.handle('add-user', async (_, name) => {
  const result = await db.run('INSERT INTO users (name) VALUES (?)', [name]);
  return { id: result.lastID, name };
});
ipcMain.handle('get-users', async () => {
  return await db.all('SELECT * FROM users');
});

// Manual DB maintenance: re-run SQL migrations on demand
ipcMain.handle('run-db-maintenance', async () => {
  try {
    await telemetry.logMaintenance('db_maintenance', 'started');

    const dbPath = path.join(app.getPath('userData'), 'authentcare.db');
    await migrate(dbPath, path.join(__dirname, 'storage/sqlite/migrations'));

    await telemetry.logMaintenance('db_maintenance', 'completed');
    return { ok: true };
  } catch (error) {
    await telemetry.logMaintenance('db_maintenance', 'failed', { error: error.message });
    throw error;
  }
});

// Backup management
ipcMain.handle('create-backup', async () => {
  try {
    const backupPath = await backupService.createBackup();
    return { ok: true, backupPath };
  } catch (error) {
    return { ok: false, error: error.message };
  }
});

ipcMain.handle('list-backups', async () => {
  try {
    const backups = await backupService.listBackups();
    return { ok: true, backups };
  } catch (error) {
    return { ok: false, error: error.message };
  }
});

ipcMain.handle('get-backup-directory', async () => {
  try {
    await backupService.initialize();
    const directory = backupService.getBackupDirectory();
    return { ok: true, directory };
  } catch (error) {
    return { ok: false, error: error.message };
  }
});

// Schedule nightly backups
function scheduleNightlyBackup() {
  const now = new Date();
  const nextBackup = new Date();
  nextBackup.setHours(2, 0, 0, 0); // 2 AM

  // If it's already past 2 AM today, schedule for tomorrow
  if (now > nextBackup) {
    nextBackup.setDate(nextBackup.getDate() + 1);
  }

  const timeUntilBackup = nextBackup.getTime() - now.getTime();

  console.log('Next backup scheduled for:', nextBackup.toISOString());

  backupTimer = setTimeout(async () => {
    try {
      console.log('Running scheduled backup...');
      await backupService.createBackup();
      await backupService.cleanOldBackups(30); // Keep backups for 30 days

      // Schedule next backup (24 hours later)
      scheduleNightlyBackup();
    } catch (error) {
      console.error('Scheduled backup failed:', error);
      // Still schedule next backup attempt
      scheduleNightlyBackup();
    }
  }, timeUntilBackup);
}

app.whenReady().then(async () => {
  await initDatabase();

  // --- Runtime CSP (covers dev & prod) ---
  const csp =
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self';";
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const headers = { ...details.responseHeaders, 'Content-Security-Policy': [csp] };
    callback({ responseHeaders: headers });
  });
  // ---------------------------------------

  createWindow();

  // Install React DevTools only in development
  if (!app.isPackaged && process.env.NODE_ENV === 'development') {
    try {
      const { default: installExtension, REACT_DEVELOPER_TOOLS } = await import(
        'electron-devtools-installer'
      );
      await installExtension(REACT_DEVELOPER_TOOLS);
    } catch (err) {
      console.log('React DevTools not available:', err);
    }
  }
});

app.on('window-all-closed', () => {
  if (backupTimer) {
    clearTimeout(backupTimer);
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Ignore known harmless uncaught exceptions/unhandled rejections
process.on('uncaughtException', error => {
  const harmless = [
    'Extension',
    'DevTools',
    'Autofill',
    'Service worker registration failed',
    'Failed to load resource',
  ];
  if (harmless.some(keyword => error.message && error.message.includes(keyword))) {
    return;
  }
});
process.on('unhandledRejection', reason => {
  const harmless = [
    'Extension',
    'DevTools',
    'Autofill',
    'Service worker registration failed',
    'Failed to load resource',
  ];
  if (reason && reason.message && harmless.some(keyword => reason.message.includes(keyword))) {
    return;
  }
});
