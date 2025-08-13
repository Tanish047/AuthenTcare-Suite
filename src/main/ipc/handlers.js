import { ipcMain } from 'electron';
import './webCrawler.js';

export default class IPCHandler {
  constructor(db) {
    this.db = db;
    this.setupHandlers();
  }

  setupHandlers() {
    // Projects
    ipcMain.handle('db-get-projects', this.getProjects.bind(this));
    ipcMain.handle('db-get-project', this.getProject.bind(this));
    ipcMain.handle('db-create-project', this.createProject.bind(this));
    ipcMain.handle('db-update-project', this.updateProject.bind(this));
    ipcMain.handle('db-delete-project', this.deleteProject.bind(this));
    ipcMain.handle('db-search-projects', this.searchProjects.bind(this));

    // Devices
    ipcMain.handle('db-get-devices', this.getDevices.bind(this));
    ipcMain.handle('db-get-device', this.getDevice.bind(this));
    ipcMain.handle('db-create-device', this.createDevice.bind(this));
    ipcMain.handle('db-update-device', this.updateDevice.bind(this));
    ipcMain.handle('db-delete-device', this.deleteDevice.bind(this));
    ipcMain.handle('db-get-devices-by-project', this.getDevicesByProject.bind(this));

    // Versions
    ipcMain.handle('db-get-versions', this.getVersions.bind(this));
    ipcMain.handle('db-get-version', this.getVersion.bind(this));
    ipcMain.handle('db-create-version', this.createVersion.bind(this));
    ipcMain.handle('db-update-version', this.updateVersion.bind(this));
    ipcMain.handle('db-delete-version', this.deleteVersion.bind(this));
    ipcMain.handle('db-get-versions-by-device', this.getVersionsByDevice.bind(this));

    // Markets
    ipcMain.handle('db-get-markets', this.getMarkets.bind(this));
    ipcMain.handle('db-get-market', this.getMarket.bind(this));
    ipcMain.handle('db-create-market', this.createMarket.bind(this));
    ipcMain.handle('db-update-market', this.updateMarket.bind(this));
    ipcMain.handle('db-delete-market', this.deleteMarket.bind(this));
    ipcMain.handle('db-search-markets', this.searchMarkets.bind(this));

    // Licenses
    ipcMain.handle('db-get-licenses', this.getLicenses.bind(this));
    ipcMain.handle('db-get-license', this.getLicense.bind(this));
    ipcMain.handle('db-create-license', this.createLicense.bind(this));
    ipcMain.handle('db-update-license', this.updateLicense.bind(this));
    ipcMain.handle('db-delete-license', this.deleteLicense.bind(this));
    ipcMain.handle('db-get-licenses-by-project', this.getLicensesByProject.bind(this));

    // Existing handlers (clients, news, events, notifications)
    this.setupExistingHandlers();
  }

  setupExistingHandlers() {
    // Clients
    ipcMain.handle('db-get-clients', this.getClients.bind(this));
    ipcMain.handle('db-get-client', this.getClient.bind(this));
    ipcMain.handle('db-create-client', this.createClient.bind(this));
    ipcMain.handle('db-update-client', this.updateClient.bind(this));
    ipcMain.handle('db-delete-client', this.deleteClient.bind(this));
    ipcMain.handle('db-search-clients', this.searchClients.bind(this));

    // News
    ipcMain.handle('db-get-news', this.getNews.bind(this));
    ipcMain.handle('db-get-news-item', this.getNewsItem.bind(this));
    ipcMain.handle('db-create-news', this.createNews.bind(this));
    ipcMain.handle('db-update-news', this.updateNews.bind(this));
    ipcMain.handle('db-delete-news', this.deleteNews.bind(this));
    ipcMain.handle('db-get-news-by-category', this.getNewsByCategory.bind(this));
    ipcMain.handle('db-search-news', this.searchNews.bind(this));

    // Events
    ipcMain.handle('db-get-events', this.getEvents.bind(this));
    ipcMain.handle('db-get-event', this.getEvent.bind(this));
    ipcMain.handle('db-create-event', this.createEvent.bind(this));
    ipcMain.handle('db-update-event', this.updateEvent.bind(this));
    ipcMain.handle('db-delete-event', this.deleteEvent.bind(this));
    ipcMain.handle('db-get-events-by-date-range', this.getEventsByDateRange.bind(this));
    ipcMain.handle('db-get-upcoming-events', this.getUpcomingEvents.bind(this));

    // Notifications
    ipcMain.handle('db-get-notifications', this.getNotifications.bind(this));
    ipcMain.handle('db-get-unread-notifications', this.getUnreadNotifications.bind(this));
    ipcMain.handle('db-mark-notification-read', this.markNotificationAsRead.bind(this));
    ipcMain.handle('db-mark-all-notifications-read', this.markAllNotificationsAsRead.bind(this));
    ipcMain.handle('db-create-notification', this.createNotification.bind(this));
    ipcMain.handle('db-delete-notification', this.deleteNotification.bind(this));
  }

