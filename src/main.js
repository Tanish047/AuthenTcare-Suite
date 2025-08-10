import { app, BrowserWindow, ipcMain, session } from 'electron';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import { runMigrations } from './database/migrationRunner.js';
import IPCHandler from './main/ipc/handlers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let currentTheme = 'light';
let db;
let ipcHandler;

// Initialize SQLite database
async function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'authentcare.db');

  db = await open({
    filename: dbPath,
    driver: sqlite3.verbose().Database,
  });

  // Run migrations
  await runMigrations(db);

  // Initialize IPC handlers
  ipcHandler = new IPCHandler(db);
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
    },
    show: false, // Don't show until ready
  });

  // Load the built index.html from the dist folder
  mainWindow.loadURL(`file://${path.join(__dirname, '../dist/index.html')}`);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Suppress console errors from DevTools extensions
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    // Filter out DevTools extension errors
    if (sourceId.includes('devtools://') || 
        message.includes('Autofill.enable') || 
        message.includes('Autofill.setAddresses') ||
        message.includes('Service worker registration failed')) {
      return; // Suppress these messages
    }
  });
}

// Theme IPC handlers
ipcMain.handle('get-theme', () => currentTheme);

ipcMain.on('set-theme', (event, theme) => {
  currentTheme = theme;
  BrowserWindow.getAllWindows().forEach((w) =>
    w.webContents.send('theme-changed', currentTheme)
  );
});

// SQLite IPC handlers
ipcMain.handle('add-user', async (_, name) => {
  const result = await db.run('INSERT INTO users (name) VALUES (?)', [name]);
  return { id: result.lastID, name };
});

ipcMain.handle('get-users', async () => {
  return await db.all('SELECT * FROM users');
});

app.whenReady().then(async () => {
  await initDatabase();
  createWindow();
  
  // Only install React DevTools in development
  if (!app.isPackaged && process.env.NODE_ENV === 'development') {
    try {
      const { default: installExtension, REACT_DEVELOPER_TOOLS } = await import('electron-devtools-installer');
      await installExtension(REACT_DEVELOPER_TOOLS);
    } catch (err) {
      console.log('React DevTools not available:', err);
    }
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Improved error handling - only suppress known harmless errors
process.on('uncaughtException', (error) => {
  // Only suppress specific known harmless errors
  const harmlessErrors = [
    'Extension',
    'DevTools',
    'Autofill',
    'Service worker registration failed',
    'Failed to load resource'
  ];
  
  const isHarmless = harmlessErrors.some(keyword => 
    error.message && error.message.includes(keyword)
  );
  
  if (isHarmless) {
    return; // Suppress harmless errors
  }
  // Uncaught Exception occurred
});

// Improved promise rejection handling
process.on('unhandledRejection', (reason) => {
  // Only suppress specific known harmless rejections
  const harmlessRejections = [
    'Extension',
    'DevTools', 
    'Autofill',
    'Service worker registration failed',
    'Failed to load resource'
  ];
  
  const isHarmless = reason && reason.message && 
    harmlessRejections.some(keyword => reason.message.includes(keyword));
  
  if (isHarmless) {
    return; // Suppress harmless rejections
  }
  // Unhandled Rejection occurred
});