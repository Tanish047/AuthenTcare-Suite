import React from 'react';
import { createContext, useReducer, useContext, useEffect } from 'react';

const initialState = {
  darkMode: false,
  projects: [],
  devices: {}, // { [projectId]: Device[] }
  versions: {}, // { [deviceId]: Version[] }
  targetMarkets: [],
  marketLicenses: {},
  users: [],
  page: 'dashboard',
  pageParent: null,
  openMenu: null,
  modals: {}, // { modalName: boolean }
  loading: {}, // { key: boolean }
  errors: {}, // { key: string }
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
        devices: { ...state.devices, [action.id]: undefined },
      };
    case 'SET_DEVICES':
      return { ...state, devices: { ...state.devices, [action.projectId]: action.devices } };
    case 'ADD_DEVICE':
      return {
        ...state,
        devices: {
          ...state.devices,
          [action.projectId]: [...(state.devices[action.projectId] || []), action.device],
        },
      };
    case 'UPDATE_DEVICE':
      return {
        ...state,
        devices: {
          ...state.devices,
          [action.projectId]: state.devices[action.projectId].map(d =>
            d.id === action.device.id ? action.device : d
          ),
        },
      };
    case 'REMOVE_DEVICE':
      return {
        ...state,
        devices: {
          ...state.devices,
          [action.projectId]: state.devices[action.projectId].filter(d => d.id !== action.deviceId),
        },
        versions: { ...state.versions, [action.deviceId]: undefined },
      };
    case 'SET_VERSIONS':
      return { ...state, versions: { ...state.versions, [action.deviceId]: action.versions } };
    case 'ADD_VERSION':
      return {
        ...state,
        versions: {
          ...state.versions,
          [action.deviceId]: [...(state.versions[action.deviceId] || []), action.version],
        },
      };
    case 'UPDATE_VERSION':
      return {
        ...state,
        versions: {
          ...state.versions,
          [action.deviceId]: state.versions[action.deviceId].map(v =>
            v.id === action.version.id ? action.version : v
          ),
        },
      };
    case 'REMOVE_VERSION':
      return {
        ...state,
        versions: {
          ...state.versions,
          [action.deviceId]: state.versions[action.deviceId].filter(v => v.id !== action.versionId),
        },
      };
    case 'SET_TARGET_MARKETS':
      return { ...state, targetMarkets: action.targetMarkets };
    case 'SET_MARKET_LICENSES':
      return { ...state, marketLicenses: action.marketLicenses };
    case 'SET_PAGE':
      return { ...state, page: action.page, pageParent: action.pageParent };
    case 'SET_OPEN_MENU':
      return { ...state, openMenu: action.openMenu };
    case 'SET_MODAL':
      return { ...state, modals: { ...state.modals, [action.modal]: action.value } };
    case 'SET_LOADING':
      return { ...state, loading: { ...state.loading, [action.key]: action.value } };
    case 'SET_ERROR':
      return { ...state, errors: { ...state.errors, [action.key]: action.message } };
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
