import { test } from 'node:test';
import assert from 'node:assert';
import { migrate } from '../src/storage/sqlite/migrate.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

test('migrate should be idempotent', async () => {
  // Create a temporary database file
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-db-'));
  const dbPath = path.join(tempDir, 'test.db');
  const migrationsDir = path.join(process.cwd(), 'src/storage/sqlite/migrations');

  try {
    // Run migrations first time
    await migrate(dbPath, migrationsDir);

    // Run migrations second time - should not throw
    await migrate(dbPath, migrationsDir);

    // Verify migrations table exists and has entries
    const sqlite3 = (await import('sqlite3')).default;
    const { open } = await import('sqlite');

    const db = await open({ filename: dbPath, driver: sqlite3.Database });

    // Check that migrations table exists
    const migrationTable = await db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='__migrations__'"
    );
    assert.ok(migrationTable, 'Migrations table should exist');

    // Check that at least one migration was applied
    const migrations = await db.all('SELECT * FROM __migrations__');
    assert.ok(migrations.length > 0, 'At least one migration should be applied');

    await db.close();

    console.log('✓ Migration idempotency test passed');
  } finally {
    // Cleanup
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (err) {
      console.warn('Failed to cleanup temp directory:', err.message);
    }
  }
});

test('migrate should create expected tables', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-db-'));
  const dbPath = path.join(tempDir, 'test.db');
  const migrationsDir = path.join(process.cwd(), 'src/storage/sqlite/migrations');

  try {
    await migrate(dbPath, migrationsDir);

    const sqlite3 = (await import('sqlite3')).default;
    const { open } = await import('sqlite');

    const db = await open({ filename: dbPath, driver: sqlite3.Database });

    // Check for expected tables
    const expectedTables = [
      'projects',
      'devices',
      'versions',
      'markets',
      'licenses',
      'clients',
      'news',
      'events',
      'notifications',
    ];

    for (const tableName of expectedTables) {
      const table = await db.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        tableName
      );
      assert.ok(table, `Table ${tableName} should exist`);
    }

    // Check for FTS table
    const ftsTable = await db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='projects_fts'"
    );
    assert.ok(ftsTable, 'FTS table should exist');

    await db.close();

    console.log('✓ Table creation test passed');
  } finally {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (err) {
      console.warn('Failed to cleanup temp directory:', err.message);
    }
  }
});
