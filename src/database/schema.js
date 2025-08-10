// Database schema for AuthenTcare Suite
export const schema = {
  // Projects table
  projects: `
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

  // Devices table
  devices: `
    CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT,
      specifications TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `,

  // Versions table
  versions: `
    CREATE TABLE IF NOT EXISTS versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id INTEGER NOT NULL,
      version_number TEXT NOT NULL,
      release_date DATE,
      changes TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
    )
  `,

  // Markets table
  markets: `
    CREATE TABLE IF NOT EXISTS markets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      region TEXT,
      regulatory_body TEXT,
      requirements TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

  // Licenses table
  licenses: `
    CREATE TABLE IF NOT EXISTS licenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      market_id INTEGER NOT NULL,
      version_id INTEGER NOT NULL,
      license_number TEXT,
      status TEXT DEFAULT 'pending',
      issued_date DATE,
      expiry_date DATE,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (market_id) REFERENCES markets(id) ON DELETE CASCADE,
      FOREIGN KEY (version_id) REFERENCES versions(id) ON DELETE CASCADE
    )
  `,

  // Clients table (existing)
  clients: `
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      company TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

  // News table (existing)
  news: `
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      category TEXT,
      source TEXT,
      published_date DATE,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

  // Events table (existing)
  events: `
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      start_date DATETIME,
      end_date DATETIME,
      type TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

  // Notifications table (existing)
  notifications: `
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      message TEXT,
      type TEXT DEFAULT 'info',
      read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `
};

// Indexes for better performance
export const indexes = [
  'CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name)',
  'CREATE INDEX IF NOT EXISTS idx_devices_project_id ON devices(project_id)',
  'CREATE INDEX IF NOT EXISTS idx_versions_device_id ON versions(device_id)',
  'CREATE INDEX IF NOT EXISTS idx_licenses_project_id ON licenses(project_id)',
  'CREATE INDEX IF NOT EXISTS idx_licenses_market_id ON licenses(market_id)',
  'CREATE INDEX IF NOT EXISTS idx_licenses_version_id ON licenses(version_id)',
  'CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name)',
  'CREATE INDEX IF NOT EXISTS idx_news_category ON news(category)',
  'CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date)',
  'CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read)'
]; 