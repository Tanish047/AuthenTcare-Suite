import { useState } from 'react';
import { checkPassword } from '../utils/password.js';

export const useVersions = (state, dispatch, selectedProject, selectedDevice) => {
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showVersionEditModal, setShowVersionEditModal] = useState(false);
  const [showVersionDeleteModal, setShowVersionDeleteModal] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [editVersionName, setEditVersionName] = useState('');
  const [editingVersion, setEditingVersion] = useState('');
  const [deleteVersion, setDeleteVersion] = useState('');
  const [versionDeletePassword, setVersionDeletePassword] = useState('');
  const [versionDeleteError, setVersionDeleteError] = useState('');

  const handleCreateVersion = () => {
    if (newVersionName.trim() && selectedProject && selectedDevice) {
      const key = `${selectedProject}_${selectedDevice}`;
      const versions = state.versions[key] || [];
      if (!versions.includes(newVersionName.trim())) {
        dispatch({ type: 'SET_VERSIONS', key, versions: [...versions, newVersionName.trim()] });
        setShowVersionModal(false);
        setNewVersionName('');
      }
    }
  };

  const handleEditVersion = () => {
    if (editVersionName.trim() && editVersionName.trim() !== editingVersion && selectedProject && selectedDevice) {
      const key = `${selectedProject}_${selectedDevice}`;
      const versions = state.versions[key] || [];
      const newVersions = versions.map(v => v === editingVersion ? editVersionName.trim() : v);
      dispatch({ type: 'SET_VERSIONS', key, versions: newVersions });
      setShowVersionEditModal(false);
      setEditVersionName('');
      setEditingVersion('');
    }
  };

  const handleDeleteVersion = () => {
    if (!checkPassword(versionDeletePassword)) {
      setVersionDeleteError('Incorrect password.');
      return;
    }
    if (selectedProject && selectedDevice) {
      const key = `${selectedProject}_${selectedDevice}`;
      const versions = state.versions[key] || [];
      const newVersions = versions.filter(v => v !== deleteVersion);
      dispatch({ type: 'SET_VERSIONS', key, versions: newVersions });
      setShowVersionDeleteModal(false);
      setDeleteVersion('');
      setVersionDeletePassword('');
      setVersionDeleteError('');
    }
  };

  const handleCreateClick = () => {
    setShowVersionModal(true);
  };

  const handleEditClick = (version) => {
    setEditingVersion(version);
    setEditVersionName(version);
    setShowVersionEditModal(true);
  };

  const handleDeleteClick = (version) => {
    setDeleteVersion(version);
    setShowVersionDeleteModal(true);
  };

  return {
    versions: state.versions[`${selectedProject}_${selectedDevice}`] || [],
    // Create
    showVersionModal,
    onCloseCreate: () => setShowVersionModal(false),
    newVersionName,
    setNewVersionName,
    onCreate: handleCreateClick,
    onCreateVersion: handleCreateVersion,
    // Edit
    showVersionEditModal,
    onCloseEdit: () => setShowVersionEditModal(false),
    editVersionName,
    setEditVersionName,
    editingVersion,
    onEdit: handleEditClick,
    onEditVersion: handleEditVersion,
    // Delete
    showVersionDeleteModal,
    onCloseDelete: () => {
      setShowVersionDeleteModal(false);
      setVersionDeletePassword('');
      setVersionDeleteError('');
    },
    deleteVersion,
    versionDeletePassword,
    setVersionDeletePassword,
    versionDeleteError,
    onDelete: handleDeleteClick,
    onDeleteVersion: handleDeleteVersion
  };
};
