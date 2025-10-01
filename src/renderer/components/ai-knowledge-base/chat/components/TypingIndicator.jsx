import React from 'react';

/**
 * Typing Indicator - Shows when AI is processing
 */
const TypingIndicator = () => {
  return (
    <div className="message-bubble assistant typing">
      <div className="message-header">
        <div className="message-avatar">🤖</div>
        <div className="message-info">
          <span className="message-sender">AI Assistant</span>
          <span className="message-time">typing...</span>
        </div>
      </div>

      <div className="message-content">
        <div className="typing-indicator">
          <div className="typing-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
          <span className="typing-text">Analyzing your query...</span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
