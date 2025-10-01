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

  // Version Markets
  getVersionMarkets: versionId => ipcRenderer.invoke('db-get-version-markets', versionId),
  addVersionMarket: (versionId, marketId) =>
    ipcRenderer.invoke('db-add-version-market', versionId, marketId),
  removeVersionMarket: (versionId, marketId) =>
    ipcRenderer.invoke('db-remove-version-market', versionId, marketId),
  getAvailableMarketsForVersion: versionId =>
    ipcRenderer.invoke('db-get-available-markets-for-version', versionId),

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

// Telemetry API
contextBridge.exposeInMainWorld('telemetryAPI', {
  logError: (category, data) => ipcRenderer.invoke('telemetry-log-error', category, data),
  logEvent: (category, event, data) =>
    ipcRenderer.invoke('telemetry-log-event', category, event, data),
  logPerformance: (operation, duration, metadata) =>
    ipcRenderer.invoke('telemetry-log-performance', operation, duration, metadata),
});

// User Database API
contextBridge.exposeInMainWorld('userDatabaseAPI', {
  // File operations
  getFiles: (path = '') => ipcRenderer.invoke('user-db-get-files', path),
  uploadFiles: (filePaths, targetPath = '') =>
    ipcRenderer.invoke('user-db-upload-files', filePaths, targetPath),
  deleteItems: itemPaths => ipcRenderer.invoke('user-db-delete-items', itemPaths),
  copyItems: (sourcePaths, targetPath) =>
    ipcRenderer.invoke('user-db-copy-items', sourcePaths, targetPath),
  cutItems: (sourcePaths, targetPath) =>
    ipcRenderer.invoke('user-db-cut-items', sourcePaths, targetPath),
  pasteItems: targetPath => ipcRenderer.invoke('user-db-paste-items', targetPath),

  // Folder operations
  createFolder: (path, name) => ipcRenderer.invoke('user-db-create-folder', path, name),
  renameItem: (oldPath, newName) => ipcRenderer.invoke('user-db-rename-item', oldPath, newName),

  // Dialog operations
  openFileDialog: options => ipcRenderer.invoke('user-db-open-file-dialog', options),

  // Upload progress
  onUploadProgress: callback => {
    ipcRenderer.on('user-db-upload-progress', (_, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('user-db-upload-progress');
  },
});

// Multi-Modal RAG API - Advanced Retrieval-Augmented Generation
contextBridge.exposeInMainWorld('ragAPI', {
  // Core RAG operations
  initialize: config => ipcRenderer.invoke('rag-initialize', config),
  indexDocument: (filePath, metadata) =>
    ipcRenderer.invoke('rag-index-document', filePath, metadata),
  indexFolder: (folderPath, options) => ipcRenderer.invoke('rag-index-folder', folderPath, options),
  query: (queryText, options) => ipcRenderer.invoke('rag-query', queryText, options),
  getStatus: () => ipcRenderer.invoke('rag-get-status'),

  // Document management
  listDocuments: options => ipcRenderer.invoke('rag-list-documents', options),
  removeDocument: documentId => ipcRenderer.invoke('rag-remove-document', documentId),
  updateDocument: (documentId, metadata) =>
    ipcRenderer.invoke('rag-update-document', documentId, metadata),

  // Search and retrieval
  semanticSearch: (query, options) => ipcRenderer.invoke('rag-semantic-search', query, options),
  hybridSearch: (query, options) => ipcRenderer.invoke('rag-hybrid-search', query, options),
  crossModalSearch: (query, options) =>
    ipcRenderer.invoke('rag-cross-modal-search', query, options),

  // Analytics and insights
  getAnalytics: timeRange => ipcRenderer.invoke('rag-get-analytics', timeRange),
  getSimilarDocuments: (documentId, options) =>
    ipcRenderer.invoke('rag-get-similar-documents', documentId, options),
  getDocumentClusters: options => ipcRenderer.invoke('rag-get-document-clusters', options),

  // Configuration
  updateConfig: config => ipcRenderer.invoke('rag-update-config', config),
  getConfig: () => ipcRenderer.invoke('rag-get-config'),

  // File operations
  selectFiles: options => ipcRenderer.invoke('rag-select-files', options),
  selectFolder: options => ipcRenderer.invoke('rag-select-folder', options),

  // Event listeners for real-time updates
  onInitialized: callback => {
    ipcRenderer.on('rag-initialized', callback);
    return () => ipcRenderer.removeAllListeners('rag-initialized');
  },

  onDocumentIndexed: callback => {
    ipcRenderer.on('rag-document-indexed', (_, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('rag-document-indexed');
  },

  onQueryProcessed: callback => {
    ipcRenderer.on('rag-query-processed', (_, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('rag-query-processed');
  },

  onIndexingProgress: callback => {
    ipcRenderer.on('rag-indexing-progress', (_, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('rag-indexing-progress');
  },

  onMetricsUpdated: callback => {
    ipcRenderer.on('rag-metrics-updated', (_, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('rag-metrics-updated');
  },

  onError: callback => {
    ipcRenderer.on('rag-error', (_, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('rag-error');
  },
});

// Revolutionary MCP API - The most advanced MCP interface ever
contextBridge.exposeInMainWorld('mcpAPI', {
  // Core MCP operations
  initialize: () => ipcRenderer.invoke('mcp-initialize'),
  callTool: (server, tool, params, context) =>
    ipcRenderer.invoke('mcp-call-tool', server, tool, params, context),
  orchestrate: (tasks, options) => ipcRenderer.invoke('mcp-orchestrate', tasks, options),

  // Status and discovery
  getStatus: () => ipcRenderer.invoke('mcp-get-status'),
  getServers: () => ipcRenderer.invoke('mcp-get-servers'),
  getTools: serverName => ipcRenderer.invoke('mcp-get-tools', serverName),

  // AI-powered features
  predictNextActions: context => ipcRenderer.invoke('mcp-predict-next-actions', context),
  getRecommendations: context => ipcRenderer.invoke('mcp-get-recommendations', context),
  analyzeWorkflow: workflowData => ipcRenderer.invoke('mcp-analyze-workflow', workflowData),

  // Autonomous agents
  getAutonomousAgents: () => ipcRenderer.invoke('mcp-get-agents'),
  controlAgent: (agentName, action) => ipcRenderer.invoke('mcp-control-agent', agentName, action),

  // Configuration
  updateConfig: config => ipcRenderer.invoke('mcp-update-config', config),
  reloadConfig: () => ipcRenderer.invoke('mcp-reload-config'),

  // Analytics and monitoring
  getAnalytics: timeRange => ipcRenderer.invoke('mcp-get-analytics', timeRange),
  getPerformanceMetrics: () => ipcRenderer.invoke('mcp-get-performance-metrics'),

  // Event listeners for real-time updates
  onInitialized: callback => {
    ipcRenderer.on('mcp-initialized', callback);
    return () => ipcRenderer.removeAllListeners('mcp-initialized');
  },

  onToolSuccess: callback => {
    ipcRenderer.on('mcp-tool-success', (_, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('mcp-tool-success');
  },

  onToolError: callback => {
    ipcRenderer.on('mcp-tool-error', (_, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('mcp-tool-error');
  },

  onServerHealthChange: callback => {
    const healthHandler = (_, data) => callback({ ...data, type: 'unhealthy' });
    const recoveryHandler = (_, data) => callback({ ...data, type: 'recovered' });

    ipcRenderer.on('mcp-server-unhealthy', healthHandler);
    ipcRenderer.on('mcp-server-recovered', recoveryHandler);

    return () => {
      ipcRenderer.removeAllListeners('mcp-server-unhealthy');
      ipcRenderer.removeAllListeners('mcp-server-recovered');
    };
  },

  onAgentExecution: callback => {
    ipcRenderer.on('mcp-agent-executed', (_, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('mcp-agent-executed');
  },

  onOrchestrationComplete: callback => {
    ipcRenderer.on('mcp-orchestration-complete', (_, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('mcp-orchestration-complete');
  },
});
