// Update the database schema
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app } = require('electron');

// Use the same database path as main process
const dbPath = path.join(app.getPath('userData'), 'authentcare.db');
const db = new sqlite3.Database(dbPath);

// Removed creation of unused clients table

module.exports = db;
