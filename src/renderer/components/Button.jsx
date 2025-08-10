import React from 'react';

function Button({ children, onClick, type = 'button', disabled = false, style = {}, ...props }) {
  const defaultStyle = {
    padding: '10px 22px',
    borderRadius: 8,
    border: 'none',
    fontWeight: 600,
    fontSize: 16,
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: disabled ? '#eee' : '#2c5aa0',
    color: disabled ? '#888' : '#fff',
    transition: 'all 0.2s ease',
    margin: 0,
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...defaultStyle, ...style }}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button; 