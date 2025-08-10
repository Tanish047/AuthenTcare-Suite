import React, { useEffect } from 'react';
import { useAppContext, AppProvider } from './context/AppContext.jsx';
import NavBar from './components/NavBar.jsx';
import Dashboard from './components/Dashboard.jsx';
import Notifications from './components/Notifications.jsx';
import ClientsLanding from './components/ClientsLanding.jsx';
import ClientWorkspace from './components/ClientWorkspace.jsx';
import ResearchLanding from './components/ResearchLanding.jsx';
import ResearchWorkspace from './components/ResearchWorkspace.jsx';
import Settings from './components/Settings.jsx';

const menuData = [
  {
    label: <><span role="img" aria-label="Dashboard" style={{ marginRight: 6 }}>✨</span>Dashboard</>,
    key: 'dashboard',
    children: [
      {
        label: 'Overview Metrics',
        key: 'overview-metrics',
        children: [
          { label: 'Total Clients', key: 'total-clients' },
          { label: 'Active Projects', key: 'active-projects' },
          { label: 'Upcoming Deadlines', key: 'upcoming-deadlines' },
          { label: 'Pending Tasks', key: 'pending-tasks' },
        ],
      },
      {
        label: 'Interactive World Map',
        key: 'world-map',
        children: [
          { label: 'Client Locations', key: 'client-locations' },
          { label: 'Target Markets', key: 'target-markets' },
        ],
      },
      {
        label: 'Master Calendar',
        key: 'master-calendar',
        children: [
          { label: 'Project Timelines', key: 'project-timelines' },
          { label: 'Renewal Dates', key: 'renewal-dates' },
          { label: 'Regulatory Deadlines', key: 'regulatory-deadlines' },
        ],
      },
      {
        label: 'Notifications & Alerts',
        key: 'notifications-alerts',
        children: [
          { label: 'Regulatory Updates', key: 'regulatory-updates' },
          { label: 'Project Milestones', key: 'project-milestones' },
          { label: 'Client Interactions', key: 'client-interactions' },
        ],
      },
    ],
  },
  {
    label: <><span role="img" aria-label="Notifications" style={{ marginRight: 6 }}>🔔</span>Notifications</>,
    key: 'notifications',
    children: null
  },
  {
    label: <><span role="img" aria-label="Clients" style={{ marginRight: 6 }}>🤝</span>Clients</>,
    key: 'clients',
    children: null // No dropdown - direct page transition
  },
  {
    label: <><span role="img" aria-label="Research" style={{ marginRight: 6 }}>🔍</span>Research Zone</>,
    key: 'research',
    children: null // No dropdown - direct page transition
  },
  {
    label: <><span role="img" aria-label="Intelligence" style={{ marginRight: 6 }}>🌐</span>Global Intelligence</>,
    key: 'global-intelligence',
    children: [
      {
        label: 'Regulatory News Feed',
        key: 'regulatory-news',
        children: [
          { label: 'FDA Updates', key: 'fda-updates' },
          { label: 'EMA Updates', key: 'ema-updates' },
          { label: 'Other Regulatory Bodies', key: 'other-regulatory' },
        ],
      },
      {
        label: 'Industry & Market Trends',
        key: 'market-trends',
        children: [
          { label: 'Market Shifts', key: 'market-shifts' },
          { label: 'M&A Activities', key: 'ma-activities' },
          { label: 'Emerging Technologies', key: 'emerging-tech' },
        ],
      },
      {
        label: 'Competitor Watchlist',
        key: 'competitor-watch',
        children: [
          { label: 'Key Manufacturers', key: 'key-manufacturers' },
          { label: 'Competitor Analysis', key: 'competitor-analysis-global' },
          { label: 'Market Positioning', key: 'market-positioning' },
        ],
      },
    ],
  },
  {
    label: <><span role="img" aria-label="Settings" style={{ marginRight: 6 }}>⚙️</span>Settings</>,
    key: 'settings',
    children: [
      {
        label: 'Account Management',
        key: 'account-management',
        children: [
          { label: 'User Accounts & Roles', key: 'users' },
          { label: 'Access Control & Permissions', key: 'access-control' },
        ],
      },
      {
        label: 'System & Data',
        key: 'system-data',
        children: [
          { label: 'Cloud Backup & Sync Configuration', key: 'cloud' },
          { label: 'Data Import/Export', key: 'data-import-export' },
          { label: 'View Logs', key: 'view-logs' },
        ],
      },
      {
        label: 'Customization',
        key: 'customization',
        children: [
          { label: 'Notification Preferences', key: 'notif' },
          { label: 'App Theme & Appearance', key: 'theme' },
        ],
      },
      {
        label: 'Integrations',
        key: 'integrations',
        children: [
          { label: 'API Keys & Webhooks', key: 'api' },
          { label: 'Third-party Connections', key: 'third-party' },
        ],
      },
    ],
  },
];

