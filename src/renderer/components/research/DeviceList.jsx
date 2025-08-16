import React from 'react';
import ActionMenu from '../ActionMenu.jsx';

const DeviceList = ({
  selectedProject,
  devices,
  selectedDevice,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
}) => {
  if (!selectedProject) return null;

  return (
    <div style={{ marginTop: 0 }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 16 
      }}>
        <div style={{ color: '#666', fontSize: '14px' }}>
          Devices for <strong>{selectedProject.name}</strong>
        </div>
        <button
          onClick={onCreate}
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            backgroundColor: '#2c5aa0',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
          }}
        >
          <span>+</span>
          Add a Device
        </button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {devices && devices.length > 0 ? (
          devices.map(device => (
            <li key={device.id} style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  border: '1px solid ' + (selectedDevice?.id === device.id ? '#2c5aa0' : '#e0e0e0'),
                  borderRadius: '8px',
                  backgroundColor: selectedDevice?.id === device.id ? '#f0f7ff' : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => onSelect(device)}
                onMouseEnter={e => {
                  if (selectedDevice?.id !== device.id) {
                    e.target.style.backgroundColor = '#f8f9fa';
                    e.target.style.borderColor = '#ccc';
                  }
                }}
                onMouseLeave={e => {
                  if (selectedDevice?.id !== device.id) {
                    e.target.style.backgroundColor = '#fff';
                    e.target.style.borderColor = '#e0e0e0';
                  }
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: '600', 
                    fontSize: '16px', 
                    color: '#2c5aa0',
                    marginBottom: '4px'
                  }}>
                    {device.name}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#666'
                  }}>
                    Click to view versions
                  </div>
                </div>
                
                <ActionMenu
                  actions={[
                    {
                      key: 'edit',
                      label: 'Edit',
                      icon: '✏️',
                      onClick: () => onEdit(device)
                    },
                    {
                      key: 'delete',
                      label: 'Delete',
                      icon: '🗑️',
                      danger: true,
                      onClick: () => onDelete(device)
                    }
                  ]}
                />
              </div>
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
