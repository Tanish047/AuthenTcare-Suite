import React from 'react';

const LicenseList = ({ selectedMarket, licenses, onCreate, onDelete }) => {
  if (!selectedMarket) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <h5 style={{ color: '#2c5aa0', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
        Licenses for {selectedMarket}
      </h5>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {licenses && licenses.length > 0 ? (
          licenses.map(license => (
            <li key={license} style={{ marginBottom: 12, display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '4px',
                  backgroundColor: 'transparent',
                }}
              >
                {license}
              </span>
              <button
                onClick={() => onDelete(license)}
                style={{
                  marginLeft: '8px',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </li>
          ))
        ) : (
          <li style={{ color: '#888' }}>No licenses added.</li>
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
          cursor: 'pointer',
        }}
      >
        Add License
      </button>
    </div>
  );
};

export default LicenseList;
