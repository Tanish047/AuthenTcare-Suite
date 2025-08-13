import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { migrate } from '../src/storage/sqlite/migrate.js';

test('migrate creates db and is idempotent', async () => {
  const tmp = path.join(process.cwd(), '.tmp');
  const dbPath = path.join(tmp, 'test.db');
  await fs.promises.mkdir(tmp, { recursive: true });

  const migrationsDir = path.join(process.cwd(), 'src/storage/sqlite/migrations');
  await migrate(dbPath, migrationsDir);
  assert.ok(fs.existsSync(dbPath));

  // running again should not throw
  await migrate(dbPath, migrationsDir);
});
