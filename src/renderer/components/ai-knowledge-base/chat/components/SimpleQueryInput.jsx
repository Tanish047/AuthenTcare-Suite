import React, { useState, useRef } from 'react';

/**
 * Simple Query Input - Basic, functional input for AI queries
 */
const SimpleQueryInput = ({ onSendMessage, disabled = false }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = e => {
    e.preventDefault();
    if (query.trim() && !disabled && onSendMessage) {
      onSendMessage(query.trim());
      setQuery('');
    }
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="simple-query-input">
      <form onSubmit={handleSubmit} className="query-form">
        <div className="input-container">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about medical device regulations, FDA requirements, compliance processes..."
            disabled={disabled}
            className="query-input"
            autoComplete="off"
          />
          <button type="submit" disabled={!query.trim() || disabled} className="send-button">
            {disabled ? '⏳' : '🚀'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SimpleQueryInput;
