import fs from 'fs/promises';
import path from 'path';
import { app } from 'electron';
import { telemetry } from './telemetry.js';

/**
 * Database backup service
 */
export class BackupService {
  constructor() {
    this.backupDir = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      const userDataPath = app.getPath('userData');
      this.backupDir = path.join(userDataPath, 'backups');

      // Ensure backup directory exists
      await fs.mkdir(this.backupDir, { recursive: true });
      this.initialized = true;

      console.log('Backup service initialized:', this.backupDir);
    } catch (error) {
      console.error('Failed to initialize backup service:', error);
    }
  }

  async createBackup() {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const userDataPath = app.getPath('userData');
      const dbPath = path.join(userDataPath, 'authentcare.db');

      // Check if database exists
      try {
        await fs.access(dbPath);
      } catch {
        console.log('No database file found to backup');
        return null;
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `authentcare-backup-${timestamp}.db`;
      const backupPath = path.join(this.backupDir, backupFileName);

      // Copy database file
      await fs.copyFile(dbPath, backupPath);

      // Log the backup
      await telemetry.logMaintenance('backup_created', 'completed', {
        backupPath,
        timestamp,
      });

      console.log('Database backup created:', backupPath);
      return backupPath;
    } catch (error) {
      console.error('Failed to create backup:', error);
      await telemetry.logMaintenance('backup_created', 'failed', {
        error: error.message,
      });
      throw error;
    }
  }

  async cleanOldBackups(maxAge = 30) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files.filter(file => file.startsWith('authentcare-backup-'));

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAge);

      let deletedCount = 0;

      for (const file of backupFiles) {
        const filePath = path.join(this.backupDir, file);
        const stats = await fs.stat(filePath);

        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
          deletedCount++;
          console.log('Deleted old backup:', file);
        }
      }

      if (deletedCount > 0) {
        await telemetry.logMaintenance('backup_cleanup', 'completed', {
          deletedCount,
          maxAge,
        });
      }

      return deletedCount;
    } catch (error) {
      console.error('Failed to clean old backups:', error);
      await telemetry.logMaintenance('backup_cleanup', 'failed', {
        error: error.message,
      });
      return 0;
    }
  }

  async listBackups() {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files.filter(file => file.startsWith('authentcare-backup-'));

      const backups = [];
      for (const file of backupFiles) {
        const filePath = path.join(this.backupDir, file);
        const stats = await fs.stat(filePath);

        backups.push({
          filename: file,
          path: filePath,
          size: stats.size,
          created: stats.mtime,
        });
      }

      return backups.sort((a, b) => b.created - a.created);
    } catch (error) {
      console.error('Failed to list backups:', error);
      return [];
    }
  }

  getBackupDirectory() {
    return this.backupDir;
  }
}

// Singleton instance
export const backupService = new BackupService();
