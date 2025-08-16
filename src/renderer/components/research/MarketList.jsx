import React, { useState, useEffect } from 'react';
import ActionMenu from '../ActionMenu.jsx';

const MarketList = ({ targetMarkets, selectedMarket, onSelect, onCreate, onEdit, onDelete, dispatch }) => {
  const [showAddMarketDropdown, setShowAddMarketDropdown] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState('');
  const [allExistingMarkets, setAllExistingMarkets] = useState([]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAddMarketDropdown && !event.target.closest('.add-market-dropdown-container')) {
        setShowAddMarketDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddMarketDropdown]);

  // List of countries in alphabetical order as specified
  const countries = [
    'Australia',
    'Bangladesh',
    'Brunei',
    'Cambodia',
    'Canada',
    'China',
    'Europe',
    'Hong Kong',
    'India',
    'Indonesia',
    'Japan',
    'Korea',
    'Lao',
    'Malaysia',
    'Myanmar',
    'New Zealand',
    'Philippines',
    'Singapore',
    'Sri Lanka',
    'Taiwan',
    'Thailand',
    'UAE',
    'USA',
    'Vietnam'
  ];

  // Load all existing markets when component mounts
  useEffect(() => {
    const loadAllMarkets = async () => {
      try {
        const result = await window.dbAPI.getMarkets();

        setAllExistingMarkets(result.data || []);
      } catch (error) {
        console.error('Failed to load existing markets:', error);
      }
    };
    
    loadAllMarkets();
  }, []);



  // Filter out countries that already exist in the database
  const availableCountries = countries.filter(country => 
    !allExistingMarkets.some(market => 
      market.name.trim().toLowerCase() === country.trim().toLowerCase()
    )
  );

  const handleAddMarket = async (country) => {
    setShowAddMarketDropdown(false);
    
    try {
      // First, check if the market already exists in the database
      const existingMarkets = await window.dbAPI.getMarkets();
      
      const marketExists = existingMarkets.data.some(market => 
        market.name.trim().toLowerCase() === country.trim().toLowerCase()
      );
      
      if (marketExists) {
        setShowErrorMessage(`${country} already exists in the database.`);
        setTimeout(() => setShowErrorMessage(''), 5000);
        return;
      }
      
      // Check if country is already in the current target markets list
      if (targetMarkets && targetMarkets.some(market => 
        market.name && market.name.trim().toLowerCase() === country.trim().toLowerCase()
      )) {
        setShowErrorMessage(`${country} is already in the target markets list.`);
        setTimeout(() => setShowErrorMessage(''), 5000);
        return;
      }
      
      // Create market in database
      const newMarket = await window.dbAPI.createMarket({
        name: country.trim(),
        region: '',
        regulatory_body: '',
        requirements: ''
      });
      
      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
      // Reload markets from database to get the updated list
      try {
        const result = await window.dbAPI.getMarkets();
        if (dispatch) {
          dispatch({ type: 'SET_TARGET_MARKETS', targetMarkets: result.data });
        }
        // Update the local state for available countries
        setAllExistingMarkets(result.data || []);
      } catch (reloadError) {
        console.error('Failed to reload markets:', reloadError);
      }
      
    } catch (error) {
      console.error('Failed to create market:', error);
      
      // Provide more user-friendly error messages
      let errorMessage = error.message;
      if (error.message.includes('UNIQUE constraint failed')) {
        errorMessage = `${country} already exists in the database.`;
      } else if (error.message.includes('SQLITE_CONSTRAINT')) {
        errorMessage = `${country} violates database constraints. It may already exist.`;
      }
      
      setShowErrorMessage(`Failed to add ${country}: ${errorMessage}`);
      setTimeout(() => setShowErrorMessage(''), 5000);
    }
  };



  return (
    <div style={{ marginTop: 0 }}>
      {/* Add Target Market Section */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 16 
      }}>
        <div style={{ color: '#666', fontSize: '14px' }}>
          Available Target Markets
        </div>
        <div className="add-market-dropdown-container" style={{ position: 'relative' }}>
          <button
            onClick={() => setShowAddMarketDropdown(!showAddMarketDropdown)}
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
            title="View all countries and add new target markets"
          >
            <span>+</span>
            Add a Target Market
            {availableCountries.length < countries.length && (
              <span style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '10px',
                padding: '2px 6px',
                fontSize: '11px',
                marginLeft: '4px'
              }}>
                {allExistingMarkets.length}/{countries.length}
              </span>
            )}
          </button>

          {showAddMarketDropdown && (
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
                minWidth: '220px',
                maxHeight: '320px',
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
                Select Country ({availableCountries.length} available, {allExistingMarkets.length} added)
              </div>
              
              {/* Available Countries */}
              {availableCountries.length > 0 && (
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
                    Available ({availableCountries.length})
                  </div>
                  {availableCountries.map((country, index) => (
                    <button
                      key={`available-${country}`}
                      onClick={() => handleAddMarket(country)}
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
                      title={`Add ${country} as a target market`}
                    >
                      <span>{country}</span>
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
              
              {/* Already Added Countries */}
              {allExistingMarkets.length > 0 && (
                <>
                  <div style={{
                    padding: '6px 16px',
                    backgroundColor: '#f0f0f0',
                    fontSize: '11px',
                    color: '#666',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderTop: availableCountries.length > 0 ? '2px solid #ddd' : 'none'
                  }}>
                    Already Added ({allExistingMarkets.length})
                  </div>
                  {countries
                    .filter(country => 
                      allExistingMarkets.some(market => 
                        market.name.trim().toLowerCase() === country.trim().toLowerCase()
                      )
                    )
                    .map((country, index) => (
                      <button
                        key={`added-${country}`}
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
                        title={`${country} has already been added`}
                      >
                        <span>{country}</span>
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
              
              {/* No countries available message */}
              {availableCountries.length === 0 && allExistingMarkets.length === countries.length && (
                <div style={{
                  padding: '16px',
                  fontSize: '14px',
                  color: '#666',
                  textAlign: 'center',
                  fontStyle: 'italic'
                }}>
                  🎉 All countries have been added!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          color: '#155724',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          ✓ Market added successfully!
        </div>
      )}

      {/* Error Message */}
      {showErrorMessage && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          color: '#721c24',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          ⚠️ {showErrorMessage}
        </div>
      )}

      <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24 }}>
        {targetMarkets && targetMarkets.length > 0 ? (
          targetMarkets.map(market => (
            <li key={market.id || market} style={{ marginBottom: 12 }}>
              <div
                onClick={() => onSelect({ ...market, selectedCountry: market.name })}
                style={{
                  padding: '16px',
                  border: '1px solid ' + (selectedMarket?.id === market.id ? '#2c5aa0' : '#e0e0e0'),
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: selectedMarket?.id === market.id ? '#f0f7ff' : '#fff',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={e => {
                  if (selectedMarket?.id !== market.id) {
                    e.target.style.backgroundColor = '#f8f9fa';
                  }
                }}
                onMouseLeave={e => {
                  if (selectedMarket?.id !== market.id) {
                    e.target.style.backgroundColor = '#fff';
                  }
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: '600', 
                    fontSize: '16px', 
                    color: '#2c5aa0',
                    marginBottom: '4px'
                  }}>
                    {market.name}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#666'
                  }}>
                    Click to proceed to license selection
                  </div>
                </div>
                
                <div onClick={(e) => e.stopPropagation()}>
                  <ActionMenu
                    actions={[
                      {
                        key: 'edit',
                        label: 'Edit',
                        icon: '✏️',
                        onClick: () => onEdit(market)
                      },
                      {
                        key: 'delete',
                        label: 'Delete',
                        icon: '🗑️',
                        danger: true,
                        onClick: () => onDelete(market)
                      }
                    ]}
                  />
                </div>
              </div>
            </li>
          ))
        ) : (
          <li style={{ color: '#888' }}>No markets available.</li>
        )}
      </ul>


    </div>
  );
};

export default MarketList;
