import React from 'react';

function LoadingSpinner({ size = 'normal' }) {
  const dimensions = size === 'small' ? { width: 16, height: 16, border: '2px' } : { width: 40, height: 40, border: '4px' };
  const containerStyle = size === 'small' ? {} : {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    minHeight: 80,
  };
  
  return (
    <div style={containerStyle}>
      <div style={{
        width: dimensions.width,
        height: dimensions.height,
        border: `${dimensions.border} solid #eaf6ff`,
        borderTop: `${dimensions.border} solid #2c5aa0`,
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