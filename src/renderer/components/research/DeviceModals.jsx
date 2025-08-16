import React from 'react';
import Modal from '../Modal.jsx';

const DeviceModals = ({
  showCreate: showDeviceModal,
  showEdit: showDeviceEditModal,
  showDelete: showDeviceDeleteModal,
  onCloseCreate,
  onCloseEdit,
  onCloseDelete,
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
}) => {
  return (
    <>
      <Modal
        open={showDeviceModal}
        onClose={onCloseCreate}
        title="Add Device"
        actions={[
          <button key="cancel" onClick={onCloseCreate}>
            Cancel
          </button>,
          <button 
            key="save" 
            onClick={(e) => {
              e.preventDefault();
              handleCreateDevice();
            }} 
            disabled={!newDeviceName.trim()}
          >
            Save
          </button>,
        ]}
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          handleCreateDevice(e);
        }} style={{ width: '100%' }}>
          <input
            type="text"
            value={newDeviceName}
            onChange={e => setNewDeviceName(e.target.value)}
            placeholder="Device name"
            style={{ width: '100%', marginBottom: 16 }}
            autoFocus
            required
          />
        </form>
      </Modal>

      <Modal
        open={showDeviceEditModal}
        onClose={onCloseEdit}
        title="Edit Device"
        actions={[
          <button key="cancel" onClick={onCloseEdit}>
            Cancel
          </button>,
          <button
            key="save"
            onClick={handleEditDevice}
            disabled={!editDeviceName.trim() || editDeviceName.trim() === editingDevice?.name}
          >
            Save
          </button>,
        ]}
      >
        <form onSubmit={handleEditDevice} style={{ width: '100%' }}>
          <input
            type="text"
            value={editDeviceName}
            onChange={e => setEditDeviceName(e.target.value)}
            placeholder="Device name"
            style={{ width: '100%', marginBottom: 16 }}
            autoFocus
            required
          />
        </form>
      </Modal>

      <Modal
        open={showDeviceDeleteModal}
        onClose={onCloseDelete}
        title="Delete Device"
        actions={[
          <button key="cancel" onClick={onCloseDelete}>
            Cancel
          </button>,
          <button key="delete" onClick={handleDeleteDevice} disabled={!deviceDeletePassword}>
            Delete
          </button>,
        ]}
      >
        <form onSubmit={handleDeleteDevice} style={{ width: '100%' }}>
          <div style={{ marginBottom: 12 }}>
            Enter password to delete <b>{deleteDevice?.name}</b>:
          </div>
          <input
            type="password"
            value={deviceDeletePassword}
            onChange={e => setDeviceDeletePassword(e.target.value)}
            placeholder="Password"
            style={{ width: '100%', marginBottom: 8 }}
            autoFocus
            required
          />
          {deviceDeleteError && (
            <div style={{ color: '#d63031', marginBottom: 8 }}>{deviceDeleteError}</div>
          )}
        </form>
      </Modal>
    </>
  );
};

export default DeviceModals;
