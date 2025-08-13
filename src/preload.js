const { contextBridge, ipcRenderer } = require('electron');

// Theme API
contextBridge.exposeInMainWorld('themeAPI', {
  get: () => ipcRenderer.invoke('get-theme'),
  onThemeChange: callback => ipcRenderer.on('theme-changed', (_, theme) => callback(theme)),
  set: theme => ipcRenderer.send('set-theme', theme),
});

// Database API
contextBridge.exposeInMainWorld('dbAPI', {
  // Projects
  getProjects: options => ipcRenderer.invoke('db-get-projects', options),
  getProject: id => ipcRenderer.invoke('db-get-project', id),
  createProject: data => ipcRenderer.invoke('db-create-project', data),
  updateProject: (id, data) => ipcRenderer.invoke('db-update-project', id, data),
  deleteProject: id => ipcRenderer.invoke('db-delete-project', id),
  searchProjects: query => ipcRenderer.invoke('db-search-projects', query),

  // Devices
  getDevices: options => ipcRenderer.invoke('db-get-devices', options),
  getDevice: id => ipcRenderer.invoke('db-get-device', id),
  createDevice: data => ipcRenderer.invoke('db-create-device', data),
  updateDevice: (id, data) => ipcRenderer.invoke('db-update-device', id, data),
  deleteDevice: id => ipcRenderer.invoke('db-delete-device', id),
  getDevicesByProject: projectId => ipcRenderer.invoke('db-get-devices-by-project', projectId),

  // Versions
  getVersions: options => ipcRenderer.invoke('db-get-versions', options),
  getVersion: id => ipcRenderer.invoke('db-get-version', id),
  createVersion: data => ipcRenderer.invoke('db-create-version', data),
  updateVersion: (id, data) => ipcRenderer.invoke('db-update-version', id, data),
  deleteVersion: id => ipcRenderer.invoke('db-delete-version', id),
  getVersionsByDevice: deviceId => ipcRenderer.invoke('db-get-versions-by-device', deviceId),

  // Markets
  getMarkets: options => ipcRenderer.invoke('db-get-markets', options),
  getMarket: id => ipcRenderer.invoke('db-get-market', id),
  createMarket: data => ipcRenderer.invoke('db-create-market', data),
  updateMarket: (id, data) => ipcRenderer.invoke('db-update-market', id, data),
  deleteMarket: id => ipcRenderer.invoke('db-delete-market', id),
  searchMarkets: query => ipcRenderer.invoke('db-search-markets', query),

  // Licenses
  getLicenses: options => ipcRenderer.invoke('db-get-licenses', options),
  getLicense: id => ipcRenderer.invoke('db-get-license', id),
  createLicense: data => ipcRenderer.invoke('db-create-license', data),
  updateLicense: (id, data) => ipcRenderer.invoke('db-update-license', id, data),
  deleteLicense: id => ipcRenderer.invoke('db-delete-license', id),
  getLicensesByProject: projectId => ipcRenderer.invoke('db-get-licenses-by-project', projectId),

  // Clients
  getClients: options => ipcRenderer.invoke('db-get-clients', options),
  getClientById: id => ipcRenderer.invoke('db-get-client', id),
  createClient: data => ipcRenderer.invoke('db-create-client', data),
  updateClient: (id, data) => ipcRenderer.invoke('db-update-client', id, data),
  deleteClient: id => ipcRenderer.invoke('db-delete-client', id),
  searchClientsByName: (name, options) => ipcRenderer.invoke('db-search-clients', name, options),

  // News
  getNews: options => ipcRenderer.invoke('db-get-news', options),
  getNewsById: id => ipcRenderer.invoke('db-get-news-item', id),
  createNews: data => ipcRenderer.invoke('db-create-news', data),
  updateNews: (id, data) => ipcRenderer.invoke('db-update-news', id, data),
  deleteNews: id => ipcRenderer.invoke('db-delete-news', id),
  getNewsByCategory: (category, options) =>
    ipcRenderer.invoke('db-get-news-by-category', category, options),
  searchNews: (query, options) => ipcRenderer.invoke('db-search-news', query, options),

  // Calendar Events
  getEvents: options => ipcRenderer.invoke('db-get-events', options),
  getEventById: id => ipcRenderer.invoke('db-get-event', id),
  createEvent: data => ipcRenderer.invoke('db-create-event', data),
  updateEvent: (id, data) => ipcRenderer.invoke('db-update-event', id, data),
  deleteEvent: id => ipcRenderer.invoke('db-delete-event', id),
  getEventsByDateRange: (startDate, endDate, options) =>
    ipcRenderer.invoke('db-get-events-by-date-range', startDate, endDate, options),
  getUpcomingEvents: limit => ipcRenderer.invoke('db-get-upcoming-events', limit),

  // Notifications
  getNotifications: options => ipcRenderer.invoke('db-get-notifications', options),
  getUnreadNotifications: options => ipcRenderer.invoke('db-get-unread-notifications', options),
  markNotificationAsRead: id => ipcRenderer.invoke('db-mark-notification-read', id),
  markAllNotificationsAsRead: () => ipcRenderer.invoke('db-mark-all-notifications-read'),
  createNotification: data => ipcRenderer.invoke('db-create-notification', data),
  deleteNotification: id => ipcRenderer.invoke('db-delete-notification', id),
});

contextBridge.exposeInMainWorld('webCrawlerAPI', {
  fetch: url => ipcRenderer.invoke('webCrawler:fetch', url),
});

// Maintenance API
contextBridge.exposeInMainWorld('maintenanceAPI', {
  runDbMaintenance: () => ipcRenderer.invoke('run-db-maintenance'),
  createBackup: () => ipcRenderer.invoke('create-backup'),
  listBackups: () => ipcRenderer.invoke('list-backups'),
  getBackupDirectory: () => ipcRenderer.invoke('get-backup-directory'),
});
