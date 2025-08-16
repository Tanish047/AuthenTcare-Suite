import { useState, useCallback, useMemo, useEffect } from 'react';
import { checkPassword } from '../utils/password.js';

export const useDevices = (state, dispatch, selectedProject) => {
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showDeviceEditModal, setShowDeviceEditModal] = useState(false);
  const [showDeviceDeleteModal, setShowDeviceDeleteModal] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [editDeviceName, setEditDeviceName] = useState('');
  const [editingDevice, setEditingDevice] = useState(null);
  const [deleteDevice, setDeleteDevice] = useState(null);
  const [deviceDeletePassword, setDeviceDeletePassword] = useState('');
  const [deviceDeleteError, setDeviceDeleteError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoized devices for the selected project (normalized state)
  const devices = useMemo(() => {
    if (!selectedProject?.id || !state.devices) return [];
    return state.devices.filter(device => device.project_id === selectedProject.id);
  }, [state.devices, selectedProject?.id]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clear any pending operations when component unmounts
      setLoading(false);
      setError(null);
      dispatch({ type: 'CLEAR_LOADING', key: `devices-${selectedProject?.id}` });
      dispatch({ type: 'CLEAR_ERROR', key: `devices-${selectedProject?.id}` });
    };
  }, [selectedProject?.id, dispatch]);

  const loadDevices = useCallback(async () => {
    if (!selectedProject) return;

    try {
      setLoading(true);
      const result = await window.dbAPI.getDevicesByProject(selectedProject.id);
      dispatch({ type: 'SET_DEVICES', projectId: selectedProject.id, devices: result.data });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedProject, dispatch]);

  const handleCreateDevice = async (e) => {
    if (e) e.preventDefault();
    if (!newDeviceName.trim() || !selectedProject) return;

    try {
      setLoading(true);
      const device = await window.dbAPI.createDevice({
        name: newDeviceName.trim(),
        project_id: selectedProject.id, // Use project_id instead of projectId
      });
      dispatch({ type: 'ADD_DEVICE', device });
      setShowDeviceModal(false);
      setNewDeviceName('');
    } catch (err) {
      setError(err.message);
      console.error('Failed to create device:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDevice = async e => {
    e.preventDefault();
    if (!editDeviceName.trim() || !editingDevice || !selectedProject) return;

    try {
      setLoading(true);
      const updated = await window.dbAPI.updateDevice(editingDevice.id, {
        name: editDeviceName.trim(),
      });
      dispatch({ type: 'UPDATE_DEVICE', device: updated });
      setShowDeviceEditModal(false);
      setEditDeviceName('');
      setEditingDevice(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDevice = async e => {
    e.preventDefault();
    if (!deleteDevice || !selectedProject || !checkPassword(deviceDeletePassword)) {
      setDeviceDeleteError('Incorrect password.');
      return;
    }

    try {
      setLoading(true);
      await window.dbAPI.deleteDevice(deleteDevice.id);
      dispatch({
        type: 'REMOVE_DEVICE',
        deviceId: deleteDevice.id,
      });
      setShowDeviceDeleteModal(false);
      setDeleteDevice(null);
      setDeviceDeletePassword('');
      setDeviceDeleteError('');
    } catch (err) {
      setDeviceDeleteError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setShowDeviceModal(true);
  };

  const handleEditClick = (device) => {
    setEditingDevice(device);
    setEditDeviceName(device.name);
    setShowDeviceEditModal(true);
  };

  const handleDeleteClick = (device) => {
    setDeleteDevice(device);
    setShowDeviceDeleteModal(true);
  };

  return {
    devices, // Now using memoized devices
    showDeviceModal,
    setShowDeviceModal,
    showDeviceEditModal,
    setShowDeviceEditModal,
    showDeviceDeleteModal,
    setShowDeviceDeleteModal,
    newDeviceName,
    setNewDeviceName,
    editDeviceName,
    setEditDeviceName,
    editingDevice,
    setEditingDevice,
    deleteDevice,
    setDeleteDevice,
    deviceDeletePassword,
    setDeviceDeletePassword,
    deviceDeleteError,
    loading,
    error,
    loadDevices,
    handleCreateDevice,
    handleEditDevice,
    handleDeleteDevice,
    handleCreateClick,
    handleEditClick,
    handleDeleteClick,
  };
};
