import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FixedSizeList as List, VariableSizeList } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { performanceMonitor } from '../utils/performanceMonitor.js';

/**
 * High-performance virtual scrolling component
 * Handles large datasets efficiently with minimal DOM nodes
 */

const VirtualScrollList = ({
  items = [],
  itemHeight = 60,
  height = 400,
  width = '100%',
  renderItem,
  loadMoreItems,
  hasNextPage = false,
  isNextPageLoading = false,
  threshold = 15,
  overscanCount = 5,
  className = '',
  onScroll,
  variableHeight = false,
  getItemSize,
  estimatedItemSize = 60,
  ...props
}) => {
  const listRef = useRef();
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  
  // Performance tracking
  const performanceTimer = useRef();
  
  useEffect(() => {
    performanceTimer.current = performanceMonitor.startTimer('virtual_list_render');
    
    return () => {
      if (performanceTimer.current) {
        performanceTimer.current.end({
          itemCount: items.length,
          height,
          variableHeight,
        });
      }
    };
  }, [items.length, height, variableHeight]);

  // Memoize item count for infinite loading
  const itemCount = useMemo(() => {
    return hasNextPage ? items.length + 1 : items.length;
  }, [items.length, hasNextPage]);

  // Check if item is loaded
  const isItemLoaded = useMemo(() => {
    return (index) => !!items[index];
  }, [items]);

  // Handle scroll events
  const handleScroll = ({ scrollDirection, scrollOffset, scrollUpdateWasRequested }) => {
    setScrollOffset(scrollOffset);
    
    if (onScroll) {
      onScroll({ scrollDirection, scrollOffset, scrollUpdateWasRequested });
    }
  };

  const handleScrollStart = () => {
    setIsScrolling(true);
  };

  const handleScrollStop = () => {
    setIsScrolling(false);
  };

  // Item renderer with error boundary
  const ItemRenderer = ({ index, style, data }) => {
    const item = items[index];
    
    // Loading placeholder for infinite scroll
    if (!item) {
      return (
        <div style={style} className="virtual-list-loading-item">
          <div className="loading-skeleton">
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
          </div>
        </div>
      );
    }

    try {
      return (
        <div style={style} className="virtual-list-item">
          {renderItem({ item, index, style, isScrolling })}
        </div>
      );
    } catch (error) {
      console.error('Error rendering virtual list item:', error);
      performanceMonitor.recordMetric('virtual_list_item_error', 1, {
        index,
        error: error.message,
      });
      
      return (
        <div style={style} className="virtual-list-error-item">
          <div className="error-content">
            <span>Error loading item {index}</span>
          </div>
        </div>
      );
    }
  };

  // Variable height item renderer
  const VariableItemRenderer = ({ index, style }) => {
    return <ItemRenderer index={index} style={style} />;
  };

  // Render fixed height list
  const renderFixedList = () => (
    <List
      ref={listRef}
      height={height}
      width={width}
      itemCount={itemCount}
      itemSize={itemHeight}
      itemData={items}
      overscanCount={overscanCount}
      onScroll={handleScroll}
      onItemsRendered={({ visibleStartIndex, visibleStopIndex }) => {
        performanceMonitor.recordMetric('virtual_list_visible_range', visibleStopIndex - visibleStartIndex, {
          startIndex: visibleStartIndex,
          stopIndex: visibleStopIndex,
          totalItems: itemCount,
        });
      }}
      className={`virtual-scroll-list ${className}`}
      {...props}
    >
      {ItemRenderer}
    </List>
  );

  // Render variable height list
  const renderVariableList = () => (
    <VariableSizeList
      ref={listRef}
      height={height}
      width={width}
      itemCount={itemCount}
      itemSize={getItemSize || (() => estimatedItemSize)}
      estimatedItemSize={estimatedItemSize}
      overscanCount={overscanCount}
      onScroll={handleScroll}
      className={`virtual-scroll-list variable-height ${className}`}
      {...props}
    >
      {VariableItemRenderer}
    </VariableSizeList>
  );

  // Render with infinite loading
  const renderWithInfiniteLoading = () => {
    const ListComponent = variableHeight ? VariableSizeList : List;
    const listProps = variableHeight
      ? {
          itemSize: getItemSize || (() => estimatedItemSize),
          estimatedItemSize,
        }
      : {
          itemSize: itemHeight,
        };

    return (
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={itemCount}
        loadMoreItems={loadMoreItems}
        threshold={threshold}
      >
        {({ onItemsRendered, ref }) => (
          <ListComponent
            ref={(list) => {
              ref(list);
              listRef.current = list;
            }}
            height={height}
            width={width}
            itemCount={itemCount}
            overscanCount={overscanCount}
            onItemsRendered={onItemsRendered}
            onScroll={handleScroll}
            className={`virtual-scroll-list infinite-loading ${className}`}
            {...listProps}
            {...props}
          >
            {variableHeight ? VariableItemRenderer : ItemRenderer}
          </ListComponent>
        )}
      </InfiniteLoader>
    );
  };

  // Public API methods
  const scrollToItem = (index, align = 'auto') => {
    if (listRef.current) {
      listRef.current.scrollToItem(index, align);
    }
  };

  const scrollToTop = () => {
    if (listRef.current) {
      listRef.current.scrollTo(0);
    }
  };

  const scrollToBottom = () => {
    if (listRef.current) {
      listRef.current.scrollToItem(itemCount - 1, 'end');
    }
  };

  // Expose methods via ref
  React.useImperativeHandle(props.ref, () => ({
    scrollToItem,
    scrollToTop,
    scrollToBottom,
    getScrollOffset: () => scrollOffset,
    resetAfterIndex: (index) => {
      if (listRef.current && listRef.current.resetAfterIndex) {
        listRef.current.resetAfterIndex(index);
      }
    },
  }));

  // Render appropriate list type
  if (loadMoreItems) {
    return renderWithInfiniteLoading();
  } else if (variableHeight) {
    return renderVariableList();
  } else {
    return renderFixedList();
  }
};

