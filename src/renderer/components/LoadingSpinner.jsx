import React from 'react';

function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
      minHeight: 80,
    }}>
      <div style={{
        width: 40,
        height: 40,
        border: '4px solid #eaf6ff',
        borderTop: '4px solid #2c5aa0',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} aria-label="Loading" />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default LoadingSpinner; 