import React, { useState } from 'react';
import Modal from '../Modal.jsx';

const BulkDeleteModal = ({
  show,
  onClose,
  versionsToDelete,
  onConfirmDelete,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onConfirmDelete(versionsToDelete, password);
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to delete versions');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    setLoading(false);
    onClose();
  };

  return (
    <Modal
      open={show}
      onClose={handleClose}
      title="Delete Selected Versions"
      actions={[
        <button key="cancel" onClick={handleClose} disabled={loading}>
          Cancel
        </button>,
        <button 
          key="delete" 
          onClick={handleDelete} 
          disabled={!password.trim() || loading}
          style={{
            backgroundColor: loading ? '#ccc' : '#d63031',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Deleting...' : 'Delete All'}
        </button>,
      ]}
    >
      <div style={{ width: '100%' }}>
        <div style={{ marginBottom: '16px', color: '#d63031', fontWeight: '600' }}>
          ⚠️ Warning: This action cannot be undone!
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          You are about to delete <strong>{versionsToDelete?.length || 0}</strong> version(s):
        </div>
        
        <div style={{ 
          maxHeight: '150px', 
          overflowY: 'auto', 
          backgroundColor: '#f8f9fa',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          {versionsToDelete?.map(version => (
            <div key={version.id} style={{ 
              padding: '4px 0',
              borderBottom: '1px solid #e0e0e0',
              fontSize: '14px'
            }}>
              <strong>{version.version_number}</strong> 
              <span style={{ color: '#666', marginLeft: '8px' }}>
                ({version.type === 'renewal' ? 'Renewal' : 'Version'})
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleDelete} style={{ width: '100%' }}>
          <div style={{ marginBottom: '12px' }}>
            Enter password to confirm deletion:
          </div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            style={{ 
              width: '100%', 
              marginBottom: '8px',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
            autoFocus
            required
          />
          {error && (
            <div style={{ color: '#d63031', marginBottom: '8px', fontSize: '14px' }}>
              {error}
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
};

export default BulkDeleteModal;