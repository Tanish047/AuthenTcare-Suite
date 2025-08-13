import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs/promises';
import path from 'path';

// Conditionally import telemetry only in Electron environment
let telemetry = null;
const isElectron = typeof process !== 'undefined' && process.versions && process.versions.electron;

if (isElectron) {
  try {
    const telemetryModule = await import('../../services/telemetry.js');
    telemetry = telemetryModule.telemetry;
  } catch (error) {
    console.warn('Failed to import telemetry:', error.message);
  }
}

// Determine directory name in ESM
const __dirname = new URL('.', import.meta.url).pathname;

/**
 * Run pending SQL migrations.
 * @param {string} dbPath - Path to SQLite database file.
 * @param {string} migrationsDir - Directory containing .sql migration files.
 */
export async function migrate(
  dbPath = path.join(process.cwd(), 'authentcare.db'),
  migrationsDir = path.join(__dirname, 'migrations')
) {
  const db = await open({ filename: dbPath, driver: sqlite3.Database });
  // Enable foreign keys and WAL for concurrency
  await db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;');
  // Migrations table keeps track of applied migrations
  await db.exec('CREATE TABLE IF NOT EXISTS __migrations__(id TEXT PRIMARY KEY);');
  const files = (await fs.readdir(migrationsDir)).filter(f => /^\d+_.+\.sql$/.test(f)).sort();
  for (const file of files) {
    const id = file.split('_')[0];
    const applied = await db.get('SELECT 1 FROM __migrations__ WHERE id=?', id);
    if (applied) continue;

    const startTime = Date.now();
    if (telemetry) {
      await telemetry.logMigration(id, 'started');
    }

    try {
      const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
      await db.exec(sql);
      await db.run('INSERT INTO __migrations__(id) VALUES (?)', id);

      const duration = Date.now() - startTime;
      if (telemetry) {
        await telemetry.logMigration(id, 'completed', duration);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      if (telemetry) {
        await telemetry.logMigration(id, 'failed', duration);
      }
      throw error;
    }
  }
  await db.close();
}

// If this file is executed directly via node, run migrations on default paths
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  migrate().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
