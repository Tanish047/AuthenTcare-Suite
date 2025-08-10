export const PLUGIN_EVENTS = {
  // App lifecycle events
  APP_STARTED: 'app:started',
  APP_CLOSING: 'app:closing',
  
  // Data events
  DATA_CREATED: 'data:created',
  DATA_UPDATED: 'data:updated',
  DATA_DELETED: 'data:deleted',
  
  // Client events
  CLIENT_ADDED: 'client:added',
  CLIENT_UPDATED: 'client:updated',
  CLIENT_DELETED: 'client:deleted',
  
  // Calendar events
  EVENT_CREATED: 'calendar:eventCreated',
  EVENT_UPDATED: 'calendar:eventUpdated',
  EVENT_DELETED: 'calendar:eventDeleted',
  
  // News events
  NEWS_ADDED: 'news:added',
  NEWS_UPDATED: 'news:updated',
  NEWS_DELETED: 'news:deleted',
  
  // Notification events
  NOTIFICATION_CREATED: 'notification:created',
  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_DELETED: 'notification:deleted',
  
  // User events
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  USER_SETTINGS_CHANGED: 'user:settingsChanged',
  
  // System events
  SYSTEM_ERROR: 'system:error',
  SYSTEM_WARNING: 'system:warning',
  SYSTEM_INFO: 'system:info',
  
  // Plugin events
  PLUGIN_ENABLED: 'plugin:enabled',
  PLUGIN_DISABLED: 'plugin:disabled',
  PLUGIN_ERROR: 'plugin:error',
  PLUGIN_INITIALIZED: 'plugin:initialized',

  // ProAnalyser events
  ANALYSIS_STARTED: 'analysis:started',
  ANALYSIS_PROGRESS: 'analysis:progress',
  ANALYSIS_COMPLETED: 'analysis:completed',
  ANALYSIS_ERROR: 'analysis:error',
  ANALYSIS_CANCELLED: 'analysis:cancelled',
  CONTEXT_CHANGED: 'context:changed',
  REPORT_GENERATED: 'report:generated',

  // Competitor Analysis events
  COMPETITOR_SEARCH_STARTED: 'competitor:searchStarted',
  COMPETITOR_DATA_FOUND: 'competitor:dataFound',
  COMPETITOR_ANALYSIS_COMPLETED: 'competitor:analysisCompleted',

  // Timeline events
  TIMELINE_GENERATION_STARTED: 'timeline:generationStarted',
  TIMELINE_UPDATED: 'timeline:updated',
  TIMELINE_COMPLETED: 'timeline:completed',

  // Cost Estimation events
  COST_CALCULATION_STARTED: 'cost:calculationStarted',
  COST_UPDATED: 'cost:updated',
  COST_COMPLETED: 'cost:completed',

  // Pathway events
  PATHWAY_GENERATION_STARTED: 'pathway:generationStarted',
  PATHWAY_UPDATED: 'pathway:updated',
  PATHWAY_COMPLETED: 'pathway:completed',

  // Strategy events
  STRATEGY_ANALYSIS_STARTED: 'strategy:analysisStarted',
  STRATEGY_UPDATED: 'strategy:updated',
  STRATEGY_COMPLETED: 'strategy:completed',

  // Regulatory events
  REGULATORY_ANALYSIS_STARTED: 'regulatory:analysisStarted',
  REGULATORY_MARKET_SELECTED: 'regulatory:marketSelected',
  REGULATORY_COMPLETED: 'regulatory:completed',

  // Predicate Device events
  PREDICATE_SEARCH_STARTED: 'predicate:searchStarted',
  PREDICATE_FOUND: 'predicate:found',
  PREDICATE_REPORT_GENERATED: 'predicate:reportGenerated',

  // Master File events
  MASTERFILE_GENERATION_STARTED: 'masterfile:generationStarted',
  MASTERFILE_SECTION_COMPLETED: 'masterfile:sectionCompleted',
  MASTERFILE_COMPLETED: 'masterfile:completed',

  // QMS events
  QMS_ANALYSIS_STARTED: 'qms:analysisStarted',
  QMS_REQUIREMENTS_UPDATED: 'qms:requirementsUpdated',
  QMS_COMPLETED: 'qms:completed',

  // PMS events
  PMS_ANALYSIS_STARTED: 'pms:analysisStarted',
  PMS_PLAN_UPDATED: 'pms:planUpdated',
  PMS_COMPLETED: 'pms:completed'
};
