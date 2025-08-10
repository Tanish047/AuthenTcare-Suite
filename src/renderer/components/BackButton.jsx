import React from 'react';

function BackButton({ onBack, visible }) {
  if (!visible) return null;
  return (
    <button
      className="nav-btn back-btn"
      onClick={onBack}
      style={{ 
        fontWeight: 700, 
        fontSize: '1.08rem', 
        padding: '0 14px', 
        margin: '0 0.5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '40px',
        height: '40px',
        borderRadius: '8px',
        border: 'none',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = 'rgba(255, 255, 255, 0.2)';
        e.target.style.transform = 'translateX(-2px)';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'rgba(255, 255, 255, 0.1)';
        e.target.style.transform = 'translateX(0)';
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    </button>
  );
}

export default BackButton; 