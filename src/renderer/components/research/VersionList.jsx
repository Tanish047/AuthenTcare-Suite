import React from 'react';

const VersionList = ({
  selectedProject,
  selectedDevice,
  versions,
  selectedVersion,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
}) => {
  if (!selectedProject || !selectedDevice) return null;

  return (
    <div style={{ marginTop: 32 }}>
      <h4 style={{ color: '#2c5aa0', fontWeight: 700, fontSize: 18, marginBottom: 12 }}>
        Versions for {selectedDevice}
      </h4>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {versions && versions.length > 0 ? (
          versions.map(version => (
            <li key={version} style={{ marginBottom: 12, display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  flex: 1,
                  cursor: 'pointer',
                  textDecoration: selectedVersion === version ? 'underline' : 'none',
                  padding: '8px',
                  borderRadius: '4px',
                  backgroundColor: selectedVersion === version ? '#f0f7ff' : 'transparent',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => onSelect(version)}
              >
                {version}
              </span>
              <button
                onClick={() => onEdit(version)}
                style={{
                  marginLeft: '8px',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                }}
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(version)}
                style={{
                  marginLeft: '8px',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </li>
          ))
        ) : (
          <li style={{ color: '#888' }}>No versions available.</li>
        )}
      </ul>
      <button
        onClick={onCreate}
        style={{
          marginTop: '16px',
          padding: '8px 16px',
          borderRadius: '4px',
          backgroundColor: '#2c5aa0',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Create New Version
      </button>
    </div>
  );
};

export default VersionList;
