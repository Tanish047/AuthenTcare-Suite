import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

const VirtualList = ({
    items = [],
    itemHeight = 50,
    containerHeight = 400,
    renderItem,
    overscan = 5,
}) => {
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef();

    // Calculate visible range
    const visibleRange = useMemo(() => {
        const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
        const visibleCount = Math.ceil(containerHeight / itemHeight);
        const end = Math.min(items.length, start + visibleCount + overscan * 2);
        return { start, end };
    }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

    // Get visible items
    const visibleItems = useMemo(() => {
        return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
            item,
            index: visibleRange.start + index,
        }));
    }, [items, visibleRange]);

    // Handle scroll
    const handleScroll = useCallback((e) => {
        setScrollTop(e.target.scrollTop);
    }, []);

    // Total height and offset
    const totalHeight = items.length * itemHeight;
    const offsetY = visibleRange.start * itemHeight;

    return (
        <div
            ref={containerRef}
            style={{
                height: containerHeight,
                overflow: 'auto',
                position: 'relative',
            }}
            onScroll={handleScroll}
        >
            <div style={{ height: totalHeight, position: 'relative' }}>
                <div
                    style={{
                        transform: `translateY(${offsetY}px)`,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                    }}
                >
                    {visibleItems.map(({ item, index }) => (
                        <div
                            key={index}
                            style={{
                                height: itemHeight,
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            {renderItem(item, index)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VirtualList;