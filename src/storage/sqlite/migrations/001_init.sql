-- 001_init.sql
-- Initial database schema for AuthenTcareSuite

-- Users table (example)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

-- Projects table
CREATE TABLE IF NOT EXISTS project (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT
);

-- Full-text search virtual table for projects
CREATE VIRTUAL TABLE IF NOT EXISTS project_fts USING fts5(
  name,
  description,
  content='project',
  content_rowid='id'
);

-- Triggers to keep FTS table in sync with project table
CREATE TRIGGER IF NOT EXISTS project_ai AFTER INSERT ON project BEGIN
  INSERT INTO project_fts(rowid, name, description) VALUES (new.id, new.name, new.description);
END;

CREATE TRIGGER IF NOT EXISTS project_ad AFTER DELETE ON project BEGIN
  INSERT INTO project_fts(project_fts, rowid, name, description) VALUES('delete', old.id, old.name, old.description);
END;

CREATE TRIGGER IF NOT EXISTS project_au AFTER UPDATE ON project BEGIN
  INSERT INTO project_fts(project_fts, rowid, name, description) VALUES('delete', old.id, old.name, old.description);
  INSERT INTO project_fts(rowid, name, description) VALUES (new.id, new.name, new.description);
END;
