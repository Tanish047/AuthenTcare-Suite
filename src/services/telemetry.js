import fs from 'fs/promises';
import path from 'path';

// Safe electron import that works in tests too
let app = null;

async function getElectronApp() {
  if (app) return app;

  try {
    if (typeof process !== 'undefined' && process.versions?.electron) {
      const { app: electronApp } = await import('electron');
      app = electronApp;
    } else {
      // Running outside electron context (like in tests) - use mock
      app = {
        getPath: name => {
          if (name === 'userData') return './test-data';
          return './';
        },
        getName: () => 'AuthenTcare Suite',
        getVersion: () => '1.0.0',
      };
    }
  } catch (error) {
    // Fallback mock
    app = {
      getPath: name => {
        if (name === 'userData') return './test-data';
        return './';
      },
      getName: () => 'AuthenTcare Suite',
      getVersion: () => '1.0.0',
    };
  }

  return app;
}

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
      const electronApp = await getElectronApp();
      const userDataPath = electronApp.getPath('userData');
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
