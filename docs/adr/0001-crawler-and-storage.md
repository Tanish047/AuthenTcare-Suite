# ADR‑0001: Web Crawler and Local Storage

## Context
We cache external pages locally for offline search; schema must evolve via migrations.

## Decision
- Crawler: `node-fetch` + `cheerio` (`src/services/webCrawler.js`), exposed via `webCrawler:fetch`.
- Storage: SQLite + WAL; FTS5 for full-text search.
- Migrations: SQL files in `src/storage/sqlite/migrations` via `migrate.js`; keep JS defaults in `database/migrationRunner.js`.
- Maintenance: Settings action and `ipcMain.handle('run-db-maintenance')`.

## Consequences
- Offline search capability.
- Idempotent schema upgrades by shipping new SQL files.
