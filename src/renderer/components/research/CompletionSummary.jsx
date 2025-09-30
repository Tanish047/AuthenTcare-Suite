import React, { useState, useEffect } from 'react';
import InteractiveChecklist from './InteractiveChecklist.jsx';

const CompletionSummary = ({
  selectedProject,
  selectedDevice,
  selectedVersion,
  selectedMarket,
  selectedLicense,
  onBack,
  onStartNew,
  onUserDatabase,
  onSOPGenerator,
}) => {
  const [isProAnalyzerExpanded, setIsProAnalyzerExpanded] = useState(false);

  // Keyboard shortcut for ProAnalyzer sidebar
  useEffect(() => {
    const handleKeyDown = e => {
      // Ctrl+P to toggle ProAnalyzer sidebar
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        setIsProAnalyzerExpanded(!isProAnalyzerExpanded);
      }
      // Escape to close sidebar
      if (e.key === 'Escape' && isProAnalyzerExpanded) {
        setIsProAnalyzerExpanded(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isProAnalyzerExpanded]);

  const proAnalyzerTools = [
    {
      name: 'Competitor Analyser',
      icon: '🏢',
      description: 'Analyze market competitors and positioning',
    },
    {
      name: 'Cost Estimation Tool',
      icon: '💰',
      description: 'Estimate regulatory and development costs',
    },
    { name: 'Gap Analyser', icon: '🔍', description: 'Identify regulatory gaps and requirements' },
    {
      name: 'Master File Maker',
      icon: '📋',
      description: 'Generate comprehensive regulatory files',
    },
    { name: 'Pathway To Market', icon: '🛣️', description: 'Map optimal market entry strategies' },
    { name: 'PMS Advisor Pro', icon: '📊', description: 'Post-market surveillance guidance' },
    { name: 'PPT Generator', icon: '📑', description: 'Create presentation materials' },
    {
      name: 'Predicate Finder',
      icon: '🔎',
      description: 'Find regulatory predicates and precedents',
    },
    { name: 'QMS Advisor Pro', icon: '⚙️', description: 'Quality management system guidance' },
    { name: 'Regulatory Advisor', icon: '📜', description: 'Expert regulatory consultation' },
    {
      name: 'SOP Generator',
      icon: '📝',
      description: 'Generate standard operating procedures from templates',
    },
    { name: 'Strategy Maker', icon: '🎯', description: 'Develop regulatory strategies' },
    { name: 'Timeline Pro', icon: '⏱️', description: 'Create detailed project timelines' },
  ];

  const handleToolClick = toolName => {
    console.log(`Opening ${toolName} tool...`);

    if (toolName === 'SOP Generator') {
      // Navigate to SOP Generator page while preserving pathway context
      // We'll need to access dispatch from parent component
      if (onSOPGenerator) {
        onSOPGenerator();
      }
    }
    // TODO: Implement other tool navigation/opening logic
    // Keep sidebar open for easy access to multiple tools
  };
  if (
    !selectedProject ||
    !selectedDevice ||
    !selectedVersion ||
    !selectedMarket ||
    !selectedLicense
  ) {
    return null;
  }

  const licenseName =
    typeof selectedLicense === 'string'
      ? selectedLicense
      : selectedLicense?.license_number || selectedLicense?.name;
  const countryName = selectedMarket?.selectedCountry || selectedMarket?.name;

  return (
    <div
      style={{
        position: 'relative',
        marginTop: 0,
        display: 'flex',
        minHeight: '100vh',
      }}
    >
      {/* ProAnalyzer Sidebar */}
      <div
        className="proanalyzer-sidebar-container"
        style={{
          position: 'fixed',
          top: 0,
          left: isProAnalyzerExpanded ? 0 : '-350px',
          width: '350px',
          height: '100vh',
          backgroundColor: 'white',
          boxShadow: isProAnalyzerExpanded ? '4px 0 20px rgba(0, 0, 0, 0.15)' : 'none',
          zIndex: 1000,
          borderRight: '1px solid #e0e0e0',
          overflow: 'hidden',
        }}
      >
        {/* Sidebar Content */}
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Sidebar Header */}
          <div
            style={{
              padding: '20px',
              borderBottom: '2px solid #f0f0f0',
              backgroundColor: '#f8f9fa',
            }}
          >
            <h3
              style={{
                color: '#2c5aa0',
                fontWeight: '700',
                fontSize: '18px',
                margin: '0 0 8px 0',
              }}
            >
              🔧 ProAnalyzer Tools
            </h3>
            <div
              style={{
                color: '#666',
                fontSize: '12px',
                lineHeight: '1.4',
              }}
            >
              <strong>Pathway:</strong> {selectedProject?.name} → {selectedDevice?.name} → v
              {selectedVersion?.version_number}
            </div>
          </div>

          {/* Tools List */}
          <div
            className="proanalyzer-sidebar"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
            }}
          >
            {proAnalyzerTools.map((tool, index) => (
              <div
                key={index}
                className="proanalyzer-tool-card"
                onClick={() => handleToolClick(tool.name)}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '20px',
                      flexShrink: 0,
                    }}
                  >
                    {tool.icon}
                  </div>
                  <div>
                    <h4
                      style={{
                        color: '#2c5aa0',
                        fontWeight: '600',
                        fontSize: '14px',
                        margin: '0 0 4px 0',
                      }}
                    >
                      {tool.name}
                    </h4>
                    <p
                      style={{
                        color: '#666',
                        fontSize: '12px',
                        margin: 0,
                        lineHeight: '1.3',
                      }}
                    >
                      {tool.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div
            style={{
              padding: '16px',
              borderTop: '1px solid #f0f0f0',
              backgroundColor: '#f8f9fa',
              textAlign: 'center',
              color: '#666',
              fontSize: '12px',
            }}
          >
            Press <kbd>Ctrl+P</kbd> or click arrow to toggle
          </div>
        </div>
      </div>

      {/* Expandable Arrow */}
      <div
        className={`proanalyzer-arrow-button ${isProAnalyzerExpanded ? 'expanded' : 'collapsed'}`}
        onClick={() => setIsProAnalyzerExpanded(!isProAnalyzerExpanded)}
        title={`${isProAnalyzerExpanded ? 'Close' : 'Open'} ProAnalyzer Tools (Ctrl+P)`}
        style={{
          left: isProAnalyzerExpanded ? '350px' : '0px',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            transform: isProAnalyzerExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
          }}
        >
          <div style={{ fontSize: '12px' }}>🔧</div>
          <div>▶</div>
        </div>
      </div>

      {/* Backdrop overlay when sidebar is open */}
      {isProAnalyzerExpanded && (
        <div
          onClick={() => setIsProAnalyzerExpanded(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)', // Safari support
            zIndex: 999,
            transition: 'all 0.3s ease',
          }}
        />
      )}

      {/* Main Content */}
      <div
        className={
          isProAnalyzerExpanded ? 'completion-content-blurred' : 'completion-content-normal'
        }
        style={{
          flex: 1,
          marginTop: 0,
          transition: 'margin-left 0.3s ease-in-out',
          marginLeft: isProAnalyzerExpanded ? '0px' : '0px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
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
        <div
          style={{
            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
            borderRadius: '12px',
            padding: '24px',
            color: 'white',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
          }}
        >
          <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>🎉</div>
          <h2
            style={{
              textAlign: 'center',
              margin: '0 0 16px 0',
              fontSize: '24px',
              fontWeight: '700',
            }}
          >
            Pathway Configuration Complete!
          </h2>
          <p
            style={{
              textAlign: 'center',
              margin: 0,
              fontSize: '16px',
              opacity: 0.9,
            }}
          >
            You can now proceed with license application and documentation for your medical device.
          </p>
        </div>

        {/* Pathway Summary */}
        <div
          style={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            backgroundColor: '#fff',
            overflow: 'hidden',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#f8f9fa',
              borderBottom: '1px solid #e0e0e0',
              fontWeight: '600',
              color: '#2c5aa0',
            }}
          >
            Regulatory Pathway Summary
          </div>

          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Project */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    width: '120px',
                    fontWeight: '600',
                    color: '#666',
                    fontSize: '14px',
                  }}
                >
                  Project:
                </div>
                <div
                  style={{
                    flex: 1,
                    fontSize: '16px',
                    color: '#2c5aa0',
                    fontWeight: '600',
                  }}
                >
                  {selectedProject.name}
                </div>
              </div>

              {/* Device */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    width: '120px',
                    fontWeight: '600',
                    color: '#666',
                    fontSize: '14px',
                  }}
                >
                  Device:
                </div>
                <div
                  style={{
                    flex: 1,
                    fontSize: '16px',
                    color: '#2c5aa0',
                    fontWeight: '600',
                  }}
                >
                  {selectedDevice.name}
                </div>
              </div>

              {/* Version */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    width: '120px',
                    fontWeight: '600',
                    color: '#666',
                    fontSize: '14px',
                  }}
                >
                  Version:
                </div>
                <div
                  style={{
                    flex: 1,
                    fontSize: '16px',
                    color: '#2c5aa0',
                    fontWeight: '600',
                  }}
                >
                  {selectedVersion.version_number}
                  <span
                    style={{
                      marginLeft: '8px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: selectedVersion.type === 'renewal' ? '#e67e22' : '#27ae60',
                      color: 'white',
                    }}
                  >
                    {selectedVersion.type === 'renewal' ? 'Renewal' : 'Version'}
                  </span>
                </div>
              </div>

              {/* Market */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    width: '120px',
                    fontWeight: '600',
                    color: '#666',
                    fontSize: '14px',
                  }}
                >
                  Market:
                </div>
                <div
                  style={{
                    flex: 1,
                    fontSize: '16px',
                    color: '#2c5aa0',
                    fontWeight: '600',
                  }}
                >
                  {selectedMarket.name}
                </div>
              </div>

              {/* Country */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    width: '120px',
                    fontWeight: '600',
                    color: '#666',
                    fontSize: '14px',
                  }}
                >
                  Country:
                </div>
                <div
                  style={{
                    flex: 1,
                    fontSize: '16px',
                    color: '#2c5aa0',
                    fontWeight: '600',
                  }}
                >
                  {countryName}
                </div>
              </div>

              {/* License */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    width: '120px',
                    fontWeight: '600',
                    color: '#666',
                    fontSize: '14px',
                  }}
                >
                  License:
                </div>
                <div
                  style={{
                    flex: 1,
                    fontSize: '16px',
                    color: '#2c5aa0',
                    fontWeight: '600',
                  }}
                >
                  {licenseName}
                  <span
                    style={{
                      marginLeft: '8px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: '#17a2b8',
                      color: 'white',
                    }}
                  >
                    License
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div
          style={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            backgroundColor: '#fff',
            overflow: 'hidden',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#f8f9fa',
              borderBottom: '1px solid #e0e0e0',
              fontWeight: '600',
              color: '#2c5aa0',
            }}
          >
            Recommended Next Steps
          </div>

          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
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
                    marginTop: '2px',
                  }}
                >
                  1
                </div>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    Prepare Documentation
                  </div>
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    Gather all required documents for {licenseName} license application in{' '}
                    {countryName}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
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
                    marginTop: '2px',
                  }}
                >
                  2
                </div>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>Submit Application</div>
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    Submit your {licenseName} license application to the relevant regulatory
                    authority
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
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
                    marginTop: '2px',
                  }}
                >
                  3
                </div>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>Track Progress</div>
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    Monitor application status and respond to any regulatory queries
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            marginTop: '32px',
          }}
        >
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

        {/* Interactive Checklist */}
        <InteractiveChecklist
          selectedMarket={selectedMarket}
          selectedLicense={selectedLicense}
          onProgressUpdate={progress => {
            console.log('Checklist progress updated:', progress);
          }}
        />
      </div>
    </div>
  );
};

export default CompletionSummary;
