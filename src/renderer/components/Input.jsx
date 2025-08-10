import React from 'react';
function Input({ value, onChange, type = 'text', placeholder = '', required = false, autoFocus = false, style = {}, ...props }) {
  const defaultStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid #bbb',
    fontSize: 16,
    marginBottom: 16,
    boxSizing: 'border-box',
  };
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      autoFocus={autoFocus}
      style={{ ...defaultStyle, ...style }}
      {...props}
    />
  );
}

export default Input; 