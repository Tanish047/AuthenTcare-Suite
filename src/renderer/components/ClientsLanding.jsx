import React from 'react';

const CLIENTS_BLUE = '#2363d1';

function ClientsLanding({ onWorkspace }) {
  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 100px)' }}>
      <div style={{ width: '33.33%', background: CLIENTS_BLUE, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', height: '100%' }}>
        <div style={{ maxWidth: 220, textAlign: 'center', fontSize: 20, fontWeight: 600, marginTop: 60 }}>
          At AuthenTcare, we serve our clients with utmost care and diligence.
        </div>
      </div>
      <div style={{ width: '66.67%', background: '#fff', height: '100%', padding: '32px 32px 0 32px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div style={{ 
          padding: 24, 
          border: '2px solid ' + CLIENTS_BLUE, 
          borderRadius: 12, 
          background: 'rgba(35, 99, 209, 0.05)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          marginBottom: 40
        }}
        onClick={onWorkspace}
        >
          <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: CLIENTS_BLUE }}>Client Workspace</h3>
          <p style={{ fontSize: 18, color: '#333', lineHeight: 1.5, marginBottom: 16 }}>
            Access detailed client management with profiles, devices, and regulatory tools.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ClientsLanding; 