  // Projects handlers
  async getProjects(event, options = {}) {
    try {
      const { limit = 100, offset = 0, status = 'active' } = options;
      const projects = await this.db.all(
        'SELECT * FROM projects WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [status, limit, offset]
      );
      return { data: projects };
    } catch (error) {
      console.error('Error getting projects:', error);
      throw error;
    }
  }

  async getProject(event, id) {
    try {
      const project = await this.db.get('SELECT * FROM projects WHERE id = ?', id);
      return project;
    } catch (error) {
      console.error('Error getting project:', error);
      throw error;
    }
  }

  async createProject(event, data) {
    try {
      const { name, description = '' } = data;
      const result = await this.db.run('INSERT INTO projects (name, description) VALUES (?, ?)', [
        name,
        description,
      ]);
      const project = await this.db.get('SELECT * FROM projects WHERE id = ?', result.lastID);
      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async updateProject(event, id, data) {
    try {
      const { name, description } = data;
      await this.db.run(
        'UPDATE projects SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, description, id]
      );
      const project = await this.db.get('SELECT * FROM projects WHERE id = ?', id);
      return project;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  async deleteProject(event, id) {
    try {
      await this.db.run('DELETE FROM projects WHERE id = ?', id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  async searchProjects(event, query) {
    try {
      const projects = await this.db.all(
        'SELECT * FROM projects WHERE name LIKE ? OR description LIKE ? ORDER BY created_at DESC',
        [`%${query}%`, `%${query}%`]
      );
      return { data: projects };
    } catch (error) {
      console.error('Error searching projects:', error);
      throw error;
    }
  }

  // Devices handlers
  async getDevices(event, options = {}) {
    try {
      const { limit = 100, offset = 0, status = 'active' } = options;
      const devices = await this.db.all(
        'SELECT * FROM devices WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [status, limit, offset]
      );
      return { data: devices };
    } catch (error) {
      console.error('Error getting devices:', error);
      throw error;
    }
  }

  async getDevice(event, id) {
    try {
      const device = await this.db.get('SELECT * FROM devices WHERE id = ?', id);
      return device;
    } catch (error) {
      console.error('Error getting device:', error);
      throw error;
    }
  }

  async createDevice(event, data) {
    try {
      const { project_id, name, type = '', specifications = '' } = data;
      const result = await this.db.run(
        'INSERT INTO devices (project_id, name, type, specifications) VALUES (?, ?, ?, ?)',
        [project_id, name, type, specifications]
      );
      const device = await this.db.get('SELECT * FROM devices WHERE id = ?', result.lastID);
      return device;
    } catch (error) {
      console.error('Error creating device:', error);
      throw error;
    }
  }

  async updateDevice(event, id, data) {
    try {
      const { name, type, specifications } = data;
      await this.db.run(
        'UPDATE devices SET name = ?, type = ?, specifications = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, type, specifications, id]
      );
      const device = await this.db.get('SELECT * FROM devices WHERE id = ?', id);
      return device;
    } catch (error) {
      console.error('Error updating device:', error);
      throw error;
    }
  }

  async deleteDevice(event, id) {
    try {
      await this.db.run('DELETE FROM devices WHERE id = ?', id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting device:', error);
      throw error;
    }
  }

  async getDevicesByProject(event, projectId) {
    try {
      const devices = await this.db.all(
        'SELECT * FROM devices WHERE project_id = ? AND status = "active" ORDER BY created_at DESC',
        [projectId]
      );
      return { data: devices };
    } catch (error) {
      console.error('Error getting devices by project:', error);
      throw error;
    }
  }

  // Versions handlers
  async getVersions(event, options = {}) {
    try {
      const { limit = 100, offset = 0, status = 'active' } = options;
      const versions = await this.db.all(
        'SELECT * FROM versions WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [status, limit, offset]
      );
      return { data: versions };
    } catch (error) {
      console.error('Error getting versions:', error);
      throw error;
    }
  }

  async getVersion(event, id) {
    try {
      const version = await this.db.get('SELECT * FROM versions WHERE id = ?', id);
      return version;
    } catch (error) {
      console.error('Error getting version:', error);
      throw error;
    }
  }

  async createVersion(event, data) {
    try {
      const { device_id, version_number, release_date = null, changes = '' } = data;
      const result = await this.db.run(
        'INSERT INTO versions (device_id, version_number, release_date, changes) VALUES (?, ?, ?, ?)',
        [device_id, version_number, release_date, changes]
      );
      const version = await this.db.get('SELECT * FROM versions WHERE id = ?', result.lastID);
      return version;
    } catch (error) {
      console.error('Error creating version:', error);
      throw error;
    }
  }

  async updateVersion(event, id, data) {
    try {
      const { version_number, release_date, changes } = data;
      await this.db.run(
        'UPDATE versions SET version_number = ?, release_date = ?, changes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [version_number, release_date, changes, id]
      );
      const version = await this.db.get('SELECT * FROM versions WHERE id = ?', id);
      return version;
    } catch (error) {
      console.error('Error updating version:', error);
      throw error;
    }
  }

  async deleteVersion(event, id) {
    try {
      await this.db.run('DELETE FROM versions WHERE id = ?', id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting version:', error);
      throw error;
    }
  }

  async getVersionsByDevice(event, deviceId) {
    try {
      const versions = await this.db.all(
        'SELECT * FROM versions WHERE device_id = ? AND status = "active" ORDER BY created_at DESC',
        [deviceId]
      );
      return { data: versions };
    } catch (error) {
      console.error('Error getting versions by device:', error);
      throw error;
    }
  }

  // Markets handlers
  async getMarkets(event, options = {}) {
    try {
      const { limit = 100, offset = 0, status = 'active' } = options;
      const markets = await this.db.all(
        'SELECT * FROM markets WHERE status = ? ORDER BY name ASC LIMIT ? OFFSET ?',
        [status, limit, offset]
      );
      return { data: markets };
    } catch (error) {
      console.error('Error getting markets:', error);
      throw error;
    }
  }

  async getMarket(event, id) {
    try {
      const market = await this.db.get('SELECT * FROM markets WHERE id = ?', id);
      return market;
    } catch (error) {
      console.error('Error getting market:', error);
      throw error;
    }
  }

  async createMarket(event, data) {
    try {
      const { name, region = '', regulatory_body = '', requirements = '' } = data;
      const result = await this.db.run(
        'INSERT INTO markets (name, region, regulatory_body, requirements) VALUES (?, ?, ?, ?)',
        [name, region, regulatory_body, requirements]
      );
      const market = await this.db.get('SELECT * FROM markets WHERE id = ?', result.lastID);
      return market;
    } catch (error) {
      console.error('Error creating market:', error);
      throw error;
    }
  }

  async updateMarket(event, id, data) {
    try {
      const { name, region, regulatory_body, requirements } = data;
      await this.db.run(
        'UPDATE markets SET name = ?, region = ?, regulatory_body = ?, requirements = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, region, regulatory_body, requirements, id]
      );
      const market = await this.db.get('SELECT * FROM markets WHERE id = ?', id);
      return market;
    } catch (error) {
      console.error('Error updating market:', error);
      throw error;
    }
  }

  async deleteMarket(event, id) {
    try {
      await this.db.run('DELETE FROM markets WHERE id = ?', id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting market:', error);
      throw error;
    }
  }

  async searchMarkets(event, query) {
    try {
      const markets = await this.db.all(
        'SELECT * FROM markets WHERE name LIKE ? OR region LIKE ? OR regulatory_body LIKE ? ORDER BY name ASC',
        [`%${query}%`, `%${query}%`, `%${query}%`]
      );
      return { data: markets };
    } catch (error) {
      console.error('Error searching markets:', error);
      throw error;
    }
  }

  // Licenses handlers
  async getLicenses(event, options = {}) {
    try {
      const { limit = 100, offset = 0 } = options;
      const licenses = await this.db.all(
        `SELECT l.*, p.name as project_name, m.name as market_name, v.version_number 
         FROM licenses l 
         JOIN projects p ON l.project_id = p.id 
         JOIN markets m ON l.market_id = m.id 
         JOIN versions v ON l.version_id = v.id 
         ORDER BY l.created_at DESC LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      return { data: licenses };
    } catch (error) {
      console.error('Error getting licenses:', error);
      throw error;
    }
  }

  async getLicense(event, id) {
    try {
      const license = await this.db.get(
        `SELECT l.*, p.name as project_name, m.name as market_name, v.version_number 
         FROM licenses l 
         JOIN projects p ON l.project_id = p.id 
         JOIN markets m ON l.market_id = m.id 
         JOIN versions v ON l.version_id = v.id 
         WHERE l.id = ?`,
        [id]
      );
      return license;
    } catch (error) {
      console.error('Error getting license:', error);
      throw error;
    }
  }

  async createLicense(event, data) {
    try {
      const {
        project_id,
        market_id,
        version_id,
        license_number = '',
        status = 'pending',
        issued_date = null,
        expiry_date = null,
        notes = '',
      } = data;
      const result = await this.db.run(
        'INSERT INTO licenses (project_id, market_id, version_id, license_number, status, issued_date, expiry_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [project_id, market_id, version_id, license_number, status, issued_date, expiry_date, notes]
      );
      const license = await this.getLicense(null, result.lastID);
      return license;
    } catch (error) {
      console.error('Error creating license:', error);
      throw error;
    }
  }

  async updateLicense(event, id, data) {
    try {
      const { license_number, status, issued_date, expiry_date, notes } = data;
      await this.db.run(
        'UPDATE licenses SET license_number = ?, status = ?, issued_date = ?, expiry_date = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [license_number, status, issued_date, expiry_date, notes, id]
      );
      const license = await this.getLicense(null, id);
      return license;
    } catch (error) {
      console.error('Error updating license:', error);
      throw error;
    }
  }

  async deleteLicense(event, id) {
    try {
      await this.db.run('DELETE FROM licenses WHERE id = ?', id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting license:', error);
      throw error;
    }
  }

  async getLicensesByProject(event, projectId) {
    try {
      const licenses = await this.db.all(
        `SELECT l.*, m.name as market_name, v.version_number 
         FROM licenses l 
         JOIN markets m ON l.market_id = m.id 
         JOIN versions v ON l.version_id = v.id 
         WHERE l.project_id = ? 
         ORDER BY l.created_at DESC`,
        [projectId]
      );
      return { data: licenses };
    } catch (error) {
      console.error('Error getting licenses by project:', error);
      throw error;
    }
  }

  // Existing handlers (placeholder implementations)
  async getClients(event, options) {
    return { data: [] };
  }
  async getClient(event, id) {
    return null;
  }
  async createClient(event, data) {
    return null;
  }
  async updateClient(event, id, data) {
    return null;
  }
  async deleteClient(event, id) {
    return { success: true };
  }
  async searchClients(event, query) {
    return { data: [] };
  }

  async getNews(event, options) {
    return { data: [] };
  }
  async getNewsItem(event, id) {
    return null;
  }
  async createNews(event, data) {
    return null;
  }
  async updateNews(event, id, data) {
    return null;
  }
  async deleteNews(event, id) {
    return { success: true };
  }
  async getNewsByCategory(event, category) {
    return { data: [] };
  }
  async searchNews(event, query) {
    return { data: [] };
  }

  async getEvents(event, options) {
    return { data: [] };
  }
  async getEvent(event, id) {
    return null;
  }
  async createEvent(event, data) {
    return null;
  }
  async updateEvent(event, id, data) {
    return null;
  }
  async deleteEvent(event, id) {
    return { success: true };
  }
  async getEventsByDateRange(event, startDate, endDate) {
    return { data: [] };
  }
  async getUpcomingEvents(event, limit) {
    return { data: [] };
  }

  async getNotifications(event, options) {
    return { data: [] };
  }
  async getUnreadNotifications(event, options) {
    return { data: [] };
  }
  async markNotificationAsRead(event, id) {
    return { success: true };
  }
  async markAllNotificationsAsRead(event) {
    return { success: true };
  }
  async createNotification(event, data) {
    return null;
  }
  async deleteNotification(event, id) {
    return { success: true };
  }
}
