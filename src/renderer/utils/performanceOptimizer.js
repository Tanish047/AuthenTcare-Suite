// Performance optimization utilities
import React from 'react';

// Debounce function for expensive operations
export function debounce(func, wait, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

// Throttle function for frequent events
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memoization utility for expensive computations
export function memoize(fn, getKey = (...args) => JSON.stringify(args)) {
  const cache = new Map();
  
  return function memoized(...args) {
    const key = getKey(...args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    
    // Prevent memory leaks by limiting cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  };
}

// Batch DOM updates
export function batchDOMUpdates(updates) {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      updates.forEach(update => update());
      resolve();
    });
  });
}

// Lazy loading utility
export function createLazyLoader(loadFn, threshold = 100) {
  let isLoading = false;
  let hasLoaded = false;
  
  return {
    load: async () => {
      if (isLoading || hasLoaded) return;
      
      isLoading = true;
      try {
        await loadFn();
        hasLoaded = true;
      } finally {
        isLoading = false;
      }
    },
    isLoading: () => isLoading,
    hasLoaded: () => hasLoaded,
  };
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(callback, options = {}) {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };
  
  if (!window.IntersectionObserver) {
    // Fallback for browsers without IntersectionObserver
    return {
      observe: (element) => callback([{ isIntersecting: true, target: element }]),
      unobserve: () => {},
      disconnect: () => {},
    };
  }
  
  return new IntersectionObserver(callback, defaultOptions);
}

// Memory-efficient array operations
export const arrayUtils = {
  // Chunk array into smaller pieces to prevent blocking
  chunk: (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },
  
  // Process array in batches with delays
  processBatches: async (array, processor, batchSize = 100, delay = 10) => {
    const chunks = arrayUtils.chunk(array, batchSize);
    const results = [];
    
    for (const chunk of chunks) {
      const chunkResults = await Promise.all(chunk.map(processor));
      results.push(...chunkResults);
      
      // Allow other tasks to run
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return results;
  },
  
  // Find items efficiently with early termination
  findOptimized: (array, predicate, maxItems = Infinity) => {
    const results = [];
    for (let i = 0; i < array.length && results.length < maxItems; i++) {
      if (predicate(array[i], i, array)) {
        results.push(array[i]);
      }
    }
    return results;
  },
};

// Component performance tracker
export class ComponentPerformanceTracker {
  constructor() {
    this.measurements = new Map();
  }
  
  startMeasurement(componentName) {
    this.measurements.set(componentName, {
      startTime: performance.now(),
      renders: (this.measurements.get(componentName)?.renders || 0) + 1,
    });
  }
  
  endMeasurement(componentName) {
    const measurement = this.measurements.get(componentName);
    if (measurement) {
      const duration = performance.now() - measurement.startTime;
      this.measurements.set(componentName, {
        ...measurement,
        lastRenderTime: duration,
        totalTime: (measurement.totalTime || 0) + duration,
        averageTime: ((measurement.totalTime || 0) + duration) / measurement.renders,
      });
    }
  }
  
  getStats(componentName) {
    return this.measurements.get(componentName);
  }
  
  getAllStats() {
    return Object.fromEntries(this.measurements);
  }
  
  reset() {
    this.measurements.clear();
  }
}

// Global performance tracker
export const performanceTracker = new ComponentPerformanceTracker();

// React hook for performance tracking
export function usePerformanceTracking(componentName, enabled = false) {
  React.useEffect(() => {
    if (!enabled) return;
    
    performanceTracker.startMeasurement(componentName);
    
    return () => {
      performanceTracker.endMeasurement(componentName);
    };
  });
  
  return performanceTracker.getStats(componentName);
}