function App() {
  return (
    <AppProvider>
      <AppWrapper />
    </AppProvider>
  );
}

function AppWrapper() {
  // const { setShowLoadingSpinner } = useAppContext();

  useEffect(() => {
    // setShowLoadingSpinner(false);
  }, []);

  return <AppContent />;
}

function AppContent() {
  const { state, dispatch } = useAppContext();
  const { page } = state;

  // Dropdown close logic
  const closeTimer = React.useRef();

  const handleNavClick = (key) => {
    dispatch({ type: 'SET_PAGE', page: key, pageParent: null });
  };

  const handleDropdownItemClick = (key) => {
    dispatch({ type: 'SET_PAGE', page: key, pageParent: null });
    dispatch({ type: 'SET_OPEN_MENU', openMenu: null });
  };

  const handleAnyMouseEnter = (key) => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }
    dispatch({ type: 'SET_OPEN_MENU', openMenu: key });
  };

  const handleAnyMouseLeave = () => {
    closeTimer.current = setTimeout(() => {
      dispatch({ type: 'SET_OPEN_MENU', openMenu: null });
    }, 300);
  };

  const handleBackClick = () => {
    switch (page) {
      case 'research-workspace':
        dispatch({ type: 'SET_PAGE', page: 'research', pageParent: null });
        break;
      case 'device-workspace':
        dispatch({ type: 'SET_PAGE', page: 'research-workspace', pageParent: 'research' });
        break;
      case 'version-workspace':
        dispatch({ type: 'SET_PAGE', page: 'device-workspace', pageParent: 'research-workspace' });
        break;
      case 'market-workspace':
        dispatch({ type: 'SET_PAGE', page: 'version-workspace', pageParent: 'device-workspace' });
        break;
      default:
        dispatch({ type: 'SET_PAGE', page: 'dashboard', pageParent: null });
    }
  };

  return (
    <>
      <div className="background-blur-blob blob-magenta" />
      <div className="background-blur-blob blob-blue" />
      <div className="background-blur-blob blob-orange" />
      <NavBar
        menuData={menuData}
        handleNavClick={handleNavClick}
        handleDropdownItemClick={handleDropdownItemClick}
        handleBackClick={handleBackClick}
        closeTimer={closeTimer}
        handleAnyMouseEnter={handleAnyMouseEnter}
        handleAnyMouseLeave={handleAnyMouseLeave}
      />
      <main className="main-content">
        {page === 'dashboard' && <Dashboard />}
        {page === 'notifications' && <Notifications />}
        {page === 'clients' && <ClientsLanding />}
        {page === 'client-workspace' && <ClientWorkspace />}
        {page === 'research' && (
          <ResearchLanding 
            onWorkspace={(nextPage) => dispatch({ type: 'SET_PAGE', page: nextPage, pageParent: 'research' })} 
          />
        )}
        {page === 'research-workspace' && (
          <ResearchWorkspace 
            onDeviceSelect={() => dispatch({ type: 'SET_PAGE', page: 'device-workspace', pageParent: 'research-workspace' })}
            onVersionSelect={() => dispatch({ type: 'SET_PAGE', page: 'version-workspace', pageParent: 'device-workspace' })}
            onMarketSelect={() => dispatch({ type: 'SET_PAGE', page: 'market-workspace', pageParent: 'version-workspace' })}
          />
        )}
        {page === 'device-workspace' && <ResearchWorkspace currentLevel="device" />}
        {page === 'version-workspace' && <ResearchWorkspace currentLevel="version" />}
        {page === 'market-workspace' && <ResearchWorkspace currentLevel="market" />}
        {page === 'settings' && <Settings menuData={menuData} />}
        {/* Add more page components as needed */}
      </main>
    </>
  );
}

export default App;