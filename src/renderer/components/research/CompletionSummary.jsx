import React from 'react';
import ActionMenu from '../ActionMenu.jsx';

const CompletionSummary = ({ 
  selectedProject, 
  selectedDevice, 
  selectedVersion, 
  selectedMarket, 
  selectedLicense,
  onBack,
  onStartNew 
}) => {
  if (!selectedProject || !selectedDevice || !selectedVersion || !selectedMarket || !selectedLicense) {
    return null;
  }

  const licenseName = typeof selectedLicense === 'string' ? selectedLicense : selectedLicense?.license_number || selectedLicense?.name;
  const countryName = selectedMarket?.selectedCountry || selectedMarket?.name;

  return (
    <div style={{ marginTop: 0 }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 24 
      }}>
        <div>
          <h3 style={{ color: '#2c5aa0', fontWeight: 700, fontSize: 22, marginBottom: 8 }}>
            ✅ Regulatory Pathway Complete
          </h3>
          <div style={{ color: '#666', fontSize: '14px' }}>
            Your regulatory pathway has been successfully configured
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onStartNew}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Start New Pathway
          </button>
          
          <button
            onClick={onBack}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Back to Research
          </button>
        </div>
      </div>

      {/* Success Card */}
      <div style={{
        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
        borderRadius: '12px',
        padding: '24px',
        color: 'white',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
      }}>
        <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>
          🎉
        </div>
        <h2 style={{ 
          textAlign: 'center', 
          margin: '0 0 16px 0', 
          fontSize: '24px',
          fontWeight: '700'
        }}>
          Pathway Configuration Complete!
        </h2>
        <p style={{ 
          textAlign: 'center', 
          margin: 0, 
          fontSize: '16px',
          opacity: 0.9
        }}>
          You can now proceed with license application and documentation for your medical device.
        </p>
      </div>

      {/* Pathway Summary */}
      <div style={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        backgroundColor: '#fff',
        overflow: 'hidden',
        marginBottom: '24px'
      }}>
        <div style={{
          padding: '16px 20px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e0e0e0',
          fontWeight: '600',
          color: '#2c5aa0'
        }}>
          Regulatory Pathway Summary
        </div>
        
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Project */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                width: '120px', 
                fontWeight: '600', 
                color: '#666',
                fontSize: '14px'
              }}>
                Project:
              </div>
              <div style={{ 
                flex: 1,
                fontSize: '16px',
                color: '#2c5aa0',
                fontWeight: '600'
              }}>
                {selectedProject.name}
              </div>
            </div>

            {/* Device */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                width: '120px', 
                fontWeight: '600', 
                color: '#666',
                fontSize: '14px'
              }}>
                Device:
              </div>
              <div style={{ 
                flex: 1,
                fontSize: '16px',
                color: '#2c5aa0',
                fontWeight: '600'
              }}>
                {selectedDevice.name}
              </div>
            </div>

            {/* Version */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                width: '120px', 
                fontWeight: '600', 
                color: '#666',
                fontSize: '14px'
              }}>
                Version:
              </div>
              <div style={{ 
                flex: 1,
                fontSize: '16px',
                color: '#2c5aa0',
                fontWeight: '600'
              }}>
                {selectedVersion.version_number}
                <span style={{ 
                  marginLeft: '8px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  backgroundColor: selectedVersion.type === 'renewal' ? '#e67e22' : '#27ae60',
                  color: 'white'
                }}>
                  {selectedVersion.type === 'renewal' ? 'Renewal' : 'Version'}
                </span>
              </div>
            </div>

            {/* Market */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                width: '120px', 
                fontWeight: '600', 
                color: '#666',
                fontSize: '14px'
              }}>
                Market:
              </div>
              <div style={{ 
                flex: 1,
                fontSize: '16px',
                color: '#2c5aa0',
                fontWeight: '600'
              }}>
                {selectedMarket.name}
              </div>
            </div>

            {/* Country */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                width: '120px', 
                fontWeight: '600', 
                color: '#666',
                fontSize: '14px'
              }}>
                Country:
              </div>
              <div style={{ 
                flex: 1,
                fontSize: '16px',
                color: '#2c5aa0',
                fontWeight: '600'
              }}>
                {countryName}
              </div>
            </div>

            {/* License */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                width: '120px', 
                fontWeight: '600', 
                color: '#666',
                fontSize: '14px'
              }}>
                License:
              </div>
              <div style={{ 
                flex: 1,
                fontSize: '16px',
                color: '#2c5aa0',
                fontWeight: '600'
              }}>
                {licenseName}
                <span style={{ 
                  marginLeft: '8px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  backgroundColor: '#17a2b8',
                  color: 'white'
                }}>
                  License
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div style={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        backgroundColor: '#fff',
        overflow: 'hidden',
        marginBottom: '24px'
      }}>
        <div style={{
          padding: '16px 20px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e0e0e0',
          fontWeight: '600',
          color: '#2c5aa0'
        }}>
          Recommended Next Steps
        </div>
        
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ 
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#28a745',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '600',
                flexShrink: 0,
                marginTop: '2px'
              }}>
                1
              </div>
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                  Prepare Documentation
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  Gather all required documents for {licenseName} license application in {countryName}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ 
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#17a2b8',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '600',
                flexShrink: 0,
                marginTop: '2px'
              }}>
                2
              </div>
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                  Submit Application
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  Submit your {licenseName} license application to the relevant regulatory authority
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ 
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#ffc107',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '600',
                flexShrink: 0,
                marginTop: '2px'
              }}>
                3
              </div>
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                  Track Progress
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  Monitor application status and respond to any regulatory queries
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '16px',
        marginTop: '32px'
      }}>
        <button
          onClick={onStartNew}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.target.style.backgroundColor = '#218838';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.target.style.backgroundColor = '#28a745';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          🚀 Start New Pathway
        </button>
        
        <button
          onClick={onBack}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.target.style.backgroundColor = '#5a6268';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.target.style.backgroundColor = '#6c757d';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          ← Back to Research
        </button>
      </div>
    </div>
  );
};

export default CompletionSummary;