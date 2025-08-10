import React from 'react';

const DeviceList = ({
  selectedProject,
  devices,
  selectedDevice,
  onSelect,
  onCreate,
  onEdit,
  onDelete
}) => {
  if (!selectedProject) return null;

  return (
    <div style={{ marginTop: 32 }}>
      <h3 style={{ color: '#2c5aa0', fontWeight: 700, fontSize: 22, marginBottom: 18 }}>
        Devices for {selectedProject}
      </h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {devices && devices.length > 0 ? (
          devices.map(device => (
            <li key={device} style={{ marginBottom: 12, display: 'flex', alignItems: 'center' }}>
              <span 
                style={{ 
                  flex: 1, 
                  cursor: 'pointer',
                  textDecoration: selectedDevice === device ? 'underline' : 'none',
                  padding: '8px',
                  borderRadius: '4px',
                  backgroundColor: selectedDevice === device ? '#f0f7ff' : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => onSelect(device)}
              >
                {device}
              </span>
              <button 
                onClick={() => onEdit(device)}
                style={{
                  marginLeft: '8px',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                Edit
              </button>
              <button 
                onClick={() => onDelete(device)}
                style={{
                  marginLeft: '8px',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </li>
          ))
        ) : (
          <li style={{ color: '#888' }}>No devices available.</li>
        )}
      </ul>
    </div>
  );
};

export default DeviceList;
