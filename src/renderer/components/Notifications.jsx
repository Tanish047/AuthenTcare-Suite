import React from 'react';

function Notifications() {
  return (
    <div style={{ padding: 32, height: 'calc(100vh - 100px)' }}>
      <h2 style={{ color: '#f57c00', fontWeight: 800, fontSize: 28, marginBottom: 24 }}>
        Notifications
      </h2>
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#333' }}>
        Recent Activity
      </div>
      <div
        style={{
          padding: 20,
          border: '1px solid #e0e0e0',
          borderRadius: 8,
          background: '#fafafa',
        }}
      >
        <p style={{ fontSize: 16, color: '#333', lineHeight: 1.5 }}>
          You have no new notifications at this time.
        </p>
      </div>
    </div>
  );
}

export default Notifications;
