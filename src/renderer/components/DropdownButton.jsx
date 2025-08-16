import React, { useState, useRef, useEffect, useCallback } from 'react';

const DropdownButton = ({
  buttonText,
  buttonIcon = '+',
  options = [],
  onOptionSelect,
  disabled = false,
  buttonStyle = {},
  dropdownStyle = {},
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Memoized event handler for clicking outside
  const handleClickOutside = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  }, []);

  // Close dropdown when clicking outside or on escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClickOutside, showDropdown]);

  const handleOptionClick = useCallback((option) => {
    setShowDropdown(false);
    onOptionSelect(option);
  }, [onOptionSelect]);

  const defaultButtonStyle = {
    padding: '8px 16px',
    borderRadius: '4px',
    backgroundColor: '#2c5aa0',
    color: 'white',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    opacity: disabled ? 0.6 : 1,
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
    minWidth: '160px',
    marginTop: '4px',
    ...dropdownStyle,
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => !disabled && setShowDropdown(!showDropdown)}
        style={defaultButtonStyle}
        disabled={disabled}
      >
        {buttonIcon && <span>{buttonIcon}</span>}
        {buttonText}
        <span style={{ marginLeft: '4px' }}>▼</span>
      </button>
      
      {showDropdown && !disabled && (
        <div style={defaultDropdownStyle}>
          {options.map((option, index) => (
            <button
              key={option.key || index}
              onClick={() => handleOptionClick(option)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '14px',
                borderBottom: index < options.length - 1 ? '1px solid #eee' : 'none',
              }}
              onMouseEnter={e => e.target.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownButton;