import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { telemetry } from '../utils/telemetry.js';

/**
 * Global Error Boundary Component
 * Catches and handles React component errors gracefully
 */

function ErrorFallback({ error, resetErrorBoundary }) {
  React.useEffect(() => {
    // Log error to telemetry
    if (window.electronAPI?.telemetry) {
      window.electronAPI.telemetry.logError('react_error_boundary', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    }
  }, [error]);

  return (
    <div className="error-boundary-container">
      <div className="error-boundary-content">
        <div className="error-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2" />
            <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2" />
          </svg>
        </div>
        
        <h2 className="error-title">Something went wrong</h2>
        
        <p className="error-message">
          We encountered an unexpected error. The application is still running, but this component couldn't load properly.
        </p>
        
        <div className="error-details">
          <details>
            <summary>Technical Details</summary>
            <pre className="error-stack">
              {error.message}
              {process.env.NODE_ENV === 'development' && (
                <>
                  <br />
                  <br />
                  {error.stack}
                </>
              )}
            </pre>
          </details>
        </div>
        
        <div className="error-actions">
          <button 
            className="btn btn-primary" 
            onClick={resetErrorBoundary}
          >
            Try Again
          </button>
          
          <button 
            className="btn btn-secondary" 
            onClick={() => window.location.reload()}
          >
            Reload Application
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .error-boundary-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          padding: 2rem;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 12px;
          margin: 1rem;
        }
        
        .error-boundary-content {
          text-align: center;
          max-width: 500px;
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .error-icon {
          color: #e74c3c;
          margin-bottom: 1rem;
        }
        
        .error-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 1rem;
        }
        
        .error-message {
          color: #7f8c8d;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }
        
        .error-details {
          margin-bottom: 1.5rem;
          text-align: left;
        }
        
        .error-details summary {
          cursor: pointer;
          color: #3498db;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        
        .error-stack {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          color: #495057;
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-word;
        }
        
        .error-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        
        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .btn-primary {
          background: #3498db;
          color: white;
        }
        
        .btn-primary:hover {
          background: #2980b9;
          transform: translateY(-1px);
        }
        
        .btn-secondary {
          background: #95a5a6;
          color: white;
        }
        
        .btn-secondary:hover {
          background: #7f8c8d;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}

function ErrorBoundary({ children, fallback, onError }) {
  const handleError = (error, errorInfo) => {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Log to telemetry service
    if (window.electronAPI?.telemetry) {
      window.electronAPI.telemetry.logError('react_error_boundary', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      });
    }
    
    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={fallback || ErrorFallback}
      onError={handleError}
      onReset={() => {
        // Clear any error state
        console.log('Error boundary reset');
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

// Higher-order component for wrapping components with error boundaries
export function withErrorBoundary(Component, errorBoundaryConfig = {}) {
  const WrappedComponent = React.forwardRef((props, ref) => (
    <ErrorBoundary {...errorBoundaryConfig}>
      <Component {...props} ref={ref} />
    </ErrorBoundary>
  ));
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for handling async errors in components
export function useErrorHandler() {
  const [error, setError] = React.useState(null);
  
  const handleError = React.useCallback((error) => {
    console.error('Async error caught:', error);
    
    // Log to telemetry
    if (window.electronAPI?.telemetry) {
      window.electronAPI.telemetry.logError('async_error', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    }
    
    setError(error);
  }, []);
  
  const resetError = React.useCallback(() => {
    setError(null);
  }, []);
  
  // Throw error to be caught by error boundary
  if (error) {
    throw error;
  }
  
  return { handleError, resetError };
}

// Async wrapper for handling promise rejections
export function handleAsyncError(asyncFn) {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      console.error('Async operation failed:', error);
      
      // Log to telemetry
      if (window.electronAPI?.telemetry) {
        window.electronAPI.telemetry.logError('async_operation_failed', {
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
        });
      }
      
      throw error;
    }
  };
}

export default ErrorBoundary;