import React, { useState, useEffect } from 'react';
import ActionMenu from '../ActionMenu.jsx';

const CompletionSummary = ({ 
  selectedProject, 
  selectedDevice, 
  selectedVersion, 
  selectedMarket, 
  selectedLicense,
  onBack,
  onStartNew,
  onUserDatabase
}) => {
  const [showProAnalyzerMenu, setShowProAnalyzerMenu] = useState(false);

  // Keyboard shortcut for ProAnalyzer menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+P to open ProAnalyzer menu
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        setShowProAnalyzerMenu(true);
      }
      // Escape to close menu
      if (e.key === 'Escape' && showProAnalyzerMenu) {
        setShowProAnalyzerMenu(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showProAnalyzerMenu]);

  const proAnalyzerTools = [
    { name: 'Competitor Analyser', icon: '🏢', description: 'Analyze market competitors and positioning' },
    { name: 'Cost Estimation Tool', icon: '💰', description: 'Estimate regulatory and development costs' },
    { name: 'Gap Analyser', icon: '🔍', description: 'Identify regulatory gaps and requirements' },
    { name: 'Master File Maker', icon: '📋', description: 'Generate comprehensive regulatory files' },
    { name: 'Pathway To Market', icon: '🛣️', description: 'Map optimal market entry strategies' },
    { name: 'PMS Advisor Pro', icon: '📊', description: 'Post-market surveillance guidance' },
    { name: 'PPT Generator', icon: '📑', description: 'Create presentation materials' },
    { name: 'Predicate Finder', icon: '🔎', description: 'Find regulatory predicates and precedents' },
    { name: 'QMS Advisor Pro', icon: '⚙️', description: 'Quality management system guidance' },
    { name: 'Regulatory Advisor', icon: '📜', description: 'Expert regulatory consultation' },
    { name: 'Strategy Maker', icon: '🎯', description: 'Develop regulatory strategies' },
    { name: 'Timeline Pro', icon: '⏱️', description: 'Create detailed project timelines' },
  ];

  const handleToolClick = (toolName) => {
    console.log(`Opening ${toolName} tool...`);
    // TODO: Implement tool navigation/opening logic
    setShowProAnalyzerMenu(false);
  };
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
          onClick={onUserDatabase}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.target.style.backgroundColor = '#138496';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.target.style.backgroundColor = '#17a2b8';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          📁 User Database
        </button>

        <button
          onClick={() => setShowProAnalyzerMenu(true)}
          title="Open ProAnalyzer Tools (Ctrl+P)"
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            backgroundColor: '#fd7e14',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            position: 'relative',
          }}
          onMouseEnter={e => {
            e.target.style.backgroundColor = '#e8690b';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.target.style.backgroundColor = '#fd7e14';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          🔧 ProAnalyzer Tools
          <span style={{
            fontSize: '12px',
            opacity: '0.8',
            marginLeft: '8px',
          }}>
            (Ctrl+P)
          </span>
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

      {/* ProAnalyzer Tools Menu */}
      {showProAnalyzerMenu && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowProAnalyzerMenu(false);
            }
          }}
        >
          <div 
            className="proanalyzer-menu"
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '900px',
              width: '90%',
              maxHeight: '85vh',
              overflow: 'auto',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              animation: 'slideUp 0.3s ease-out',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '24px',
              borderBottom: '2px solid #f0f0f0',
              paddingBottom: '16px',
            }}>
              <div>
                <h2 style={{
                  color: '#2c5aa0',
                  fontWeight: '700',
                  fontSize: '24px',
                  margin: '0 0 8px 0',
                }}>
                  🔧 ProAnalyzer Tools
                </h2>
                <div style={{
                  color: '#666',
                  fontSize: '14px',
                  lineHeight: '1.4',
                }}>
                  <strong>Current Pathway:</strong> {selectedProject?.name} → {selectedDevice?.name} → v{selectedVersion?.version_number} → {selectedMarket?.name}
                </div>
              </div>
              <button
                onClick={() => setShowProAnalyzerMenu(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '4px',
                  borderRadius: '4px',
                  flexShrink: 0,
                }}
                onMouseEnter={e => e.target.style.backgroundColor = '#f0f0f0'}
                onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
              >
                ✕
              </button>
            </div>

            {/* Tools Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '16px',
            }}>
              {proAnalyzerTools.map((tool, index) => (
                <div
                  key={index}
                  onClick={() => handleToolClick(tool.name)}
                  style={{
                    padding: '20px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#fff',
                  }}
                  onMouseEnter={e => {
                    e.target.style.borderColor = '#fd7e14';
                    e.target.style.backgroundColor = '#fff8f3';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(253, 126, 20, 0.15)';
                  }}
                  onMouseLeave={e => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.backgroundColor = '#fff';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}>
                    <div style={{
                      fontSize: '24px',
                      flexShrink: 0,
                    }}>
                      {tool.icon}
                    </div>
                    <div>
                      <h3 style={{
                        color: '#2c5aa0',
                        fontWeight: '600',
                        fontSize: '16px',
                        margin: '0 0 8px 0',
                      }}>
                        {tool.name}
                      </h3>
                      <p style={{
                        color: '#666',
                        fontSize: '14px',
                        margin: 0,
                        lineHeight: '1.4',
                      }}>
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid #f0f0f0',
              textAlign: 'center',
              color: '#666',
              fontSize: '14px',
            }}>
              Select a tool to enhance your regulatory pathway analysis
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompletionSummary;