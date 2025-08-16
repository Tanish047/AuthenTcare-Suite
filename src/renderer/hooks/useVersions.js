import { useState, useCallback, useMemo, useEffect } from 'react';
import { checkPassword } from '../utils/password.js';

export const useVersions = (state, dispatch, selectedProject, selectedDevice) => {
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showVersionEditModal, setShowVersionEditModal] = useState(false);
  const [showVersionDeleteModal, setShowVersionDeleteModal] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [editVersionName, setEditVersionName] = useState('');
  const [editingVersion, setEditingVersion] = useState(null);
  const [deleteVersion, setDeleteVersion] = useState(null);
  const [versionDeletePassword, setVersionDeletePassword] = useState('');
  const [versionDeleteError, setVersionDeleteError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRenewalSelector, setShowRenewalSelector] = useState(false);

  // Memoized versions for the selected device (normalized state)
  const versions = useMemo(() => {
    if (!selectedDevice?.id || !state.versions) return [];
    return state.versions.filter(version => version.device_id === selectedDevice.id);
  }, [state.versions, selectedDevice?.id]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clear any pending operations when component unmounts
      setLoading(false);
      setError(null);
      dispatch({ type: 'CLEAR_LOADING', key: `versions-${selectedDevice?.id}` });
      dispatch({ type: 'CLEAR_ERROR', key: `versions-${selectedDevice?.id}` });
    };
  }, [selectedDevice?.id, dispatch]);

  // Load versions for the selected device
  const loadVersions = useCallback(async () => {
    if (!selectedDevice?.id) return;

    try {
      setLoading(true);
      setError(null);
      console.log('Loading versions for device:', selectedDevice.id);
      const result = await window.dbAPI.getVersionsByDevice(selectedDevice.id);
      console.log('Versions loaded:', result);
      dispatch({ type: 'SET_VERSIONS', deviceId: selectedDevice.id, versions: result.data });
    } catch (err) {
      setError(err.message);
      console.error('Failed to load versions:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDevice?.id, dispatch]);

  // Helper function to migrate old renewal format to new format
  const migrateRenewalFormat = async (renewal, baseVersionNum) => {
    const oldFormatMatch = renewal.version_number.match(/^R-(\d+)(?:\.(\d+))?$/);
    if (oldFormatMatch) {
      const baseNum = oldFormatMatch[1];
      const sequenceNum = oldFormatMatch[2] || '1';
      
      if (baseNum === baseVersionNum) {
        const newFormat = `R-v${baseNum}-${sequenceNum}`;
        console.log(`Migrating renewal from ${renewal.version_number} to ${newFormat}`);
        
        try {
          // Update in database
          await window.dbAPI.updateVersion(renewal.id, {
            version_number: newFormat
          });
          
          // Update local state
          const updatedRenewal = {
            ...renewal,
            version_number: newFormat
          };
          dispatch({ type: 'UPDATE_VERSION', version: updatedRenewal });
          
          return newFormat;
        } catch (error) {
          console.error('Failed to migrate renewal format:', error);
          return renewal.version_number; // Return original if migration fails
        }
      }
    }
    return renewal.version_number;
  };

  // Generate version number based on existing versions and type
  const generateVersionNumber = async (type, baseVersion = null) => {
    if (!selectedDevice?.id) return null;

    try {
      const result = await window.dbAPI.getVersionsByDevice(selectedDevice.id);
      const existingVersions = result.data || [];

      let versionNumber;

      if (type === 'renewal') {
        if (!baseVersion) {
          throw new Error('Base version is required for renewals');
        }

        // Extract base version number (remove 'v' prefix)
        const baseVersionNum = baseVersion.version_number.replace('v', '');

        // Find existing renewals for this base version (more flexible pattern matching)
        const renewalsForBase = existingVersions.filter(v => {
          if (v.type !== 'renewal') return false;
          
          // Check for new format: R-v1-1, R-v1-2, etc.
          const newFormatMatch = v.version_number.match(/^R-v(\d+)-\d+$/);
          if (newFormatMatch && newFormatMatch[1] === baseVersionNum) return true;
          
          // Check for old format: R-1, R-1.1, R-1.2, etc. (for backward compatibility)
          const oldFormatMatch = v.version_number.match(/^R-(\d+)(?:\.\d+)?$/);
          if (oldFormatMatch && oldFormatMatch[1] === baseVersionNum) return true;
          
          return false;
        });

        // Migrate any old format renewals to new format for consistency
        for (const renewal of renewalsForBase) {
          await migrateRenewalFormat(renewal, baseVersionNum);
        }

        // Determine next sequence using max existing suffix across formats
        const existingSeqNumbers = renewalsForBase
          .map(v => {
            // New format: R-vX-Y
            let match = v.version_number.match(/^R-v(\d+)-\d+$/);
            if (match && match[1] === baseVersionNum) {
              return parseInt(match[2], 10);
            }
            // Old format: R-X or R-X.Y
            match = v.version_number.match(/^R-(\d+)(?:\.(\d+))?$/);
            if (match && match[1] === baseVersionNum) {
              return match[2] ? parseInt(match[2], 10) : 1;
            }
            return 0;
          })
          .filter(n => n > 0);

        const maxSeq = existingSeqNumbers.length ? Math.max(...existingSeqNumbers) : 0;
        const nextRenewalNumber = maxSeq + 1;
        versionNumber = `R-v${baseVersionNum}-${nextRenewalNumber}`;
        
        console.log(`Found ${renewalsForBase.length} existing renewals for base version v${baseVersionNum}`);
        console.log(`Next renewal sequence computed from max existing = ${maxSeq} → ${nextRenewalNumber}`);
        console.log(`Creating renewal ${versionNumber} for base version v${baseVersionNum}`);
        console.log('Existing renewals:', renewalsForBase.map(r => r.version_number));
      } else {
        // For new versions, use simple integer versioning (v1, v2, v3)
        const newVersions = existingVersions.filter(v => v.type === 'new_version');

        if (newVersions.length === 0) {
          // First version
          versionNumber = 'v1';
        } else {
          // Find the highest version number
          const versionNumbers = newVersions.map(v => {
            const match = v.version_number.match(/^v(\d+)$/);
            return match ? parseInt(match[1]) : 1;
          });

          const maxVersion = Math.max(...versionNumbers);
          versionNumber = `v${maxVersion + 1}`;
        }
      }

      return versionNumber;
    } catch (error) {
      console.error('Error generating version number:', error);
      throw error;
    }
  };

  const handleCreateVersion = async (type, baseVersion = null) => {
    if (!selectedDevice?.id) return;

    try {
      setLoading(true);
      setError(null);

      const versionNumber = await generateVersionNumber(type, baseVersion);
      if (!versionNumber) {
        throw new Error('Failed to generate version number');
      }

      const versionData = {
        device_id: selectedDevice.id,
        version_number: versionNumber,
        type: type, // 'renewal' or 'new_version'
        base_version_id: baseVersion?.id || null, // Store reference to base version for renewals
        release_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        changes: type === 'renewal' ? `Renewal of ${baseVersion?.version_number}` : 'New version release'
      };

      const newVersion = await window.dbAPI.createVersion(versionData);

      // Update local state (normalized)
      dispatch({
        type: 'ADD_VERSION',
        version: newVersion
      });

      setShowVersionModal(false);
      setNewVersionName('');
    } catch (err) {
      setError(err.message);
      console.error('Failed to create version:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditVersion = async (e) => {
    e.preventDefault();
    if (!editVersionName.trim() || !editingVersion) return;

    try {
      setLoading(true);
      setError(null);
      const updated = await window.dbAPI.updateVersion(editingVersion.id, {
        version_number: editVersionName.trim(),
      });

      // Update local state (normalized)
      dispatch({ type: 'UPDATE_VERSION', version: updated });

      setShowVersionEditModal(false);
      setEditVersionName('');
      setEditingVersion(null);
    } catch (err) {
      setError(err.message);
      console.error('Failed to update version:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVersion = async (e) => {
    e.preventDefault();
    if (!deleteVersion || !checkPassword(versionDeletePassword)) {
      setVersionDeleteError('Incorrect password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Delete the version - no need for complex logic with the new system
      await window.dbAPI.deleteVersion(deleteVersion.id);
      dispatch({ type: 'REMOVE_VERSION', versionId: deleteVersion.id });

      console.log(`Successfully deleted version: ${deleteVersion.version_number}`);

      setShowVersionDeleteModal(false);
      setDeleteVersion(null);
      setVersionDeletePassword('');
      setVersionDeleteError('');
    } catch (err) {
      setVersionDeleteError(err.message);
      console.error('Failed to delete version:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = (type) => {
    if (type === 'renewal') {
      setShowRenewalSelector(true);
    } else {
      handleCreateVersion(type);
    }
  };

  const handleRenewalVersionSelect = (baseVersion) => {
    handleCreateVersion('renewal', baseVersion);
    setShowRenewalSelector(false);
  };

  const handleBulkDelete = async (versionsToDelete, password) => {
    if (!versionsToDelete || versionsToDelete.length === 0) return;

    if (!checkPassword(password)) {
      throw new Error('Incorrect password');
    }

    try {
      setLoading(true);
      setError(null);

      // Delete all versions - no need for complex renaming logic
      for (const version of versionsToDelete) {
        await window.dbAPI.deleteVersion(version.id);
        dispatch({ type: 'REMOVE_VERSION', versionId: version.id });
      }

      console.log(`Successfully deleted ${versionsToDelete.length} versions`);

    } catch (err) {
      setError(err.message);
      console.error('Failed to bulk delete versions:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = version => {
    setEditingVersion(version);
    setEditVersionName(version.version_number);
    setShowVersionEditModal(true);
  };

  const handleDeleteClick = version => {
    setDeleteVersion(version);
    setShowVersionDeleteModal(true);
  };

  return {
    versions, // Now using memoized versions
    loading,
    error,
    loadVersions,
    // Create
    showVersionModal,
    setShowVersionModal,
    newVersionName,
    setNewVersionName,
    handleCreateVersion: handleCreateClick,
    // Renewal selector
    showRenewalSelector,
    setShowRenewalSelector,
    handleRenewalVersionSelect,
    // Edit
    showVersionEditModal,
    setShowVersionEditModal,
    editVersionName,
    setEditVersionName,
    editingVersion,
    setEditingVersion,
    handleEditVersion,
    // Delete
    showVersionDeleteModal,
    setShowVersionDeleteModal,
    deleteVersion,
    setDeleteVersion,
    versionDeletePassword,
    setVersionDeletePassword,
    versionDeleteError,
    handleDeleteVersion,
    // Actions
    handleCreateClick,
    handleEditClick,
    handleDeleteClick,
    handleBulkDelete,
  };
};