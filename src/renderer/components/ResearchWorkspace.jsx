import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import { useProjects } from '../hooks/useProjects';
import { useDevices } from '../hooks/useDevices';
import { useVersions } from '../hooks/useVersions';
import { useMarkets } from '../hooks/useMarkets';
import { useLicenses } from '../hooks/useLicenses';
import { getStorage, setStorage } from '../utils/storage';
import { migrateLocalStorageToDatabase, hasLocalStorageData } from '../utils/dataMigration';

// Components
import ProjectList from './research/ProjectList.jsx';
import DeviceList from './research/DeviceList.jsx';
import VersionList from './research/VersionList.jsx';
import MarketList from './research/MarketList.jsx';
import LicenseList from './research/LicenseList.jsx';
import CompletionSummary from './research/CompletionSummary.jsx';
import ProjectModals from './research/ProjectModals.jsx';
import DeviceModals from './research/DeviceModals.jsx';
import VersionModals from './research/VersionModals.jsx';
import RenewalVersionSelector from './research/RenewalVersionSelector.jsx';
import MarketModals from './research/MarketModals.jsx';
import LicenseModals from './research/LicenseModals.jsx';

function ResearchWorkspace({
  currentLevel: initialLevel = 'project',
  onDeviceSelect,
  onVersionSelect,
  onMarketSelect,
  onBackNavigation,
}) {
  const { state, dispatch } = useAppContext();
  const [currentLevel, setCurrentLevel] = useState(initialLevel);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [selectedLicense, setSelectedLicense] = useState(null);

  // Navigation helper functions
  const navigateToLevel = (level, selection) => {
    // Reset all lower level selections
    const resetLowerLevels = currentLevel => {
      switch (currentLevel) {
        case 'project':
          setSelectedDevice(null);
          setSelectedVersion(null);
          setSelectedMarket(null);
          break;
        case 'device':
          setSelectedVersion(null);
          setSelectedMarket(null);
          break;
        case 'version':
          setSelectedMarket(null);
          break;
        case 'market':
          break;
      }
    };

    // Update the current selection and navigate
    switch (level) {
      case 'project':
        resetLowerLevels('project');
        setSelectedProject(selection);
        if (onDeviceSelect) {
          onDeviceSelect(selection);
        } else {
          setCurrentLevel('device');
        }
        break;
      case 'device':
        resetLowerLevels('device');
        setSelectedDevice(selection);
        if (onVersionSelect) {
          onVersionSelect(selection);
        } else {
          setCurrentLevel('version');
        }
        break;
      case 'version':
        resetLowerLevels('version');
        setSelectedVersion(selection);
        if (onMarketSelect) {
          onMarketSelect(selection);
        } else {
          setCurrentLevel('market');
        }
        break;
      case 'market':
        setSelectedMarket(selection);
        setCurrentLevel('license');
        break;
      case 'license':
        setSelectedLicense(selection);
        setCurrentLevel('completion');
        break;
    }
  };

  const canNavigateToLevel = level => {
    switch (level) {
      case 'project':
        return true;
      case 'device':
        return !!selectedProject;
      case 'version':
        return !!selectedDevice;
      case 'market':
        return !!selectedVersion;
      case 'license':
        return !!selectedMarket;
      case 'completion':
        return !!selectedLicense;
      default:
        return false;
    }
  };

  // Back navigation function
  const handleBackNavigation = () => {
    switch (currentLevel) {
      case 'device':
        setCurrentLevel('project');
        setSelectedDevice(null);
        setSelectedVersion(null);
        setSelectedMarket(null);
        break;
      case 'version':
        setCurrentLevel('device');
        setSelectedVersion(null);
        setSelectedMarket(null);
        break;
      case 'market':
        setCurrentLevel('version');
        setSelectedMarket(null);
        break;
      case 'license':
        setCurrentLevel('market');
        break;
      case 'completion':
        setCurrentLevel('license');
        setSelectedLicense(null);
        break;
      case 'project':
      default:
        // If we're at the project level or unknown level, go back to research landing
        if (onBackNavigation) {
          onBackNavigation();
        }
        break;
    }
  };

  // Expose back navigation to parent component
  useEffect(() => {
    // Store the back navigation function in the global context so NavBar can access it
    if (window.researchWorkspaceBackHandler) {
      window.researchWorkspaceBackHandler = handleBackNavigation;
    } else {
      window.researchWorkspaceBackHandler = handleBackNavigation;
    }
    
    return () => {
      window.researchWorkspaceBackHandler = null;
    };
  }, [currentLevel, selectedProject, selectedDevice, selectedVersion, selectedMarket, selectedLicense]);

  const {
    projects,
    showCreateModal: showProjectModal,
    showEditModal: showProjectEditModal,
    showDeleteModal: showProjectDeleteModal,
    handleCreateProject,
    handleEditProject,
    handleDeleteProject,
    setShowCreateModal: setShowProjectModal,
    setShowEditModal: setShowProjectEditModal,
    setShowDeleteModal: setShowProjectDeleteModal,
    newProjectName,
    setNewProjectName,
    editProjectName,
    setEditProjectName,
    editingProject,
    setEditingProject,
    deleteProject,
    setDeleteProject,
    deletePassword,
    setDeletePassword,
    deleteError,
    loadProjects,
  } = useProjects(state, dispatch);

  const {
    devices,
    showDeviceModal,
    showDeviceEditModal,
    showDeviceDeleteModal,
    handleCreateClick: handleDeviceCreate,
    handleEditClick: handleDeviceEdit,
    handleDeleteClick: handleDeviceDelete,
    setShowDeviceModal,
    setShowDeviceEditModal,
    setShowDeviceDeleteModal,
    newDeviceName,
    setNewDeviceName,
    editDeviceName,
    setEditDeviceName,
    editingDevice,
    deleteDevice,
    deviceDeletePassword,
    setDeviceDeletePassword,
    deviceDeleteError,
    handleCreateDevice,
    handleEditDevice,
    handleDeleteDevice,
    loadDevices,
  } = useDevices(state, dispatch, selectedProject);

  const {
    versions,
    loading: versionsLoading,
    error: versionsError,
    loadVersions,
    showVersionModal,
    setShowVersionModal,
    showVersionEditModal,
    setShowVersionEditModal,
    showVersionDeleteModal,
    setShowVersionDeleteModal,
    newVersionName,
    setNewVersionName,
    editVersionName,
    setEditVersionName,
    editingVersion,
    setEditingVersion,
    deleteVersion,
    setDeleteVersion,
    versionDeletePassword,
    setVersionDeletePassword,
    versionDeleteError,
    handleCreateVersion,
    handleEditVersion,
    handleDeleteVersion,
    handleCreateClick: handleVersionCreate,
    handleEditClick: handleVersionEdit,
    handleDeleteClick: handleVersionDelete,
    showRenewalSelector,
    setShowRenewalSelector,
    handleRenewalVersionSelect,
    handleBulkDelete,
  } = useVersions(state, dispatch, selectedProject, selectedDevice);

  const {
    markets: targetMarkets,
    allMarkets,
    showMarketModal,
    showMarketDeleteModal,
    handleCreateClick: handleMarketCreate,
    handleEditClick: handleMarketEdit,
    handleDeleteClick: handleMarketDelete,
    setShowMarketModal,
    setShowMarketDeleteModal,
    newMarket,
    setNewMarket,
    deleteMarket,
    marketDeletePassword,
    setMarketDeletePassword,
    marketDeleteError,
  } = useMarkets(state, dispatch);

  const {
    licenses: allLicenses,
    showLicenseModal,
    handleCreateClick: handleLicenseCreate,
    handleDeleteClick,
    setShowLicenseModal,
    newLicense,
    setNewLicense,
  } = useLicenses(state, dispatch);

  // Filter licenses for the current selection
  const licenses = useMemo(() => {
    if (!selectedProject || !selectedVersion || !selectedMarket || !state.marketLicenses) {
      return [];
    }
    
    // If marketLicenses is an array (from database), filter it
    if (Array.isArray(state.marketLicenses)) {
      return state.marketLicenses.filter(license => 
        license.project_id === selectedProject.id &&
        license.version_id === selectedVersion.id &&
        license.market_id === selectedMarket.id
      );
    }
    
    // If marketLicenses is organized by market (old format), use it
    return state.marketLicenses[selectedMarket.id] || [];
  }, [state.marketLicenses, selectedProject, selectedVersion, selectedMarket]);

  // Load and save effects
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Check if there's localStorage data to migrate
        if (hasLocalStorageData()) {
          console.log('Found localStorage data, migrating to database...');
          await migrateLocalStorageToDatabase();
        }

        // Load projects from database
        await loadProjects();

        // Restore last selected project if available
        const lastProject = getStorage('lastSelectedProject');
        if (lastProject && currentLevel === 'project') {
          setSelectedProject(lastProject);
          loadDevices();
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };

    initializeData();
  }, [loadProjects, currentLevel]);

  // Load devices when project is selected
  useEffect(() => {
    if (selectedProject) {
      loadDevices();
    }
  }, [selectedProject, loadDevices]);

  // Load versions when device is selected
  useEffect(() => {
    if (selectedDevice) {
      loadVersions();
    }
  }, [selectedDevice, loadVersions]);

  // Load markets from database
  useEffect(() => {
    const loadMarkets = async () => {
      try {
        const result = await window.dbAPI.getMarkets();
        dispatch({ type: 'SET_TARGET_MARKETS', targetMarkets: result.data });
      } catch (error) {
        console.error('Error loading markets:', error);
      }
    };
    loadMarkets();
  }, [dispatch]);

  // Load licenses from database
  useEffect(() => {
    const loadLicenses = async () => {
      try {
        const result = await window.dbAPI.getLicenses();
        dispatch({ type: 'SET_MARKET_LICENSES', marketLicenses: result.data });
      } catch (error) {
        console.error('Error loading licenses:', error);
      }
    };
    loadLicenses();
  }, [dispatch]);



  // Get dynamic title based on current level and selections
  const getPageTitle = () => {
    switch (currentLevel) {
      case 'project':
        return 'Research Workspace';
      case 'device':
        return selectedProject ? `${selectedProject.name} - Devices` : 'Research Workspace';
      case 'version':
        return selectedDevice ? `${selectedDevice.name} - Versions` : 'Research Workspace';
      case 'market':
        return selectedVersion ? `Version ${selectedVersion.version_number} - Markets` : 'Research Workspace';
      case 'license':
        return selectedMarket ? `${selectedMarket.name} - Licenses` : 'Research Workspace';
      case 'completion':
        return 'Pathway Complete';
      default:
        return 'Research Workspace';
    }
  };

  // Main render
  return (
    <div style={{ padding: 32, height: 'calc(100vh - 100px)' }} className="research-workspace">
      <h2 style={{ color: '#2c5aa0', fontWeight: 800, fontSize: 28, marginBottom: 24 }}>
        {getPageTitle()}
      </h2>

      <div className="content-section">
        {currentLevel === 'project' && (
          <div className="projects-section">
            <h3 style={{ color: '#2c5aa0', fontWeight: 700, fontSize: 22, marginBottom: 18 }}>
              Project List
            </h3>
            <ProjectList
              projects={projects}
              selectedProject={selectedProject ? selectedProject.id : null}
              onSelect={project => {
                setSelectedProject(project);
                setCurrentLevel('device');
                if (project) {
                  loadDevices();
                  // Store the last selected project in local storage
                  setStorage('lastSelectedProject', project);
                }
              }}
              onCreate={() => setShowProjectModal(true)}
              onEdit={project => {
                setEditingProject(project);
                setEditProjectName(project.name);
                setShowProjectEditModal(true);
              }}
              onDelete={project => {
                setDeleteProject(project);
                setShowProjectDeleteModal(true);
              }}
            />
            <ProjectModals
              showCreateModal={showProjectModal}
              setShowCreateModal={setShowProjectModal}
              showEditModal={showProjectEditModal}
              setShowEditModal={setShowProjectEditModal}
              showDeleteModal={showProjectDeleteModal}
              setShowDeleteModal={setShowProjectDeleteModal}
              newProjectName={newProjectName}
              setNewProjectName={setNewProjectName}
              editProjectName={editProjectName}
              setEditProjectName={setEditProjectName}
              editingProject={editingProject}
              deleteProject={deleteProject}
              deletePassword={deletePassword}
              setDeletePassword={setDeletePassword}
              deleteError={deleteError}
              handleCreateProject={handleCreateProject}
              handleEditProject={handleEditProject}
              handleDeleteProject={handleDeleteProject}
            />
          </div>
        )}

        {currentLevel === 'device' && selectedProject && (
          <div className="devices-section">
            <h3 style={{ color: '#2c5aa0', fontWeight: 700, fontSize: 22, marginBottom: 18 }}>
              Device List
            </h3>
            <DeviceList
              selectedProject={selectedProject}
              devices={devices}
              selectedDevice={selectedDevice}
              onSelect={device => {
                setSelectedDevice(device);
                setCurrentLevel('version');
                // Load versions for this device
                loadVersions();
              }}
              onCreate={handleDeviceCreate}
              onEdit={handleDeviceEdit}
              onDelete={handleDeviceDelete}
            />
            <DeviceModals
              showCreate={showDeviceModal}
              showEdit={showDeviceEditModal}
              showDelete={showDeviceDeleteModal}
              onCloseCreate={() => setShowDeviceModal(false)}
              onCloseEdit={() => setShowDeviceEditModal(false)}
              onCloseDelete={() => setShowDeviceDeleteModal(false)}
              newDeviceName={newDeviceName}
              setNewDeviceName={setNewDeviceName}
              editDeviceName={editDeviceName}
              setEditDeviceName={setEditDeviceName}
              editingDevice={editingDevice}
              deleteDevice={deleteDevice}
              deviceDeletePassword={deviceDeletePassword}
              setDeviceDeletePassword={setDeviceDeletePassword}
              deviceDeleteError={deviceDeleteError}
              handleCreateDevice={handleCreateDevice}
              handleEditDevice={handleEditDevice}
              handleDeleteDevice={handleDeleteDevice}
            />
          </div>
        )}

        {currentLevel === 'version' && selectedDevice && (
          <div className="versions-section">
            <h3 style={{ color: '#2c5aa0', fontWeight: 700, fontSize: 22, marginBottom: 18 }}>
              Version List
            </h3>
            <VersionList
              selectedProject={selectedProject}
              selectedDevice={selectedDevice}
              versions={versions}
              selectedVersion={selectedVersion}
              onSelect={version => {
                setSelectedVersion(version);
                setCurrentLevel('market');
                // Load markets if needed
              }}
              onCreate={handleVersionCreate}
              onEdit={handleVersionEdit}
              onDelete={handleVersionDelete}
              onBulkDelete={handleBulkDelete}
            />
            <VersionModals
              showCreate={showVersionModal}
              showEdit={showVersionEditModal}
              showDelete={showVersionDeleteModal}
              onCloseCreate={() => setShowVersionModal(false)}
              onCloseEdit={() => setShowVersionEditModal(false)}
              onCloseDelete={() => setShowVersionDeleteModal(false)}
              newVersionName={newVersionName}
              setNewVersionName={setNewVersionName}
              editVersionName={editVersionName}
              setEditVersionName={setEditVersionName}
              editingVersion={editingVersion}
              deleteVersion={deleteVersion}
              versionDeletePassword={versionDeletePassword}
              setVersionDeletePassword={setVersionDeletePassword}
              versionDeleteError={versionDeleteError}
              handleCreateVersion={handleCreateVersion}
              handleEditVersion={handleEditVersion}
              handleDeleteVersion={handleDeleteVersion}
            />
            <RenewalVersionSelector
              show={showRenewalSelector}
              onClose={() => setShowRenewalSelector(false)}
              versions={versions}
              onSelectVersion={handleRenewalVersionSelect}
            />
          </div>
        )}

        {/* Market Level */}
        {currentLevel === 'market' && selectedVersion && (
          <div className="markets-section">
            <h3 style={{ color: '#2c5aa0', fontWeight: 700, fontSize: 22, marginBottom: 18 }}>
              Market List
            </h3>

            <MarketList
              targetMarkets={state.targetMarkets}
              selectedMarket={selectedMarket}
              onSelect={market => {
                setSelectedMarket(market);
                setCurrentLevel('license');
                // Load licenses if needed
              }}
              onCreate={handleMarketCreate}
              onEdit={handleMarketEdit}
              onDelete={handleMarketDelete}
              dispatch={dispatch}
            />
            <MarketModals
              showCreate={showMarketModal}
              showDelete={showMarketDeleteModal}
              onCloseCreate={() => setShowMarketModal(false)}
              onCloseDelete={() => setShowMarketDeleteModal(false)}
              newMarket={newMarket}
              setNewMarket={setNewMarket}
              deleteMarket={deleteMarket}
              marketDeletePassword={marketDeletePassword}
              setMarketDeletePassword={setMarketDeletePassword}
              marketDeleteError={marketDeleteError}
              allMarkets={allMarkets}
              targetMarkets={targetMarkets}
              onAddMarket={handleMarketCreate}
              onDeleteMarket={handleMarketDelete}
            />
          </div>
        )}

        {/* License Level */}
        {currentLevel === 'license' && selectedMarket && (
          <div className="licenses-section">
            <h3 style={{ color: '#2c5aa0', fontWeight: 700, fontSize: 22, marginBottom: 18 }}>
              License List
            </h3>
            <LicenseList
              selectedProject={selectedProject}
              selectedDevice={selectedDevice}
              selectedVersion={selectedVersion}
              selectedMarket={selectedMarket}
              licenses={licenses}
              onCreate={handleLicenseCreate}
              onDelete={handleDeleteClick}
              onSelect={license => {
                console.log('Selected license:', license);
                setSelectedLicense(license);
                setCurrentLevel('completion');
              }}
              dispatch={dispatch}
            />
            <LicenseModals
              showCreate={showLicenseModal}
              onCloseCreate={() => setShowLicenseModal(false)}
              selectedMarket={selectedMarket}
              newLicense={newLicense}
              setNewLicense={setNewLicense}
              onAddLicense={handleLicenseCreate}
            />
          </div>
        )}

        {/* Completion Level */}
        {currentLevel === 'completion' && selectedLicense && (
          <div className="completion-section">
            <CompletionSummary
              selectedProject={selectedProject}
              selectedDevice={selectedDevice}
              selectedVersion={selectedVersion}
              selectedMarket={selectedMarket}
              selectedLicense={selectedLicense}
              onBack={() => {
                setCurrentLevel('license');
                setSelectedLicense(null);
              }}
              onStartNew={() => {
                // Reset all selections and go back to project level
                setSelectedProject(null);
                setSelectedDevice(null);
                setSelectedVersion(null);
                setSelectedMarket(null);
                setSelectedLicense(null);
                setCurrentLevel('project');
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ResearchWorkspace;
