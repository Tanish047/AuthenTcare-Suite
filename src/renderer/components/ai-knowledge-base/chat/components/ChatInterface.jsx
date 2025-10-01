import React, { useState, useRef, forwardRef } from 'react';
import MessageBubble from './MessageBubble.jsx';
import SimpleQueryInput from './SimpleQueryInput.jsx';
import TypingIndicator from './TypingIndicator.jsx';

/**
 * Chat Interface - Main chat conversation area with dedicated chat window
 */
const ChatInterface = forwardRef(({ messages, isTyping, onSendMessage, settings }, ref) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Handle file drop
  const handleDrop = e => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = e => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = e => {
    e.preventDefault();
    setDragOver(false);
  };

  // Handle file upload
  const handleFileUpload = files => {
    const attachments = files.map(file => ({
      id: `file_${Date.now()}_${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
    }));

    // Send message with attachments
    onSendMessage('', attachments);
  };

  return (
    <div className="chat-interface">
      {/* Message Container Box - Above Search Bar */}
      <div className="message-container-box">
        {/* Messages Container with Scroller */}
        <div
          ref={ref}
          className={`messages-container ${dragOver ? 'drag-over' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {/* Drag overlay */}
          {dragOver && (
            <div className="drag-overlay">
              <div className="drag-content">
                <div className="drag-icon">📁</div>
                <p>Drop files here to analyze</p>
                <small>Supports PDF, DOCX, TXT, images, and more</small>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="messages-list">
            {messages.map(message => (
              <MessageBubble key={message.id} message={message} settings={settings} />
            ))}

            {/* Typing indicator */}
            {isTyping && <TypingIndicator />}
          </div>

          {/* Empty state */}
          {messages.length <= 1 && (
            <div className="chat-empty-state">
              <div className="empty-state-content">
                <div className="empty-state-icon">🤖</div>
                <h3>AI Regulatory Assistant</h3>
                <p>
                  Ask me anything about medical device regulations, FDA requirements, compliance
                  processes, and more.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar Container - Below Message Box */}
      <div className="search-bar-container">
        <SimpleQueryInput onSendMessage={onSendMessage} disabled={isTyping} />
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={e => handleFileUpload(Array.from(e.target.files))}
        accept=".pdf,.docx,.txt,.md,.json,.xml,.csv,.xlsx,.jpg,.jpeg,.png,.gif"
      />
    </div>
  );
});

ChatInterface.displayName = 'ChatInterface';

export default ChatInterface;
