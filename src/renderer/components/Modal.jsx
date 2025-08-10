import React from 'react';

function Modal({ open, onClose, title, children, actions }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(44,90,160,0.18)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 4px 24px rgba(44,90,160,0.18)', padding: '36px 32px', minWidth: 340, maxWidth: '90vw', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {title && <h3 style={{ color: '#2c5aa0', fontWeight: 700, fontSize: 22, marginBottom: 18 }}>{title}</h3>}
        <div style={{ width: '100%' }}>{children}</div>
        <div style={{ display: 'flex', gap: 16, width: '100%', justifyContent: 'center', marginTop: 24 }}>
          {actions}
        </div>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 24, color: '#888', cursor: 'pointer' }} aria-label="Close">×</button>
      </div>
    </div>
  );
}

export default Modal; 