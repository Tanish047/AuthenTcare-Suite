import React from 'react';

const CLIENTS_BLUE = '#2363d1';

function ClientWorkspace() {
  return (
    <div style={{ padding: 32, height: 'calc(100vh - 100px)' }}>
      <h2 style={{ color: CLIENTS_BLUE, fontWeight: 800, fontSize: 28, marginBottom: 24 }}>Client Workspace</h2>
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#333' }}>Comprehensive Client Management</div>
      <div style={{ display: 'grid', gap: 20 }}>
        <div style={{ 
          padding: 24, 
          border: '1px solid #e0e0e0', 
          borderRadius: 8, 
          background: '#fafafa',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
        onMouseLeave={(e) => e.target.style.background = '#fafafa'}
        >
          <h3 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12, color: '#333' }}>Client Profile & History</h3>
          <ul style={{ fontSize: 16, color: '#333', marginLeft: 16 }}>
            <li>Contact Information & Key Personnel</li>
            <li>Interaction Logs</li>
            <li>Billing & Invoices</li>
            <li>Past Projects & Engagements</li>
          </ul>
        </div>
        <div style={{ 
          padding: 24, 
          border: '1px solid #e0e0e0', 
          borderRadius: 8, 
          background: '#fafafa',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
        onMouseLeave={(e) => e.target.style.background = '#fafafa'}
        >
          <h3 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12, color: '#333' }}>Devices</h3>
          <div style={{ fontSize: 16, color: '#333', marginBottom: 12 }}>
            Manage all devices for this client:
          </div>
          <ul style={{ fontSize: 16, color: '#333', marginLeft: 16 }}>
            <li>Device Workspace</li>
            <li>Iterations & Renewals</li>
            <li>Master Document Library</li>
            <li>Target Markets</li>
          </ul>
        </div>
        <div style={{ 
          padding: 24, 
          border: '1px solid #e0e0e0', 
          borderRadius: 8, 
          background: '#fafafa',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
        onMouseLeave={(e) => e.target.style.background = '#fafafa'}
        >
          <h3 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12, color: '#333' }}>Regulatory Tools</h3>
          <div style={{ fontSize: 16, color: '#333', marginBottom: 12 }}>
            Access Pro-Analyzer Dashboard tools:
          </div>
          <ul style={{ fontSize: 16, color: '#333', marginLeft: 16 }}>
            <li>Timeline (Auto-Tool)</li>
            <li>Cost Estimate (Auto-Tool)</li>
            <li>Predicate Finder</li>
            <li>Competitor Analysis</li>
            <li>Gap Analysis</li>
            <li>Pathway-to-Market Flowchart</li>
            <li>Strategy Maker</li>
            <li>Regulatory Advisor (AI-driven insights)</li>
            <li>QMS & PMS Guidance</li>
            <li>Master File Maker (DMR, etc.)</li>
            <li>PPT Generator</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ClientWorkspace; 