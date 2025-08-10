import React from 'react';

const MarketList = ({
  targetMarkets,
  selectedMarket,
  onSelect,
  onCreate,
  onEdit,
  onDelete
}) => {
  return (
    <div style={{ marginTop: 32 }}>
      <h4 style={{ color: '#2c5aa0', fontWeight: 700, fontSize: 18, marginBottom: 12 }}>
        Target Markets
      </h4>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {targetMarkets && targetMarkets.length > 0 ? (
          targetMarkets.map(market => (
            <li key={market} style={{ marginBottom: 12, display: 'flex', alignItems: 'center' }}>
              <span 
                style={{ 
                  flex: 1, 
                  cursor: 'pointer',
                  textDecoration: selectedMarket === market ? 'underline' : 'none',
                  padding: '8px',
                  borderRadius: '4px',
                  backgroundColor: selectedMarket === market ? '#f0f7ff' : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => onSelect(market)}
              >
                {market}
              </span>
              <button 
                onClick={() => onEdit(market)}
                style={{
                  marginLeft: '8px',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                Edit
              </button>
              <button 
                onClick={() => onDelete(market)}
                style={{
                  marginLeft: '8px',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </li>
          ))
        ) : (
          <li style={{ color: '#888' }}>No markets available.</li>
        )}
      </ul>
      <button
        onClick={onCreate}
        style={{
          marginTop: '16px',
          padding: '8px 16px',
          borderRadius: '4px',
          backgroundColor: '#2c5aa0',
          color: 'white',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Create New Market
      </button>
    </div>
  );
};

export default MarketList;
