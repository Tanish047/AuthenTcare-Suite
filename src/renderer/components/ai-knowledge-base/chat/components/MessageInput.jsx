import React, { useState, useRef, useEffect } from 'react';

/**
 * Message Input - Advanced input component with file upload and formatting
 */
const MessageInput = ({ onSendMessage, onFileUpload, disabled, settings }) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Handle send message
  const handleSend = () => {
    if ((!message.trim() && attachments.length === 0) || disabled) return;

    onSendMessage(message, attachments);
    setMessage('');
    setAttachments([]);
    setIsExpanded(false);
  };

  // Handle key press
  const handleKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle file selection
  const handleFileSelect = e => {
    const files = Array.from(e.target.files);
    addAttachments(files);
  };

  // Add attachments
  const addAttachments = files => {
    const newAttachments = files.map(file => ({
      id: `file_${Date.now()}_${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
  };

  // Remove attachment
  const removeAttachment = id => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  // Format file size
  const formatFileSize = bytes => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon
  const getFileIcon = type => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('docx')) return '📝';
    if (type.includes('excel') || type.includes('xlsx')) return '📊';
    if (type.includes('text')) return '📃';
    return '📁';
  };

  return (
    <div className={`message-input-container ${isExpanded ? 'expanded' : ''}`}>
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="attachments-preview">
          <div className="attachments-header">
            <span>📎 {attachments.length} file(s) attached</span>
            <button className="clear-attachments" onClick={() => setAttachments([])}>
              Clear all
            </button>
          </div>
          <div className="attachments-list">
            {attachments.map(attachment => (
              <div key={attachment.id} className="attachment-preview">
                <span className="attachment-icon">{getFileIcon(attachment.type)}</span>
                <div className="attachment-details">
                  <span className="attachment-name">{attachment.name}</span>
                  <span className="attachment-size">{formatFileSize(attachment.size)}</span>
                </div>
                <button
                  className="remove-attachment"
                  onClick={() => removeAttachment(attachment.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="input-area">
        <div className="input-wrapper">
          {/* Expand/Collapse Button */}
          <button
            className="expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '🔽' : '🔼'}
          </button>

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about medical device regulations, FDA requirements, compliance processes..."
            disabled={disabled}
            className="message-textarea"
            rows={isExpanded ? 4 : 1}
          />

          {/* Input Actions */}
          <div className="input-actions">
            {/* File Upload */}
            <button
              className="action-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              title="Attach files"
            >
              📎
            </button>

            {/* Voice Input (Future feature) */}
            <button className="action-btn" disabled={true} title="Voice input (coming soon)">
              🎤
            </button>

            {/* Send Button */}
            <button
              className={`send-btn ${message.trim() || attachments.length > 0 ? 'active' : ''}`}
              onClick={handleSend}
              disabled={disabled || (!message.trim() && attachments.length === 0)}
              title="Send message"
            >
              {disabled ? '⏳' : '🚀'}
            </button>
          </div>
        </div>

        {/* Input Footer */}
        <div className="input-footer">
          <div className="input-info">
            <span className="model-info">
              Using {settings.model} • {settings.temperature} temperature
            </span>
            {settings.enableRAG && <span className="rag-indicator">📚 RAG Enhanced</span>}
          </div>

          <div className="input-shortcuts">
            <span>Press Enter to send, Shift+Enter for new line</span>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileSelect}
        accept=".pdf,.docx,.txt,.md,.json,.xml,.csv,.xlsx,.jpg,.jpeg,.png,.gif"
      />
    </div>
  );
};

export default MessageInput;
