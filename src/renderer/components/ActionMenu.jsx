import React, { useState, useRef, useEffect, useCallback } from 'react';

const ActionMenu = ({
  actions = [],
  disabled = false,
  buttonStyle = {},
  dropdownStyle = {},
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Memoized event handler for clicking outside
  const handleClickOutside = useCallback((event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setShowMenu(false);
    }
  }, []);

  // Close menu when clicking outside or on escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClickOutside, showMenu]);

  const handleActionClick = useCallback((action) => {
    setShowMenu(false);
    if (action.onClick) {
      action.onClick();
    }
  }, []);

  const defaultButtonStyle = {
    padding: '4px 8px',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    border: '1px solid #ccc',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    opacity: disabled ? 0.6 : 1,
    minWidth: '24px',
    height: '24px',
    ...buttonStyle,
  };

  const defaultDropdownStyle = {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    zIndex: 1000,
    minWidth: '120px',
    marginTop: '4px',
    ...dropdownStyle,
  };

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) setShowMenu(!showMenu);
        }}
        style={defaultButtonStyle}
        disabled={disabled}
        title="More actions"
      >
        ⋮
      </button>
      
      {showMenu && !disabled && (
        <div style={defaultDropdownStyle}>
          {actions.map((action, index) => (
            <button
              key={action.key || index}
              onClick={(e) => {
                e.stopPropagation();
                handleActionClick(action);
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '12px',
                borderBottom: index < actions.length - 1 ? '1px solid #eee' : 'none',
                color: action.danger ? '#d63031' : 'inherit',
              }}
              onMouseEnter={e => e.target.style.backgroundColor = action.danger ? '#ffeaea' : '#f8f9fa'}
              onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
            >
              {action.icon && <span style={{ marginRight: '8px' }}>{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;