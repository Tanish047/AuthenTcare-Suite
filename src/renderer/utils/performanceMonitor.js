import { telemetry } from './telemetry.js';

/**
 * Performance Monitoring Utilities
 * Tracks application performance metrics and user interactions
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.isEnabled = true;
    this.thresholds = {
      slowRender: 16, // 16ms for 60fps
      slowInteraction: 100, // 100ms for interactions
      memoryWarning: 100 * 1024 * 1024, // 100MB
      bundleSize: 5 * 1024 * 1024, // 5MB
    };
    
    this.initialize();
  }

  initialize() {
    if (typeof window === 'undefined') return;

    // Monitor Core Web Vitals
    this.observeWebVitals();
    
    // Monitor React rendering performance
    this.observeReactPerformance();
    
    // Monitor memory usage
    this.observeMemoryUsage();
    
    // Monitor network performance
    this.observeNetworkPerformance();
    
    // Monitor user interactions
    this.observeUserInteractions();
    
    console.log('📊 Performance monitoring initialized');
  }

  observeWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        this.recordMetric('lcp', lastEntry.startTime, {
          element: lastEntry.element?.tagName,
          url: lastEntry.url,
        });
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }
    }

    // First Input Delay (FID)
    if ('PerformanceObserver' in window) {
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          this.recordMetric('fid', entry.processingStart - entry.startTime, {
            eventType: entry.name,
          });
        });
      });
      
      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (error) {
        console.warn('FID observer not supported:', error);
      }
    }

    // Cumulative Layout Shift (CLS) - Throttled logging
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      let lastLogTime = 0;
      const LOG_THROTTLE = 5000; // Only log CLS every 5 seconds
      
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        // Only log if enough time has passed and CLS is significant
        const now = Date.now();
        if (now - lastLogTime > LOG_THROTTLE && clsValue > 0.01) {
          this.recordMetric('cls', clsValue);
          lastLogTime = now;
        }
      });
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (error) {
        console.warn('CLS observer not supported:', error);
      }
    }
  }

  observeReactPerformance() {
    // Monitor React component render times
    if (window.React && window.React.Profiler) {
      this.reactProfiler = {
        onRender: (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
          if (actualDuration > this.thresholds.slowRender) {
            this.recordMetric('react_slow_render', actualDuration, {
              componentId: id,
              phase,
              baseDuration,
              startTime,
              commitTime,
            });
          }
        }
      };
    }

    // Monitor React error boundaries
    window.addEventListener('error', (event) => {
      if (event.error && event.error.stack && event.error.stack.includes('React')) {
        this.recordMetric('react_error', 1, {
          message: event.error.message,
          stack: event.error.stack.substring(0, 500), // Truncate for storage
          filename: event.filename,
          lineno: event.lineno,
        });
      }
    });
  }

  observeMemoryUsage() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        
        // Only log if memory usage is significant or has changed substantially
        const currentUsage = memory.usedJSHeapSize;
        const lastUsage = this.lastMemoryUsage || 0;
        const changeThreshold = 5 * 1024 * 1024; // 5MB change threshold
        
        if (Math.abs(currentUsage - lastUsage) > changeThreshold || currentUsage > this.thresholds.memoryWarning) {
          this.recordMetric('memory_usage', currentUsage, {
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
          });
          this.lastMemoryUsage = currentUsage;
        }
        
        // Warn if memory usage is high (but don't spam)
        if (currentUsage > this.thresholds.memoryWarning && !this.memoryWarningLogged) {
          this.recordMetric('memory_warning', currentUsage, {
            percentage: (currentUsage / memory.jsHeapSizeLimit) * 100,
          });
          this.memoryWarningLogged = true;
          
          // Reset warning flag after 5 minutes
          setTimeout(() => {
            this.memoryWarningLogged = false;
          }, 300000);
        }
      }, 60000); // Check every 60 seconds instead of 30
    }
  }

  observeNetworkPerformance() {
    if ('PerformanceObserver' in window) {
      const networkObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') {
            // Only log slow requests or errors to reduce noise
            if (entry.duration > 1000 || entry.name.includes('error') || entry.name.includes('fail')) {
              this.recordMetric('network_request', entry.duration, {
                url: entry.name.substring(0, 100), // Truncate long URLs
                method: entry.initiatorType,
                size: entry.transferSize,
                cached: entry.transferSize === 0,
              });
            }
          }
        });
      });
      
      try {
        networkObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('network', networkObserver);
      } catch (error) {
        console.warn('Network observer not supported:', error);
      }
    }
  }

  observeUserInteractions() {
    // Track click interactions
    document.addEventListener('click', (event) => {
      const startTime = performance.now();
      
      // Use requestAnimationFrame to measure interaction response time
      requestAnimationFrame(() => {
        const responseTime = performance.now() - startTime;
        
        if (responseTime > this.thresholds.slowInteraction) {
          this.recordMetric('slow_interaction', responseTime, {
            element: event.target.tagName,
            className: event.target.className,
            id: event.target.id,
          });
        }
      });
    });

    // Track navigation timing
    window.addEventListener('beforeunload', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        this.recordMetric('page_load', navigation.loadEventEnd - navigation.fetchStart, {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          firstPaint: this.getFirstPaintTime(),
        });
      }
    });
  }

  getFirstPaintTime() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  recordMetric(name, value, metadata = {}) {
    if (!this.isEnabled) return;

    const metric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.pathname,
      userAgent: navigator.userAgent,
      ...metadata,
    };

    // Store locally
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const metrics = this.metrics.get(name);
    metrics.push(metric);
    
    // Keep only last 100 entries per metric
    if (metrics.length > 100) {
      metrics.shift();
    }

    // Send to telemetry service
    telemetry.logPerformance(name, value, metadata);

    // Log warnings for critical metrics
    this.checkThresholds(name, value, metadata);
  }

  checkThresholds(name, value, metadata) {
    const warnings = [];

    switch (name) {
      case 'lcp':
        if (value > 2500) warnings.push('LCP is slow (>2.5s)');
        break;
      case 'fid':
        if (value > 100) warnings.push('FID is slow (>100ms)');
        break;
      case 'cls':
        if (value > 0.1) warnings.push('CLS is high (>0.1)');
        break;
      case 'react_slow_render':
        warnings.push(`Slow React render: ${value.toFixed(2)}ms`);
        break;
      case 'memory_warning':
        warnings.push(`High memory usage: ${(value / 1024 / 1024).toFixed(2)}MB`);
        break;
      case 'slow_interaction':
        warnings.push(`Slow interaction: ${value.toFixed(2)}ms`);
        break;
    }

    warnings.forEach(warning => {
      console.warn(`⚠️ Performance Warning: ${warning}`, metadata);
    });
  }

  // Public API methods
  startTimer(name) {
    const startTime = performance.now();
    
    return {
      end: (metadata = {}) => {
        const duration = performance.now() - startTime;
        this.recordMetric(name, duration, metadata);
        return duration;
      }
    };
  }

  markMilestone(name, metadata = {}) {
    this.recordMetric(`milestone_${name}`, performance.now(), metadata);
  }

  getMetrics(name = null) {
    if (name) {
      return this.metrics.get(name) || [];
    }
    
    const allMetrics = {};
    for (const [key, value] of this.metrics.entries()) {
      allMetrics[key] = value;
    }
    return allMetrics;
  }

  getAverageMetric(name, timeWindow = 300000) { // 5 minutes default
    const metrics = this.metrics.get(name) || [];
    const cutoff = Date.now() - timeWindow;
    
    const recentMetrics = metrics.filter(m => m.timestamp > cutoff);
    if (recentMetrics.length === 0) return null;
    
    const sum = recentMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / recentMetrics.length;
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: {},
      summary: {},
    };

    // Calculate averages for key metrics
    const keyMetrics = ['lcp', 'fid', 'cls', 'memory_usage', 'network_request'];
    
    keyMetrics.forEach(metric => {
      const average = this.getAverageMetric(metric);
      if (average !== null) {
        report.metrics[metric] = {
          average,
          count: this.metrics.get(metric)?.length || 0,
          latest: this.metrics.get(metric)?.slice(-1)[0]?.value,
        };
      }
    });

    // Performance summary
    report.summary = {
      overallScore: this.calculatePerformanceScore(),
      warnings: this.getActiveWarnings(),
      recommendations: this.getRecommendations(),
    };

    return report;
  }

  calculatePerformanceScore() {
    let score = 100;
    
    // Deduct points for poor metrics
    const lcp = this.getAverageMetric('lcp');
    if (lcp > 4000) score -= 30;
    else if (lcp > 2500) score -= 15;
    
    const fid = this.getAverageMetric('fid');
    if (fid > 300) score -= 25;
    else if (fid > 100) score -= 10;
    
    const cls = this.getAverageMetric('cls');
    if (cls > 0.25) score -= 25;
    else if (cls > 0.1) score -= 10;
    
    return Math.max(0, score);
  }

  getActiveWarnings() {
    const warnings = [];
    
    if (this.getAverageMetric('memory_usage') > this.thresholds.memoryWarning) {
      warnings.push('High memory usage detected');
    }
    
    if (this.getAverageMetric('slow_interaction') > this.thresholds.slowInteraction) {
      warnings.push('Slow user interactions detected');
    }
    
    return warnings;
  }

  getRecommendations() {
    const recommendations = [];
    
    const lcp = this.getAverageMetric('lcp');
    if (lcp > 2500) {
      recommendations.push('Optimize largest contentful paint by reducing image sizes and improving server response times');
    }
    
    const memoryUsage = this.getAverageMetric('memory_usage');
    if (memoryUsage > this.thresholds.memoryWarning) {
      recommendations.push('Consider implementing virtual scrolling for large lists and cleaning up unused components');
    }
    
    return recommendations;
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  cleanup() {
    // Disconnect all observers
    for (const [name, observer] of this.observers.entries()) {
      observer.disconnect();
    }
    this.observers.clear();
    this.metrics.clear();
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React Profiler component for measuring render performance
export function ProfiledComponent({ id, children, onRender }) {
  if (window.React && window.React.Profiler) {
    return React.createElement(
      window.React.Profiler,
      {
        id,
        onRender: onRender || performanceMonitor.reactProfiler?.onRender,
      },
      children
    );
  }
  
  return children;
}

// Higher-order component for performance tracking
export function withPerformanceTracking(Component, componentName) {
  return function PerformanceTrackedComponent(props) {
    React.useEffect(() => {
      const timer = performanceMonitor.startTimer(`component_mount_${componentName}`);
      
      return () => {
        timer.end();
      };
    }, []);
    
    return React.createElement(Component, props);
  };
}

// Hook for component-level performance tracking
export function usePerformanceTracking(componentName) {
  React.useEffect(() => {
    const timer = performanceMonitor.startTimer(`component_render_${componentName}`);
    timer.end();
  });
  
  return {
    startTimer: (name) => performanceMonitor.startTimer(name),
    markMilestone: (name, metadata) => performanceMonitor.markMilestone(name, metadata),
  };
}