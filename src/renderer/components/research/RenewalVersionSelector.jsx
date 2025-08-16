import React, { useState } from 'react';
import Modal from '../Modal.jsx';

const RenewalVersionSelector = ({
  show,
  onClose,
  versions,
  onSelectVersion,
}) => {
  const [selectedBaseVersion, setSelectedBaseVersion] = useState(null);

  // Filter only new versions (not renewals) for base selection
  const baseVersions = versions.filter(v => {
    // Check both type and version number pattern to ensure we only show actual versions
    return v.type === 'new_version' && v.version_number && v.version_number.match(/^v\d+$/);
  });

  const handleConfirm = () => {
    if (selectedBaseVersion) {
      onSelectVersion(selectedBaseVersion);
      onClose();
      setSelectedBaseVersion(null);
    }
  };

  const handleCancel = () => {
    onClose();
    setSelectedBaseVersion(null);
  };

  return (
    <Modal
      open={show}
      onClose={handleCancel}
      title="Select Base Version for Renewal"
      actions={[
        <button key="cancel" onClick={handleCancel}>
          Cancel
        </button>,
        <button 
          key="confirm" 
          onClick={handleConfirm} 
          disabled={!selectedBaseVersion}
          style={{
            backgroundColor: selectedBaseVersion ? '#2c5aa0' : '#ccc',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: selectedBaseVersion ? 'pointer' : 'not-allowed'
          }}
        >
          Create Renewal
        </button>,
      ]}
    >
      <div style={{ width: '100%' }}>
        <p style={{ marginBottom: '16px', color: '#666' }}>
          Select which version you want to create a renewal for:
        </p>
        
        {baseVersions.length > 0 ? (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {baseVersions.map(version => (
              <div
                key={version.id}
                onClick={() => setSelectedBaseVersion(version)}
                style={{
                  padding: '12px',
                  border: '1px solid ' + (selectedBaseVersion?.id === version.id ? '#2c5aa0' : '#e0e0e0'),
                  borderRadius: '6px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  backgroundColor: selectedBaseVersion?.id === version.id ? '#f0f7ff' : '#fff',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  if (selectedBaseVersion?.id !== version.id) {
                    e.target.style.backgroundColor = '#f8f9fa';
                  }
                }}
                onMouseLeave={e => {
                  if (selectedBaseVersion?.id !== version.id) {
                    e.target.style.backgroundColor = '#fff';
                  }
                }}
              >
                <div style={{ fontWeight: '600', color: '#2c5aa0', marginBottom: '4px' }}>
                  {version.version_number}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Created: {new Date(version.created_at).toLocaleDateString('en-GB')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
            No base versions available. Create a version first.
          </div>
        )}
      </div>
    </Modal>
  );
};

export default RenewalVersionSelector;