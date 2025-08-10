import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations(db) {
  const migrationsPath = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsPath).sort();

  // Create migrations table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Get executed migrations
  const executed = await db.all('SELECT name FROM migrations');
  const executedNames = executed.map(m => m.name);

  // Run pending migrations
  for (const file of files) {
    if (!executedNames.includes(file)) {
      const migrationModule = await import(path.join('file://', migrationsPath, file));
      await migrationModule.up(db);
      await db.run('INSERT INTO migrations (name) VALUES (?)', [file]);
      console.log(`Executed migration: ${file}`);
    }
  }
}
