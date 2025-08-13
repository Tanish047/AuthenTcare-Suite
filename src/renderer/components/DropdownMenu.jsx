import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

function DropdownMenu({
  items,
  parentRect,
  isRoot,
  closeTimer,
  handleAnyMouseEnter,
  handleAnyMouseLeave,
  onItemClick,
}) {
  const [openChild, setOpenChild] = useState(null);
  const menuRef = useRef();
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (parentRect && isRoot && menuRef.current) {
      setPosition({
        top: parentRect.bottom,
        left: parentRect.left,
      });
    }
  }, [parentRect, isRoot]);

  const handleDropdownMouseEnter = () => {
    if (closeTimer && closeTimer.current) {
      clearTimeout(closeTimer.current);
    }
    handleAnyMouseEnter && handleAnyMouseEnter();
  };
  const handleDropdownMouseLeave = () => handleAnyMouseLeave && handleAnyMouseLeave();

  const blurOverlay = (
    <div
      className="dropdown-blur-overlay"
      style={{
        top: isRoot && parentRect ? parentRect.bottom : undefined,
        left: isRoot && parentRect ? parentRect.left : undefined,
        width: isRoot && parentRect ? parentRect.width : undefined,
        height: isRoot && parentRect ? menuRef.current?.offsetHeight : undefined,
        position: isRoot ? 'fixed' : 'absolute',
        borderRadius: 18,
        zIndex: 9998,
        pointerEvents: 'none',
      }}
    />
  );

  const menu = (
    <div
      className="dropdown-menu"
      ref={menuRef}
      style={
        isRoot && parentRect
          ? {
              position: 'fixed',
              top: position.top,
              left: position.left,
              zIndex: 20000,
              marginTop: 0,
            }
          : { position: 'absolute', top: 0, left: '100%', zIndex: 21000 }
      }
      onMouseEnter={handleDropdownMouseEnter}
      onMouseLeave={handleDropdownMouseLeave}
    >
      {items.map(item => {
        const hasChildren = Array.isArray(item.children) && item.children.length > 0;
        return (
          <div
            key={item.key}
            className="dropdown-item"
            onMouseEnter={() => {
              handleDropdownMouseEnter();
              if (hasChildren) {
                setOpenChild(item.key);
              } else {
                setOpenChild(null);
              }
            }}
            onMouseLeave={() => {
              // Don't immediately close child menus, let the parent handle it
              if (!hasChildren) {
                handleDropdownMouseLeave();
              }
            }}
            onClick={() => onItemClick && onItemClick(item.key)}
            style={{ position: 'relative', cursor: 'pointer' }}
          >
            {item.label}
            {hasChildren && <span className="dropdown-chevron">▶</span>}
            {hasChildren && openChild === item.key && (
              <DropdownMenu
                items={item.children}
                isRoot={false}
                closeTimer={closeTimer}
                handleAnyMouseEnter={handleAnyMouseEnter}
                handleAnyMouseLeave={handleAnyMouseLeave}
                onItemClick={onItemClick}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  if (isRoot && parentRect) {
    return createPortal(
      <>
        {blurOverlay}
        {menu}
      </>,
      document.body
    );
  }

  return (
    <>
      {blurOverlay}
      <div>{menu}</div>
    </>
  );
}

export default DropdownMenu;
