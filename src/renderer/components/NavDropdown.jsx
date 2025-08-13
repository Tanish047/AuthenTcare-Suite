import React, { useRef } from 'react';
import DropdownMenu from './DropdownMenu.jsx';

function NavDropdown({
  item,
  openMenu,
  setOpenMenu,
  closeTimer,
  handleAnyMouseEnter,
  handleAnyMouseLeave,
  onItemClick,
}) {
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const navBtnRef = useRef();

  // Improved hover logic with longer delay and better coordination
  const handleEnter = () => {
    if (hasChildren) {
      if (closeTimer && closeTimer.current) clearTimeout(closeTimer.current);
      handleAnyMouseEnter && handleAnyMouseEnter(item.key);
      setOpenMenu(item.key);
    }
  };
  const handleLeave = () => {
    if (hasChildren) {
      handleAnyMouseLeave && handleAnyMouseLeave();
    }
  };

  return (
    <div
      className="nav-btn-wrapper"
      ref={navBtnRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{ display: 'inline-block', position: 'relative' }}
    >
      <button
        className="nav-btn"
        onClick={() => {
          if (hasChildren) {
            if (openMenu === item.key) {
              setOpenMenu(null);
            } else {
              setOpenMenu(item.key);
            }
          } else {
            onItemClick && onItemClick(item.key);
          }
        }}
        tabIndex={0}
        style={{ fontWeight: 700, fontSize: '0.95rem', padding: '0 10px', margin: '0 0.5px' }}
      >
        {item.label}
        {hasChildren && (
          <span
            className={`dropdown-chevron${openMenu === item.key ? ' open' : ''}`}
            aria-hidden="true"
            style={{
              display: 'inline-block',
              marginLeft: 8,
              verticalAlign: 'middle',
              transition: 'transform 0.2s cubic-bezier(.4,0,.2,1)',
              width: 16,
              height: 16,
              lineHeight: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path
                d="M6 8l4 4 4-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </button>
      {hasChildren && openMenu === item.key && (
        <DropdownMenu
          items={item.children}
          parentRect={navBtnRef.current?.getBoundingClientRect?.() || null}
          isRoot={true}
          closeTimer={closeTimer}
          handleAnyMouseEnter={handleAnyMouseEnter}
          handleAnyMouseLeave={handleAnyMouseLeave}
          onItemClick={onItemClick}
        />
      )}
    </div>
  );
}

export default NavDropdown;
