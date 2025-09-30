import React from 'react';
import { createContext, useReducer, useContext, useEffect } from 'react';

const initialState = {
  darkMode: false,
  projects: [],
  devices: [], // Normalized: flat array with project_id references
  versions: [], // Normalized: flat array with device_id references
  allMarkets: [], // All available markets from database
  versionMarkets: {}, // Version-specific markets: { [versionId]: Market[] }
  marketLicenses: [],
  users: [],
  page: 'dashboard',
  pageParent: null,
  currentLevel: 'project', // For ResearchWorkspace navigation state
  // Research workspace selections
  selectedProject: null,
  selectedDevice: null,
  selectedVersion: null,
  selectedMarket: null,
  selectedLicense: null,
  // Interactive checklist state
  checklistItems: [],
  checklistProgress: 0,
  openMenu: null,
  modals: {}, // { modalName: boolean }
  loading: {}, // { key: boolean }
  errors: {}, // { key: string }

  // Revolutionary MCP State
  mcp: {
    initialized: false,
    status: 'disconnected',
    servers: [],
    tools: {},
    autonomousAgents: [],
    analytics: null,
    performanceMetrics: null,
    predictions: [],
    recommendations: [],
    workflowAnalysis: null,
    realTimeEvents: [],
    orchestrationHistory: [],
  },

  // Multi-Modal RAG State
  rag: {
    initialized: false,
    status: 'disconnected',
    documents: [],
    analytics: null,
    queryHistory: [],
    indexingProgress: null,
    realTimeEvents: [],
    statusData: null,
    config: null,
    metrics: {
      documentsIndexed: 0,
      queriesProcessed: 0,
      averageRetrievalTime: 0,
      modalityDistribution: {
        text: 0,
        image: 0,
        audio: 0,
        video: 0,
        structured: 0,
      },
    },
  },
};

function appReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_THEME':
      return { ...state, darkMode: !state.darkMode };
    case 'SET_PROJECTS':
      return { ...state, projects: action.projects };
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.project] };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p => (p.id === action.project.id ? action.project : p)),
      };
    case 'REMOVE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.id),
        devices: state.devices.filter(d => d.project_id !== action.id),
        versions: state.versions.filter(v => {
          const device = state.devices.find(d => d.id === v.device_id);
          return device && device.project_id !== action.id;
        }),
      };
    case 'SET_DEVICES':
      return {
        ...state,
        devices: [
          ...state.devices.filter(d => d.project_id !== action.projectId),
          ...action.devices,
        ],
      };
    case 'ADD_DEVICE':
      return {
        ...state,
        devices: [...state.devices, action.device],
      };
    case 'UPDATE_DEVICE':
      return {
        ...state,
        devices: state.devices.map(d => (d.id === action.device.id ? action.device : d)),
      };
    case 'REMOVE_DEVICE':
      return {
        ...state,
        devices: state.devices.filter(d => d.id !== action.deviceId),
        versions: state.versions.filter(v => v.device_id !== action.deviceId),
      };
    case 'SET_VERSIONS':
      return {
        ...state,
        versions: [
          ...state.versions.filter(v => v.device_id !== action.deviceId),
          ...action.versions,
        ],
      };
    case 'ADD_VERSION':
      return {
        ...state,
        versions: [...state.versions, action.version],
      };
    case 'UPDATE_VERSION':
      return {
        ...state,
        versions: state.versions.map(v => (v.id === action.version.id ? action.version : v)),
      };
    case 'REMOVE_VERSION':
      return {
        ...state,
        versions: state.versions.filter(v => v.id !== action.versionId),
      };
    case 'SET_ALL_MARKETS':
      return { ...state, allMarkets: action.markets };
    case 'SET_VERSION_MARKETS':
      return {
        ...state,
        versionMarkets: {
          ...state.versionMarkets,
          [action.versionId]: action.markets,
        },
      };
    case 'ADD_VERSION_MARKET':
      return {
        ...state,
        versionMarkets: {
          ...state.versionMarkets,
          [action.versionId]: [...(state.versionMarkets[action.versionId] || []), action.market],
        },
      };
    case 'REMOVE_VERSION_MARKET':
      return {
        ...state,
        versionMarkets: {
          ...state.versionMarkets,
          [action.versionId]: (state.versionMarkets[action.versionId] || []).filter(
            m => m.id !== action.marketId
          ),
        },
      };
    case 'CLEAR_VERSION_MARKETS':
      const { [action.versionId]: removedVersionMarkets, ...remainingVersionMarkets } =
        state.versionMarkets;
      return { ...state, versionMarkets: remainingVersionMarkets };
    case 'SET_MARKET_LICENSES':
      return { ...state, marketLicenses: action.marketLicenses };
    case 'SET_PAGE':
      return { ...state, page: action.page, pageParent: action.pageParent };
    case 'SET_CURRENT_LEVEL':
      return { ...state, currentLevel: action.currentLevel };
    case 'SET_SELECTED_PROJECT':
      return { ...state, selectedProject: action.project };
    case 'SET_SELECTED_DEVICE':
      return { ...state, selectedDevice: action.device };
    case 'SET_SELECTED_VERSION':
      return { ...state, selectedVersion: action.version };
    case 'SET_SELECTED_MARKET':
      return { ...state, selectedMarket: action.market };
    case 'SET_SELECTED_LICENSE':
      return { ...state, selectedLicense: action.license };
    case 'CLEAR_SELECTIONS':
      return {
        ...state,
        selectedProject: null,
        selectedDevice: null,
        selectedVersion: null,
        selectedMarket: null,
        selectedLicense: null,
        currentLevel: 'project',
      };
    case 'SET_CHECKLIST_ITEMS':
      return { ...state, checklistItems: action.items };
    case 'UPDATE_CHECKLIST_ITEM':
      return {
        ...state,
        checklistItems: state.checklistItems.map(item =>
          item.id === action.itemId ? { ...item, status: action.status } : item
        ),
      };
    case 'SET_CHECKLIST_PROGRESS':
      return { ...state, checklistProgress: action.progress };
    case 'SET_OPEN_MENU':
      return { ...state, openMenu: action.openMenu };
    case 'SET_MODAL':
      return { ...state, modals: { ...state.modals, [action.modal]: action.value } };
    case 'SET_LOADING':
      return { ...state, loading: { ...state.loading, [action.key]: action.value } };
    case 'SET_ERROR':
      return { ...state, errors: { ...state.errors, [action.key]: action.message } };
    case 'CLEAR_LOADING':
      const { [action.key]: removed, ...remainingLoading } = state.loading;
      return { ...state, loading: remainingLoading };
    case 'CLEAR_ERROR':
      const { [action.key]: removedError, ...remainingErrors } = state.errors;
      return { ...state, errors: remainingErrors };

    // Revolutionary MCP Actions
    case 'MCP_SET_INITIALIZED':
      return {
        ...state,
        mcp: {
          ...state.mcp,
          initialized: action.initialized,
          status: action.initialized ? 'connected' : 'disconnected',
        },
      };

    case 'MCP_SET_STATUS':
      return {
        ...state,
        mcp: { ...state.mcp, status: action.status },
      };

    case 'MCP_SET_SERVERS':
      return {
        ...state,
        mcp: { ...state.mcp, servers: action.servers },
      };

    case 'MCP_SET_TOOLS':
      return {
        ...state,
        mcp: { ...state.mcp, tools: action.tools },
      };

    case 'MCP_SET_AGENTS':
      return {
        ...state,
        mcp: { ...state.mcp, autonomousAgents: action.agents },
      };

    case 'MCP_SET_ANALYTICS':
      return {
        ...state,
        mcp: { ...state.mcp, analytics: action.analytics },
      };

    case 'MCP_SET_PERFORMANCE_METRICS':
      return {
        ...state,
        mcp: { ...state.mcp, performanceMetrics: action.metrics },
      };

    case 'MCP_SET_PREDICTIONS':
      return {
        ...state,
        mcp: { ...state.mcp, predictions: action.predictions },
      };

    case 'MCP_SET_RECOMMENDATIONS':
      return {
        ...state,
        mcp: { ...state.mcp, recommendations: action.recommendations },
      };

    case 'MCP_SET_WORKFLOW_ANALYSIS':
      return {
        ...state,
        mcp: { ...state.mcp, workflowAnalysis: action.analysis },
      };

    case 'MCP_ADD_REAL_TIME_EVENT':
      return {
        ...state,
        mcp: {
          ...state.mcp,
          realTimeEvents: [
            action.event,
            ...state.mcp.realTimeEvents.slice(0, 99), // Keep last 100 events
          ],
        },
      };

    case 'MCP_ADD_ORCHESTRATION_RESULT':
      return {
        ...state,
        mcp: {
          ...state.mcp,
          orchestrationHistory: [
            action.result,
            ...state.mcp.orchestrationHistory.slice(0, 49), // Keep last 50 results
          ],
        },
      };

    case 'MCP_CLEAR_EVENTS':
      return {
        ...state,
        mcp: { ...state.mcp, realTimeEvents: [] },
      };

    // Multi-Modal RAG Actions
    case 'RAG_SET_INITIALIZED':
      return {
        ...state,
        rag: {
          ...state.rag,
          initialized: action.initialized,
          status: action.initialized ? 'connected' : 'disconnected',
        },
      };

    case 'RAG_SET_STATUS':
      return {
        ...state,
        rag: { ...state.rag, status: action.status },
      };

    case 'RAG_SET_DOCUMENTS':
      return {
        ...state,
        rag: { ...state.rag, documents: action.documents },
      };

    case 'RAG_SET_ANALYTICS':
      return {
        ...state,
        rag: { ...state.rag, analytics: action.analytics },
      };

    case 'RAG_SET_STATUS_DATA':
      return {
        ...state,
        rag: { ...state.rag, statusData: action.statusData },
      };

    case 'RAG_SET_METRICS':
      return {
        ...state,
        rag: { ...state.rag, metrics: action.metrics },
      };

    case 'RAG_ADD_QUERY_RESULT':
      return {
        ...state,
        rag: {
          ...state.rag,
          queryHistory: [
            action.result,
            ...state.rag.queryHistory.slice(0, 99), // Keep last 100 queries
          ],
        },
      };

    case 'RAG_SET_INDEXING_PROGRESS':
      return {
        ...state,
        rag: { ...state.rag, indexingProgress: action.progress },
      };

    case 'RAG_CLEAR_INDEXING_PROGRESS':
      return {
        ...state,
        rag: { ...state.rag, indexingProgress: null },
      };

    case 'RAG_ADD_REAL_TIME_EVENT':
      return {
        ...state,
        rag: {
          ...state.rag,
          realTimeEvents: [
            action.event,
            ...state.rag.realTimeEvents.slice(0, 99), // Keep last 100 events
          ],
        },
      };

    case 'RAG_INCREMENT_DOCUMENT_COUNT':
      return {
        ...state,
        rag: {
          ...state.rag,
          metrics: {
            ...state.rag.metrics,
            documentsIndexed: state.rag.metrics.documentsIndexed + 1,
          },
        },
      };

    case 'RAG_UPDATE_CONFIG':
      return {
        ...state,
        rag: { ...state.rag, config: action.config },
      };

    case 'RAG_CLEAR_EVENTS':
      return {
        ...state,
        rag: { ...state.rag, realTimeEvents: [] },
      };

    default:
      return state;
  }
}

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Add dark mode effect
  useEffect(() => {
    const root = document.getElementById('root');
    document.body.classList.remove('light-mode', 'dark-mode');
    document.documentElement.classList.remove('light-mode', 'dark-mode');
    if (root) root.classList.remove('light-mode', 'dark-mode');
    if (state.darkMode) {
      document.body.classList.add('dark-mode');
      document.documentElement.classList.add('dark-mode');
      if (root) root.classList.add('dark-mode');
    } else {
      document.body.classList.add('light-mode');
      document.documentElement.classList.add('light-mode');
      if (root) root.classList.add('light-mode');
    }
  }, [state.darkMode]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
