import React from 'react';

/**
 * Loading Overlay - Displays loading state with progress details
 */
const LoadingOverlay = ({ message, details = [], progress = null }) => {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        {/* Loading Animation */}
        <div className="loading-animation">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
        </div>

        {/* Loading Message */}
        <div className="loading-message">
          <h3>{message || 'Loading...'}</h3>
        </div>

        {/* Progress Bar */}
        {progress !== null && (
          <div className="loading-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {Math.round(progress)}% Complete
            </div>
          </div>
        )}

        {/* Loading Details */}
        {details.length > 0 && (
          <div className="loading-details">
            {details.map((detail, index) => (
              <div key={index} className="detail-item">
                <span className="detail-icon">•</span>
                <span className="detail-text">{detail}</span>
              </div>
            ))}
          </div>
        )}

        {/* Loading Tips */}
        <div className="loading-tips">
          <div className="tip-item">
            <span className="tip-icon">💡</span>
            <span className="tip-text">
              First-time initialization may take a few minutes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;