// Higher-order component for easy integration
export const withVirtualScrolling = (Component, options = {}) => {
  return React.forwardRef((props, ref) => {
    const {
      items = [],
      renderItem,
      itemHeight = 60,
      height = 400,
      ...otherProps
    } = props;

    const defaultRenderItem = ({ item, index }) => (
      <Component item={item} index={index} {...otherProps} />
    );

    return (
      <VirtualScrollList
        ref={ref}
        items={items}
        renderItem={renderItem || defaultRenderItem}
        itemHeight={itemHeight}
        height={height}
        {...options}
        {...otherProps}
      />
    );
  });
};

// Hook for virtual scrolling state management
export const useVirtualScrolling = (items, options = {}) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  const [isScrolling, setIsScrolling] = useState(false);
  const listRef = useRef();

  const handleItemsRendered = ({ visibleStartIndex, visibleStopIndex }) => {
    setVisibleRange({ start: visibleStartIndex, end: visibleStopIndex });
  };

  const handleScroll = ({ scrollDirection, scrollOffset }) => {
    if (options.onScroll) {
      options.onScroll({ scrollDirection, scrollOffset });
    }
  };

  return {
    listRef,
    visibleRange,
    isScrolling,
    handleItemsRendered,
    handleScroll,
    scrollToItem: (index, align) => {
      if (listRef.current) {
        listRef.current.scrollToItem(index, align);
      }
    },
  };
};

// Optimized list item component
export const VirtualListItem = React.memo(({ children, className = '', ...props }) => {
  return (
    <div className={`virtual-list-item-wrapper ${className}`} {...props}>
      {children}
    </div>
  );
});

VirtualListItem.displayName = 'VirtualListItem';

export default VirtualScrollList;