import React from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import BackButton from './BackButton.jsx';
import NavDropdown from './NavDropdown.jsx';

function NavBar({ handleBackClick, handleNavClick, handleDropdownItemClick, menuData, closeTimer, handleAnyMouseEnter, handleAnyMouseLeave }) {
  const { state, dispatch } = useAppContext();
  const { openMenu, darkMode, page, pageParent } = state;
  const showBackButton = page !== 'dashboard';

  return (
    <nav className="navbar">
      <BackButton onBack={handleBackClick} visible={showBackButton} />
      {menuData.map((item) => {
        const hasChildren = Array.isArray(item.children) && item.children.length > 0;
        if (hasChildren) {
          return (
            <NavDropdown
              key={item.key}
              item={item}
              openMenu={openMenu}
              setOpenMenu={(openMenu) => dispatch({ type: 'SET_OPEN_MENU', openMenu })}
              onItemClick={handleDropdownItemClick}
              closeTimer={closeTimer}
              handleAnyMouseEnter={handleAnyMouseEnter}
              handleAnyMouseLeave={handleAnyMouseLeave}
            />
          );
        }
        return (
          <button
            key={item.key}
            className="nav-btn"
            onClick={() => handleNavClick(item.key)}
            style={{ fontWeight: 700, fontSize: '1.08rem', padding: '0 14px', margin: '0 0.5px' }}
          >
            {item.label}
          </button>
        );
      })}
      <div className="navbar-slider-right">
        <label className="slider-container">
          <input
            type="checkbox"
            className="slider-input"
            checked={darkMode}
            onChange={() => dispatch({ type: 'TOGGLE_THEME' })}
            aria-label="Toggle dark mode"
          />
          <div className="slider-track">
            <div className="slider-thumb"></div>
          </div>
        </label>
      </div>
    </nav>
  );
}

export default NavBar; 