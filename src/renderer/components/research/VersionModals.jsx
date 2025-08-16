import React from 'react';
import Modal from '../Modal.jsx';

const VersionModals = ({
  showCreate: showVersionModal,
  showEdit: showVersionEditModal,
  showDelete: showVersionDeleteModal,
  onCloseCreate,
  onCloseEdit,
  onCloseDelete,
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
  handleDeleteVersion,
}) => {
  return (
    <>
      <Modal
        open={showVersionModal}
        onClose={onCloseCreate}
        title="Add Version"
        actions={[
          <button key="cancel" onClick={onCloseCreate}>
            Cancel
          </button>,
          <button key="save" onClick={handleCreateVersion} disabled={!newVersionName.trim()}>
            Save
          </button>,
        ]}
      >
        <form onSubmit={handleCreateVersion} style={{ width: '100%' }}>
          <input
            type="text"
            value={newVersionName}
            onChange={e => setNewVersionName(e.target.value)}
            placeholder="Version name"
            style={{ width: '100%', marginBottom: 16 }}
            autoFocus
            required
          />
        </form>
      </Modal>

      <Modal
        open={showVersionEditModal}
        onClose={onCloseEdit}
        title="Edit Version"
        actions={[
          <button key="cancel" onClick={onCloseEdit}>
            Cancel
          </button>,
          <button
            key="save"
            onClick={handleEditVersion}
            disabled={!editVersionName.trim() || editVersionName.trim() === editingVersion?.version_number}
          >
            Save
          </button>,
        ]}
      >
        <form onSubmit={handleEditVersion} style={{ width: '100%' }}>
          <input
            type="text"
            value={editVersionName}
            onChange={e => setEditVersionName(e.target.value)}
            placeholder="Version name"
            style={{ width: '100%', marginBottom: 16 }}
            autoFocus
            required
          />
        </form>
      </Modal>

      <Modal
        open={showVersionDeleteModal}
        onClose={() => {
          onCloseDelete();
          setVersionDeletePassword('');
        }}
        title="Delete Version"
        actions={[
          <button
            key="cancel"
            onClick={() => {
              onCloseDelete();
              setVersionDeletePassword('');
            }}
          >
            Cancel
          </button>,
          <button key="delete" onClick={handleDeleteVersion} disabled={!versionDeletePassword}>
            Delete
          </button>,
        ]}
      >
        <form onSubmit={handleDeleteVersion} style={{ width: '100%' }}>
          <div style={{ marginBottom: 12 }}>
            Enter password to delete <b>{deleteVersion?.version_number}</b>:
          </div>
          <input
            type="password"
            value={versionDeletePassword}
            onChange={e => setVersionDeletePassword(e.target.value)}
            placeholder="Password"
            style={{ width: '100%', marginBottom: 8 }}
            autoFocus
            required
          />
          {versionDeleteError && (
            <div style={{ color: '#d63031', marginBottom: 8 }}>{versionDeleteError}</div>
          )}
        </form>
      </Modal>
    </>
  );
};

export default VersionModals;
