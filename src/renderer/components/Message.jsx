import React from 'react';

function Message({ children, type = 'info', style = {}, ...props }) {
  const defaultStyle = {
    color: type === 'error' ? '#d63031' : '#2c5aa0',
    background: type === 'error' ? '#ffeaea' : '#eaf6ff',
    borderRadius: 6,
    padding: '8px 12px',
    marginBottom: 8,
    fontSize: 15,
    textAlign: 'center',
  };
  return (
    <div style={{ ...defaultStyle, ...style }} {...props}>
      {children}
    </div>
  );
}

export default Message;
