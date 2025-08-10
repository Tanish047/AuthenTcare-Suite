import React from 'react';

function ResearchLanding({ onWorkspace }) {
  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 100px)' }}>
      <div style={{ width: '33.33%', background: '#2c5aa0', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', height: '100%' }}>
        <div style={{ maxWidth: 220, textAlign: 'center', fontSize: 20, fontWeight: 600, marginTop: 60 }}>
          At AuthenTcare, we conduct thorough research with precision and expertise.
        </div>
      </div>
      <div style={{ width: '66.67%', background: '#fff', height: '100%', padding: '32px 32px 0 32px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div style={{ 
          padding: 24, 
          border: '2px solid #2c5aa0', 
          borderRadius: 12, 
          background: 'rgba(44, 90, 160, 0.05)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          marginBottom: 40
        }}
        onClick={() => onWorkspace('research-workspace')}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(44, 90, 160, 0.1)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(44, 90, 160, 0.05)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
        >
          <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: '#2c5aa0' }}>Project Workspace</h3>
          <p style={{ fontSize: 18, color: '#333', lineHeight: 1.5, marginBottom: 16 }}>
            Access comprehensive research tools with project management, devices, and regulatory analysis.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResearchLanding; 