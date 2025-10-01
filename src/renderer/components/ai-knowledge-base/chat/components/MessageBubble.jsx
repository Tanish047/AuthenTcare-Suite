import React, { useState } from 'react';

// Enhanced markdown-like text formatter with better formatting
const SimpleMarkdownRenderer = ({ children }) => {
  if (!children) return null;

  // Enhanced text formatting with support for lists, bold, etc.
  const formatText = text => {
    const lines = text.split('\n');
    const formattedLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Handle bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        formattedLines.push(
          <div
            key={i}
            className="bullet-point"
            style={{ marginLeft: '1rem', marginBottom: '0.25rem' }}
          >
            {line.trim()}
          </div>
        );
      }
      // Handle numbered lists
      else if (/^\d+\./.test(line.trim())) {
        formattedLines.push(
          <div
            key={i}
            className="numbered-point"
            style={{ marginLeft: '1rem', marginBottom: '0.25rem' }}
          >
            {line.trim()}
          </div>
        );
      }
      // Handle headers (lines that end with :)
      else if (line.trim().endsWith(':') && line.trim().length > 1) {
        formattedLines.push(
          <div
            key={i}
            className="section-header"
            style={{
              fontWeight: '600',
              marginTop: '1rem',
              marginBottom: '0.5rem',
              color: '#1f2937',
            }}
          >
            {line.trim()}
          </div>
        );
      }
      // Handle bold text (**text**)
      else if (line.includes('**')) {
        const parts = line.split('**');
        const formatted = parts.map((part, idx) =>
          idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
        );
        formattedLines.push(
          <div key={i} style={{ marginBottom: '0.5rem' }}>
            {formatted}
          </div>
        );
      }
      // Handle empty lines
      else if (line.trim() === '') {
        formattedLines.push(<div key={i} style={{ height: '0.5rem' }}></div>);
      }
      // Regular text
      else {
        formattedLines.push(
          <div key={i} style={{ marginBottom: '0.5rem', lineHeight: '1.5' }}>
            {line}
          </div>
        );
      }
    }

    return formattedLines;
  };

  return (
    <div className="simple-markdown" style={{ whiteSpace: 'pre-wrap' }}>
      {formatText(children)}
    </div>
  );
};

/**
 * Message Bubble - Individual chat message component with rich formatting
 */
const MessageBubble = ({ message, settings }) => {
  const [showMetadata, setShowMetadata] = useState(false);
  const [copied, setCopied] = useState(false);

  // Format timestamp
  const formatTime = timestamp => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Copy message content
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Render attachments
  const renderAttachments = () => {
    if (!message.attachments || message.attachments.length === 0) return null;

    return (
      <div className="message-attachments">
        {message.attachments.map(attachment => (
          <div key={attachment.id} className="attachment-item">
            <div className="attachment-icon">{getFileIcon(attachment.type)}</div>
            <div className="attachment-info">
              <span className="attachment-name">{attachment.name}</span>
              <span className="attachment-size">{formatFileSize(attachment.size)}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Get file icon based on type
  const getFileIcon = type => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('docx')) return '📝';
    if (type.includes('excel') || type.includes('xlsx')) return '📊';
    if (type.includes('text')) return '📃';
    return '📁';
  };

  // Format file size
  const formatFileSize = bytes => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Render sources if available
  const renderSources = () => {
    if (!message.metadata?.sources || message.metadata.sources.length === 0) return null;

    return (
      <div className="message-sources">
        <h4>📚 Sources:</h4>
        <div className="sources-list">
          {message.metadata.sources.map((source, index) => (
            <div key={index} className="source-item">
              <div className="source-title">{source.title || source.filename}</div>
              <div className="source-confidence">
                Confidence: {(source.confidence * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`message-bubble ${message.type}`}>
      {/* Message Header */}
      <div className="message-header">
        <div className="message-avatar">
          {message.type === 'user' ? '👤' : message.type === 'assistant' ? '🤖' : '⚠️'}
        </div>
        <div className="message-info">
          <span className="message-sender">
            {message.type === 'user'
              ? 'You'
              : message.type === 'assistant'
                ? 'AI Assistant'
                : 'System'}
          </span>
          <span className="message-time">{formatTime(message.timestamp)}</span>
        </div>

        {/* Message Actions */}
        <div className="message-actions">
          <button className="action-btn" onClick={handleCopy} title="Copy message">
            {copied ? '✅' : '📋'}
          </button>
          {message.metadata && (
            <button
              className="action-btn"
              onClick={() => setShowMetadata(!showMetadata)}
              title="Show metadata"
            >
              ℹ️
            </button>
          )}
        </div>
      </div>

      {/* Message Content */}
      <div className="message-content">
        {message.type === 'error' ? (
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            {message.content}
          </div>
        ) : (
          <div className="markdown-content">
            <SimpleMarkdownRenderer>{message.content}</SimpleMarkdownRenderer>
          </div>
        )}

        {/* Attachments */}
        {renderAttachments()}

        {/* Sources */}
        {renderSources()}
      </div>

      {/* Metadata */}
      {showMetadata && message.metadata && (
        <div className="message-metadata">
          <div className="metadata-grid">
            {message.metadata.model && (
              <div className="metadata-item">
                <span className="metadata-label">Model:</span>
                <span className="metadata-value">{message.metadata.model}</span>
              </div>
            )}
            {message.metadata.provider && (
              <div className="metadata-item">
                <span className="metadata-label">Provider:</span>
                <span className="metadata-value">{message.metadata.provider}</span>
              </div>
            )}
            {message.metadata.confidence && (
              <div className="metadata-item">
                <span className="metadata-label">Confidence:</span>
                <span className="metadata-value">
                  {(message.metadata.confidence * 100).toFixed(1)}%
                </span>
              </div>
            )}
            {message.metadata.processingTime && (
              <div className="metadata-item">
                <span className="metadata-label">Processing Time:</span>
                <span className="metadata-value">
                  {message.metadata.processingTime.toFixed(2)}ms
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
