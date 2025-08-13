import React, { useEffect } from 'react';

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const style = {
    position: 'fixed',
    top: 32,
    left: '50%',
    transform: 'translateX(-50%)',
    background: type === 'error' ? '#d63031' : '#2c5aa0',
    color: '#fff',
    padding: '14px 32px',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 16,
    zIndex: 3000,
    boxShadow: '0 4px 24px rgba(44,90,160,0.18)',
    minWidth: 200,
    textAlign: 'center',
  };

  return (
    <div style={style} onClick={onClose} role="alert" aria-live="assertive">
      {message}
    </div>
  );
}

export default Toast; 