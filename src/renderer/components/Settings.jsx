import React from 'react';

function Settings({ menuData }) {
  const settingsData = menuData.find(item => item.key === 'settings');
  return (
    <div style={{ padding: 32, height: 'calc(100vh - 100px)' }}>
      <h2 style={{ color: '#388e3c', fontWeight: 800, fontSize: 28, marginBottom: 24 }}>Settings</h2>
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#333' }}>Configuration Options</div>
      <div style={{ display: 'grid', gap: 16 }}>
        {settingsData.children.map((item) => (
          <div key={item.key} style={{ 
            padding: 20, 
            border: '1px solid #e0e0e0', 
            borderRadius: 8, 
            background: '#fafafa',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
          onMouseLeave={(e) => e.target.style.background = '#fafafa'}
          >
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, color: '#333' }}>{item.label}</h3>
            <p style={{ fontSize: 16, color: '#333', lineHeight: 1.5 }}>
              Configure your {item.label.toLowerCase()} preferences and settings.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Settings; 