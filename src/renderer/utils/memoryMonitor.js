// Memory monitoring utilities for performance optimization
import React from 'react';

export class MemoryMonitor {
  constructor() {
    this.measurements = [];
    this.isMonitoring = false;
  }

  // Start monitoring memory usage
  startMonitoring(interval = 5000) {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.takeMeasurement();
    }, interval);
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
  }

  // Take a memory measurement
  takeMeasurement() {
    if (performance.memory) {
      const measurement = {
        timestamp: Date.now(),
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      };
      
      this.measurements.push(measurement);
      
      // Keep only last 100 measurements to prevent memory leak
      if (this.measurements.length > 100) {
        this.measurements = this.measurements.slice(-100);
      }
      
      return measurement;
    }
    return null;
  }

  // Get current memory usage
  getCurrentUsage() {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024), // MB
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024), // MB
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024), // MB
      };
    }
    return null;
  }

  // Get memory usage trend
  getTrend() {
    if (this.measurements.length < 2) return null;
    
    const recent = this.measurements.slice(-10);
    const oldest = recent[0];
    const newest = recent[recent.length - 1];
    
    return {
      change: newest.usedJSHeapSize - oldest.usedJSHeapSize,
      changePercent: ((newest.usedJSHeapSize - oldest.usedJSHeapSize) / oldest.usedJSHeapSize) * 100,
      timespan: newest.timestamp - oldest.timestamp,
    };
  }

  // Check if memory usage is concerning
  isMemoryUsageConcerning() {
    const current = this.getCurrentUsage();
    if (!current) return false;
    
    // Alert if using more than 80% of available heap
    const usagePercent = (current.used / current.limit) * 100;
    return usagePercent > 80;
  }

  // Get all measurements
  getAllMeasurements() {
    return [...this.measurements];
  }

  // Clear measurements
  clearMeasurements() {
    this.measurements = [];
  }
}

// Global memory monitor instance
export const memoryMonitor = new MemoryMonitor();

// React hook for memory monitoring
export function useMemoryMonitor(enabled = false) {
  const [memoryUsage, setMemoryUsage] = React.useState(null);
  
  React.useEffect(() => {
    if (!enabled) return;
    
    const updateMemoryUsage = () => {
      const usage = memoryMonitor.getCurrentUsage();
      setMemoryUsage(usage);
    };
    
    // Initial measurement
    updateMemoryUsage();
    
    // Start monitoring
    memoryMonitor.startMonitoring(2000);
    
    // Update component state periodically
    const interval = setInterval(updateMemoryUsage, 2000);
    
    return () => {
      clearInterval(interval);
      memoryMonitor.stopMonitoring();
    };
  }, [enabled]);
  
  return memoryUsage;
}

// Utility to force garbage collection (development only)
export function forceGarbageCollection() {
  if (window.gc && typeof window.gc === 'function') {
    window.gc();
    console.log('Garbage collection forced');
  } else {
    console.warn('Garbage collection not available. Run with --expose-gc flag.');
  }
}

// Memory leak detector
export function detectMemoryLeaks() {
  const measurements = memoryMonitor.getAllMeasurements();
  if (measurements.length < 10) return null;
  
  const recent = measurements.slice(-10);
  const steadyIncrease = recent.every((measurement, index) => {
    if (index === 0) return true;
    return measurement.usedJSHeapSize > recent[index - 1].usedJSHeapSize;
  });
  
  if (steadyIncrease) {
    const first = recent[0];
    const last = recent[recent.length - 1];
    const increase = last.usedJSHeapSize - first.usedJSHeapSize;
    const increasePercent = (increase / first.usedJSHeapSize) * 100;
    
    return {
      detected: true,
      increase: Math.round(increase / 1024 / 1024), // MB
      increasePercent: Math.round(increasePercent * 100) / 100,
      timespan: last.timestamp - first.timestamp,
    };
  }
  
  return { detected: false };
}