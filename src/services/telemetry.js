import fs from 'fs/promises';
import path from 'path';
import { app } from 'electron';

/**
 * Simple telemetry service for logging application events
 */
export class TelemetryService {
  constructor() {
    this.logPath = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      const userDataPath = app.getPath('userData');
      const logsDir = path.join(userDataPath, 'logs');

      // Ensure logs directory exists
      await fs.mkdir(logsDir, { recursive: true });

      this.logPath = path.join(logsDir, 'telemetry.log');
      this.initialized = true;

      await this.log('telemetry', 'service_initialized', {
        timestamp: new Date().toISOString(),
        version: app.getVersion(),
      });
    } catch (error) {
      console.error('Failed to initialize telemetry service:', error);
    }
  }

  async log(category, event, data = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        category,
        event,
        data,
      };

      const logLine = JSON.stringify(logEntry) + '\n';
      await fs.appendFile(this.logPath, logLine, 'utf8');
    } catch (error) {
      console.error('Failed to write telemetry log:', error);
    }
  }

  async logMigration(migrationId, status, duration = null) {
    await this.log('database', 'migration', {
      migrationId,
      status, // 'started', 'completed', 'failed'
      duration,
    });
  }

  async logMaintenance(operation, status, details = {}) {
    await this.log('maintenance', operation, {
      status, // 'started', 'completed', 'failed'
      ...details,
    });
  }

  async logAppEvent(event, details = {}) {
    await this.log('application', event, details);
  }

  async getRecentLogs(limit = 100) {
    if (!this.initialized || !this.logPath) return [];

    try {
      const content = await fs.readFile(this.logPath, 'utf8');
      const lines = content
        .trim()
        .split('\n')
        .filter(line => line);

      return lines
        .slice(-limit)
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
    } catch (error) {
      console.error('Failed to read telemetry logs:', error);
      return [];
    }
  }
}

// Singleton instance
export const telemetry = new TelemetryService();
