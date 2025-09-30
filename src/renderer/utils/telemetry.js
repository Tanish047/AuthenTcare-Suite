/**
 * Renderer-side telemetry utilities
 * Provides safe access to telemetry functions from renderer process
 */

class RendererTelemetry {
  constructor() {
    this.isAvailable = typeof window !== 'undefined' && window.electronAPI?.telemetry;
  }

  async logError(category, data) {
    if (!this.isAvailable) {
      console.warn('Telemetry not available, logging to console:', category, data);
      return;
    }

    try {
      // Use IPC to send error to main process
      await window.electronAPI.telemetry.logError(category, data);
    } catch (error) {
      console.error('Failed to log error to telemetry:', error);
    }
  }

  async logEvent(category, event, data = {}) {
    if (!this.isAvailable) {
      console.log('Event:', category, event, data);
      return;
    }

    try {
      await window.electronAPI.telemetry.logEvent(category, event, data);
    } catch (error) {
      console.error('Failed to log event to telemetry:', error);
    }
  }

  async logPerformance(operation, duration, metadata = {}) {
    if (!this.isAvailable) {
      // Only log significant performance events to console
      if (duration > 100 || operation.includes('milestone') || operation.includes('warning')) {
        console.log('Performance:', operation, `${duration}ms`, metadata);
      }
      return;
    }

    try {
      await window.electronAPI.telemetry.logPerformance(operation, duration, metadata);
    } catch (error) {
      console.error('Failed to log performance to telemetry:', error);
    }
  }
}

export const telemetry = new RendererTelemetry();

// Performance measurement utilities
export function measurePerformance(operation) {
  const startTime = performance.now();
  
  return {
    end: async (metadata = {}) => {
      const duration = performance.now() - startTime;
      await telemetry.logPerformance(operation, duration, metadata);
      return duration;
    }
  };
}

// Error tracking decorator
export function trackErrors(target, propertyKey, descriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = async function(...args) {
    try {
      return await originalMethod.apply(this, args);
    } catch (error) {
      await telemetry.logError('method_error', {
        method: `${target.constructor.name}.${propertyKey}`,
        error: error.message,
        stack: error.stack,
        args: args.length,
      });
      throw error;
    }
  };
  
  return descriptor;
}