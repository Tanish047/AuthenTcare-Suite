import React from 'react';
import Modal from '../Modal.jsx';

const ProjectModals = ({
  showCreateModal,
  setShowCreateModal,
  showEditModal,
  setShowEditModal,
  showDeleteModal,
  setShowDeleteModal,
  newProjectName,
  setNewProjectName,
  editProjectName,
  setEditProjectName,
  editingProject,
  deleteProject,
  deletePassword,
  setDeletePassword,
  deleteError,
  handleCreateProject,
  handleEditProject,
  handleDeleteProject,
}) => {
  return (
    <>
      <Modal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewProjectName('');
        }}
        title="Create New Project"
        actions={[
          <button
            key="cancel"
            onClick={() => {
              setShowCreateModal(false);
              setNewProjectName('');
            }}
            style={{
              padding: '6px 16px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>,
          <button
            key="save"
            onClick={handleCreateProject}
            disabled={!newProjectName.trim()}
            style={{
              padding: '6px 16px',
              borderRadius: '4px',
              border: 'none',
              background: !newProjectName.trim() ? '#ccc' : '#2c5aa0',
              color: 'white',
              cursor: !newProjectName.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            Create Project
          </button>,
        ]}
      >
        <form onSubmit={handleCreateProject} style={{ width: '100%' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, color: '#333', fontSize: '14px' }}>
              Project Name
            </label>
            <input
              type="text"
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              placeholder="Enter project name"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '14px',
              }}
              autoFocus
              required
            />
            <small style={{ display: 'block', marginTop: 4, color: '#666' }}>
              Give your project a clear, descriptive name
            </small>
          </div>
        </form>
      </Modal>

      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Project"
        actions={[
          <button key="cancel" onClick={() => setShowEditModal(false)}>
            Cancel
          </button>,
          <button
            key="save"
            onClick={handleEditProject}
            disabled={!editProjectName.trim() || editProjectName.trim() === editingProject}
          >
            Save
          </button>,
        ]}
      >
        <form onSubmit={handleEditProject} style={{ width: '100%' }}>
          <input
            type="text"
            value={editProjectName}
            onChange={e => setEditProjectName(e.target.value)}
            placeholder="Project name"
            style={{ width: '100%', marginBottom: 16 }}
            autoFocus
            required
          />
        </form>
      </Modal>

      <Modal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletePassword('');
        }}
        title="Delete Project"
        actions={[
          <button
            key="cancel"
            onClick={() => {
              setShowDeleteModal(false);
              setDeletePassword('');
            }}
          >
            Cancel
          </button>,
          <button key="delete" onClick={handleDeleteProject} disabled={!deletePassword}>
            Delete
          </button>,
        ]}
      >
        <form onSubmit={handleDeleteProject} style={{ width: '100%' }}>
          <div style={{ marginBottom: 12 }}>
            Enter password to delete <b>{deleteProject}</b>:
          </div>
          <input
            type="password"
            value={deletePassword}
            onChange={e => setDeletePassword(e.target.value)}
            placeholder="Password"
            style={{ width: '100%', marginBottom: 8 }}
            autoFocus
            required
          />
          {deleteError && <div style={{ color: '#d63031', marginBottom: 8 }}>{deleteError}</div>}
        </form>
      </Modal>
    </>
  );
};

export default ProjectModals;
