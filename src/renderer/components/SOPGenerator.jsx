import React, { useState } from 'react';

const SOPGenerator = ({
  selectedProject,
  selectedDevice,
  selectedVersion,
  selectedMarket,
  selectedLicense,
  onBack
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [sopContent, setSOPContent] = useState('');

  const licenseName = typeof selectedLicense === 'string' 
    ? selectedLicense 
    : selectedLicense?.license_number || selectedLicense?.name || 'Unknown License';

  return (
    <div style={{
      padding: '32px',
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}>
        <div>
          <h1 style={{
            color: '#1f2937',
            fontWeight: '700',
            fontSize: '28px',
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            📝 SOP Generator
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            margin: 0
          }}>
            Generate standard operating procedures from templates
          </p>
        </div>

        <button
          onClick={onBack}
          style={{
            padding: '12px 24px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => {
            e.target.style.backgroundColor = '#4b5563';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.target.style.backgroundColor = '#6b7280';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          ← Back to Completion
        </button>
      </div>

      {/* License Information Section */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}>
        <h2 style={{
          color: '#1f2937',
          fontWeight: '600',
          fontSize: '20px',
          margin: '0 0 16px 0'
        }}>
          📋 {licenseName} - Standard Operating Procedure
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div>
            <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Project:</span>
            <div style={{ color: '#1f2937', fontWeight: '600' }}>{selectedProject?.name || 'N/A'}</div>
          </div>
          <div>
            <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Device:</span>
            <div style={{ color: '#1f2937', fontWeight: '600' }}>{selectedDevice?.name || 'N/A'}</div>
          </div>
          <div>
            <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Version:</span>
            <div style={{ color: '#1f2937', fontWeight: '600' }}>v{selectedVersion?.version_number || 'N/A'}</div>
          </div>
          <div>
            <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Market:</span>
            <div style={{ color: '#1f2937', fontWeight: '600' }}>{selectedMarket?.name || 'N/A'}</div>
          </div>
          <div>
            <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>License:</span>
            <div style={{ color: '#1f2937', fontWeight: '600' }}>{licenseName}</div>
          </div>
        </div>
      </div>

      {/* Template Selection Section */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}>
        <h3 style={{
          color: '#1f2937',
          fontWeight: '600',
          fontSize: '18px',
          margin: '0 0 16px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📁 Template Selection
        </h3>

        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '16px'
        }}>
          <button
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => e.target.style.backgroundColor = '#2563eb'}
            onMouseLeave={e => e.target.style.backgroundColor = '#3b82f6'}
          >
            📂 Browse User Database
          </button>
          
          <button
            style={{
              padding: '12px 24px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => e.target.style.backgroundColor = '#059669'}
            onMouseLeave={e => e.target.style.backgroundColor = '#10b981'}
          >
            📄 Default Templates
          </button>
        </div>

        {!selectedTemplate ? (
          <div style={{
            padding: '32px',
            textAlign: 'center',
            color: '#6b7280',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '2px dashed #d1d5db'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
            <p style={{ margin: 0, fontSize: '16px' }}>
              Select a template to begin generating your SOP
            </p>
          </div>
        ) : (
          <div style={{
            padding: '16px',
            backgroundColor: '#f0f9ff',
            borderRadius: '8px',
            border: '1px solid #0ea5e9'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#0c4a6e',
              fontWeight: '500'
            }}>
              ✅ Selected: {selectedTemplate}
            </div>
          </div>
        )}
      </div>

      {/* Template Editor Section */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}>
        <h3 style={{
          color: '#1f2937',
          fontWeight: '600',
          fontSize: '18px',
          margin: '0 0 16px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ✏️ Template Editor
        </h3>

        <div style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          minHeight: '400px',
          padding: '16px',
          backgroundColor: '#fafafa',
          fontFamily: 'monospace',
          fontSize: '14px',
          lineHeight: '1.6'
        }}>
          {!selectedTemplate ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#9ca3af',
              fontSize: '16px'
            }}>
              Select a template to start editing
            </div>
          ) : (
            <div>
              <p style={{ color: '#059669', fontWeight: '600', marginBottom: '16px' }}>
                📝 Auto-filled SOP Template Preview:
              </p>
              <div style={{ color: '#374151' }}>
                <h4>Standard Operating Procedure</h4>
                <p><strong>Project:</strong> {selectedProject?.name || '[PROJECT_NAME]'}</p>
                <p><strong>Device:</strong> {selectedDevice?.name || '[DEVICE_NAME]'}</p>
                <p><strong>Version:</strong> v{selectedVersion?.version_number || '[VERSION_NUMBER]'}</p>
                <p><strong>Market:</strong> {selectedMarket?.name || '[MARKET_NAME]'}</p>
                <p><strong>License:</strong> {licenseName}</p>
                <hr style={{ margin: '16px 0', border: '1px solid #e5e7eb' }} />
                <p><strong>1. Purpose</strong></p>
                <p>This SOP defines the procedures for regulatory compliance of {selectedDevice?.name || '[DEVICE_NAME]'} in the {selectedMarket?.name || '[MARKET_NAME]'} market.</p>
                <p><strong>2. Scope</strong></p>
                <p>This procedure applies to version {selectedVersion?.version_number || '[VERSION_NUMBER]'} of {selectedDevice?.name || '[DEVICE_NAME]'} under project {selectedProject?.name || '[PROJECT_NAME]'}.</p>
                <p><strong>3. Responsibilities</strong></p>
                <p>• Regulatory Affairs Team</p>
                <p>• Quality Assurance Team</p>
                <p>• Project Management Team</p>
                <p><strong>4. Procedure</strong></p>
                <p>[Template content will be loaded here with auto-filled data]</p>
              </div>
            </div>
          )}
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '16px'
        }}>
          <button
            style={{
              padding: '12px 24px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => e.target.style.backgroundColor = '#059669'}
            onMouseLeave={e => e.target.style.backgroundColor = '#10b981'}
          >
            💾 Save to User Database
          </button>
          
          <button
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => e.target.style.backgroundColor = '#2563eb'}
            onMouseLeave={e => e.target.style.backgroundColor = '#3b82f6'}
          >
            📥 Download
          </button>
          
          <button
            style={{
              padding: '12px 24px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => e.target.style.backgroundColor = '#d97706'}
            onMouseLeave={e => e.target.style.backgroundColor = '#f59e0b'}
          >
            🔄 Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default SOPGenerator;