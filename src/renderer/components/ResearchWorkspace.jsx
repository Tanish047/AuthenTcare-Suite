import React, { useState, useEffect } from 'react';
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
import ProjectModals from './research/ProjectModals.jsx';
import DeviceModals from './research/DeviceModals.jsx';
import VersionModals from './research/VersionModals.jsx';
import MarketModals from './research/MarketModals.jsx';
import LicenseModals from './research/LicenseModals.jsx';

function ResearchWorkspace({ 
  currentLevel: initialLevel = 'project',
  onDeviceSelect,
  onVersionSelect,
  onMarketSelect
}) {
  const { state, dispatch } = useAppContext();
  const [currentLevel, setCurrentLevel] = useState(initialLevel);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [selectedMarket, setSelectedMarket] = useState(null);

  // Navigation helper functions
  const navigateToLevel = (level, selection) => {
    // Reset all lower level selections
    const resetLowerLevels = (currentLevel) => {
      switch(currentLevel) {
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
      }
    };

    // Update the current selection and navigate
    switch(level) {
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
    }
  };

  const canNavigateToLevel = (level) => {
    switch(level) {
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
      default:
        return false;
    }
  };

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
    deleteProject,
    deletePassword,
    setDeletePassword,
    deleteError,
    loadProjects
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
    loadDevices
  } = useDevices(state, dispatch, selectedProject);

  const {
    versions,
    showVersionModal,
    showVersionEditModal,
    showVersionDeleteModal,
    handleCreateClick: handleVersionCreate,
    handleEditClick: handleVersionEdit,
    handleDeleteClick: handleVersionDelete,
    setShowVersionModal,
    setShowVersionEditModal,
    setShowVersionDeleteModal,
    newVersionName,
    setNewVersionName,
    editVersionName,
    setEditVersionName,
    editingVersion,
    deleteVersion,
    versionDeletePassword,
    setVersionDeletePassword,
    versionDeleteError,
    handleCreateVersion,
    handleEditVersion,
    handleDeleteVersion
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
    marketDeleteError
  } = useMarkets(state, dispatch);

  const {
    licenses,
    showLicenseModal,
    handleCreateClick: handleLicenseCreate,
    setShowLicenseModal,
    newLicense,
    setNewLicense
  } = useLicenses(state, dispatch);

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

  // Render breadcrumb navigation
  const renderBreadcrumb = () => (
    <div style={{ 
      padding: '12px 16px', 
      backgroundColor: '#f8f9fa', 
      borderRadius: '6px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px'
    }}>
      <span 
        onClick={() => navigateToLevel('project', null)}
        style={{ 
          cursor: 'pointer', 
          color: currentLevel === 'project' ? '#2c5aa0' : '#666',
          fontWeight: currentLevel === 'project' ? '600' : 'normal'
        }}
      >
        Projects
      </span>
      
      {selectedProject && (
        <>
          <span style={{ color: '#666' }}>/</span>
          <span 
            onClick={() => canNavigateToLevel('device') && navigateToLevel('device', selectedProject)}
            style={{ 
              cursor: canNavigateToLevel('device') ? 'pointer' : 'not-allowed', 
              color: currentLevel === 'device' ? '#2c5aa0' : '#666',
              fontWeight: currentLevel === 'device' ? '600' : 'normal'
            }}
          >
            {selectedProject}
          </span>
        </>
      )}

      {selectedDevice && (
        <>
          <span style={{ color: '#666' }}>/</span>
          <span 
            onClick={() => canNavigateToLevel('version') && navigateToLevel('version', selectedDevice)}
            style={{ 
              cursor: canNavigateToLevel('version') ? 'pointer' : 'not-allowed',
              color: currentLevel === 'version' ? '#2c5aa0' : '#666',
              fontWeight: currentLevel === 'version' ? '600' : 'normal'
            }}
          >
            {selectedDevice}
          </span>
        </>
      )}

      {selectedVersion && (
        <>
          <span style={{ color: '#666' }}>/</span>
          <span 
            onClick={() => canNavigateToLevel('market') && navigateToLevel('market', selectedVersion)}
            style={{ 
              cursor: canNavigateToLevel('market') ? 'pointer' : 'not-allowed',
              color: currentLevel === 'market' ? '#2c5aa0' : '#666',
              fontWeight: currentLevel === 'market' ? '600' : 'normal'
            }}
          >
            {selectedVersion}
          </span>
        </>
      )}

      {selectedMarket && (
        <>
          <span style={{ color: '#666' }}>/</span>
          <span 
            onClick={() => canNavigateToLevel('license') && navigateToLevel('license', selectedMarket)}
            style={{ 
              cursor: canNavigateToLevel('license') ? 'pointer' : 'not-allowed',
              color: currentLevel === 'license' ? '#2c5aa0' : '#666',
              fontWeight: currentLevel === 'license' ? '600' : 'normal'
            }}
          >
            {selectedMarket}
          </span>
        </>
      )}
    </div>
  );

  // Main render
  return (
    <div style={{ padding: 32, height: 'calc(100vh - 100px)' }} className="research-workspace">
      <h2 style={{ color: '#2c5aa0', fontWeight: 800, fontSize: 28, marginBottom: 24 }}>Research Workspace</h2>
      
      {renderBreadcrumb()}

      <div className="content-section">
        {currentLevel === 'project' && (
          <div className="projects-section">
            <ProjectList 
              projects={projects}
              selectedProject={selectedProject ? selectedProject.id : null}
              onSelect={(project) => {
                setSelectedProject(project);
                setCurrentLevel('device');
                if (project) {
                  loadDevices();
                  // Store the last selected project in local storage
                  setStorage('lastSelectedProject', project);
                }
              }}
              onCreate={() => setShowProjectModal(true)}
              onEdit={(project) => {
                setEditingProject(project);
                setEditProjectName(project.name);
                setShowProjectEditModal(true);
              }}
              onDelete={(project) => {
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
            <DeviceList
              selectedProject={selectedProject}
              devices={devices}
              onSelect={(device) => navigateToLevel('version', device)}
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
            <VersionList
              selectedProject={selectedProject}
              selectedDevice={selectedDevice}
              versions={versions}
              onSelect={(version) => navigateToLevel('market', version)}
              onCreate={handleVersionCreate}
              onEdit={handleVersionEdit}
              onDelete={handleVersionDelete}
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
          </div>
        )}

        {/* Market Level */}
        {currentLevel === 'market' && selectedVersion && (
          <div className="markets-section">
            <MarketList
              targetMarkets={targetMarkets}
              selectedMarket={selectedMarket}
              onSelect={(market) => navigateToLevel('license', market)}
              onCreate={handleMarketCreate}
              onEdit={handleMarketEdit}
              onDelete={handleMarketDelete}
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
            <LicenseList
              selectedMarket={selectedMarket}
              licenses={licenses}
              onCreate={handleLicenseCreate}
              onDelete={handleDeleteClick}
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
      </div>
    </div>
  );
}

export default ResearchWorkspace;
