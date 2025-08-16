import React, { useState, useEffect } from 'react';
import ActionMenu from '../ActionMenu.jsx';

const LicenseList = ({ selectedProject, selectedDevice, selectedVersion, selectedMarket, licenses, onCreate, onDelete, onSelect, dispatch }) => {
  const [showLicenseDropdown, setShowLicenseDropdown] = useState(false);

  if (!selectedMarket) return null;

  // Country-specific license options
  const licenseOptions = {
    'India': [
      'CDSCO',
      'BIS', 
      'Free Sale Certificate',
      'Test License',
      'AERB',
      'GMP',
      'ISO-13485',
      'IAA',
      'ISO-1135',
      'ISO-1137'
    ],
    'USA': [
      'FDA'
    ],
    'China': [
      'CFDA'
    ],
    'Europe': [
      'CE'
    ]
  };

  // Get the selected country from the market object
  const selectedCountry = selectedMarket?.selectedCountry || selectedMarket?.name;
  const availableLicenses = licenseOptions[selectedCountry] || [];

  // Check which licenses are already added
  const isLicenseAdded = (license) => {
    return licenses && licenses.some(existingLicense => 
      existingLicense === license || 
      existingLicense?.name === license ||
      existingLicense?.license_number === license
    );
  };

  // Filter out licenses that are already added (for button state)
  const availableToAdd = availableLicenses.filter(license => !isLicenseAdded(license));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLicenseDropdown && !event.target.closest('.license-dropdown-container')) {
        setShowLicenseDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLicenseDropdown]);

  const handleAddLicense = async (license) => {
    setShowLicenseDropdown(false);
    
    if (!selectedProject || !selectedVersion || !selectedMarket) {
      console.error('Missing required data for license creation:', {
        selectedProject,
        selectedVersion, 
        selectedMarket
      });
      alert('Missing required information. Please ensure a project, version, and market are selected.');
      return;
    }
    
    try {
      console.log(`Attempting to add license: ${license}`);
      
      // Create license in database
      const newLicense = await window.dbAPI.createLicense({
        project_id: selectedProject.id,
        market_id: selectedMarket.id,
        version_id: selectedVersion.id,
        license_number: license,
        status: 'pending',
        notes: `${license} license for ${selectedCountry}`
      });
      
      console.log('License created successfully:', newLicense);
      
      // Reload licenses from database to get the updated list
      try {
        const result = await window.dbAPI.getLicenses();
        if (dispatch) {
          dispatch({ type: 'SET_MARKET_LICENSES', marketLicenses: result.data });
        }
        console.log('Licenses reloaded successfully');
      } catch (reloadError) {
        console.error('Failed to reload licenses:', reloadError);
      }
      
    } catch (error) {
      console.error('Failed to create license:', error);
      
      // Provide user-friendly error messages
      let errorMessage = error.message;
      if (error.message.includes('UNIQUE constraint failed')) {
        errorMessage = `${license} already exists.`;
      } else if (error.message.includes('SQLITE_CONSTRAINT')) {
        errorMessage = `${license} violates database constraints.`;
      }
      
      alert(`Failed to add ${license}: ${errorMessage}`);
    }
  };

  return (
    <div style={{ marginTop: 0 }}>
      {/* Header with Add License Button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 16 
      }}>
        <div style={{ color: '#666', fontSize: '14px' }}>
          Licenses for {selectedMarket?.name || 'Selected Market'} - {selectedCountry}
        </div>
        
        <div className="license-dropdown-container" style={{ position: 'relative' }}>
          <button
            onClick={() => setShowLicenseDropdown(!showLicenseDropdown)}
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
            title="View all licenses and add new ones"
          >
            <span>+</span>
            Add License
            {availableLicenses.length > 0 && (
              <span style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '10px',
                padding: '2px 6px',
                fontSize: '11px',
                marginLeft: '4px'
              }}>
                {licenses?.length || 0}/{availableLicenses.length}
              </span>
            )}
          </button>

          {showLicenseDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: 1000,
                minWidth: '200px',
                maxHeight: '300px',
                overflowY: 'auto',
                marginTop: '4px',
              }}
            >
              {/* Header */}
              <div style={{
                padding: '8px 16px',
                backgroundColor: '#f8f9fa',
                borderBottom: '1px solid #eee',
                fontSize: '12px',
                color: '#666',
                fontWeight: '600',
                position: 'sticky',
                top: 0,
                zIndex: 1
              }}>
                Select License ({availableToAdd.length} available, {licenses?.length || 0} added)
              </div>
              
              {/* Available Licenses */}
              {availableToAdd.length > 0 && (
                <>
                  <div style={{
                    padding: '6px 16px',
                    backgroundColor: '#e8f5e8',
                    fontSize: '11px',
                    color: '#2d5a2d',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Available ({availableToAdd.length})
                  </div>
                  {availableToAdd.map((license, index) => (
                    <button
                      key={`available-${license}`}
                      onClick={() => handleAddLicense(license)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '14px',
                        borderBottom: '1px solid #eee',
                        transition: 'background-color 0.2s ease',
                        color: '#333',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                      onMouseEnter={e => {
                        e.target.style.backgroundColor = '#f0f8f0';
                      }}
                      onMouseLeave={e => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                      title={`Add ${license} license`}
                    >
                      <span>{license}</span>
                      <span style={{ 
                        fontSize: '12px', 
                        color: '#28a745',
                        fontWeight: '600'
                      }}>
                        + Add
                      </span>
                    </button>
                  ))}
                </>
              )}
              
              {/* Already Added Licenses */}
              {licenses && licenses.length > 0 && (
                <>
                  <div style={{
                    padding: '6px 16px',
                    backgroundColor: '#f0f0f0',
                    fontSize: '11px',
                    color: '#666',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderTop: availableToAdd.length > 0 ? '2px solid #ddd' : 'none'
                  }}>
                    Already Added ({licenses.length})
                  </div>
                  {availableLicenses
                    .filter(license => isLicenseAdded(license))
                    .map((license, index) => (
                      <button
                        key={`added-${license}`}
                        disabled={true}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: 'none',
                          backgroundColor: '#f8f9fa',
                          cursor: 'not-allowed',
                          textAlign: 'left',
                          fontSize: '14px',
                          borderBottom: '1px solid #eee',
                          color: '#999',
                          opacity: 0.7,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                        title={`${license} has already been added`}
                      >
                        <span>{license}</span>
                        <span style={{ 
                          fontSize: '12px', 
                          color: '#28a745',
                          fontWeight: '600'
                        }}>
                          ✓ Added
                        </span>
                      </button>
                    ))
                  }
                </>
              )}
              
              {/* No licenses available message */}
              {availableLicenses.length === 0 && (
                <div style={{
                  padding: '16px',
                  fontSize: '14px',
                  color: '#666',
                  textAlign: 'center',
                  fontStyle: 'italic'
                }}>
                  No licenses configured for {selectedCountry}
                </div>
              )}
              
              {/* All licenses added message */}
              {availableToAdd.length === 0 && availableLicenses.length > 0 && (
                <div style={{
                  padding: '16px',
                  fontSize: '14px',
                  color: '#666',
                  textAlign: 'center',
                  fontStyle: 'italic'
                }}>
                  🎉 All licenses have been added!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* License List */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {licenses && licenses.length > 0 ? (
          licenses.map((license, index) => {
            const licenseName = typeof license === 'string' ? license : license?.license_number || license?.name || 'Unknown License';
            return (
              <li key={license?.id || licenseName || index} style={{ marginBottom: 12 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => onSelect && onSelect(license)}
                  onMouseEnter={e => {
                    e.target.style.backgroundColor = '#f8f9fa';
                    e.target.style.borderColor = '#ccc';
                  }}
                  onMouseLeave={e => {
                    e.target.style.backgroundColor = '#fff';
                    e.target.style.borderColor = '#e0e0e0';
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: '600', 
                      fontSize: '16px', 
                      color: '#2c5aa0',
                      marginBottom: '4px'
                    }}>
                      {licenseName}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#666'
                    }}>
                      Click to proceed to next step • License for {selectedCountry}
                    </div>
                  </div>
                  
                  <div onClick={(e) => e.stopPropagation()}>
                    <ActionMenu
                      actions={[
                        {
                          key: 'delete',
                          label: 'Delete',
                          icon: '🗑️',
                          danger: true,
                          onClick: () => onDelete(license)
                        }
                      ]}
                    />
                  </div>
                </div>
              </li>
            );
          })
        ) : (
          <li style={{ 
            color: '#888', 
            textAlign: 'center', 
            padding: '20px',
            fontStyle: 'italic'
          }}>
            No licenses added yet. Use the "Add License" button above to get started.
          </li>
        )}
      </ul>
    </div>
  );
};

export default LicenseList;
