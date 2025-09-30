import React, { useState } from 'react';

/**
 * Chat Sidebar - Session management and history
 */
const ChatSidebar = ({ 
  chatHistory, 
  currentSession, 
  onLoadSession, 
  onSaveSession, 
  onClearChat,
  aiStatus 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter chat history based on search
  const filteredHistory = chatHistory.filter(session => 
    session.messages.some(msg => 
      msg.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Format session preview
  const getSessionPreview = (session) => {
    const firstUserMessage = session.messages.find(msg => msg.type === 'user');
    return firstUserMessage ? 
      firstUserMessage.content.substring(0, 50) + '...' : 
      'New conversation';
  };

  // Format session date
  const formatSessionDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`chat-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <button 
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? '▶️' : '◀️'}
        </button>
        
        {!isCollapsed && (
          <>
            <h3>Chat Sessions</h3>
            <button 
              className="new-chat-btn"
              onClick={onClearChat}
              title="Start new chat"
            >
              ➕ New Chat
            </button>
          </>
        )}
      </div>

      {!isCollapsed && (
        <>
          {/* Search */}
          <div className="sidebar-search">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* AI Status */}
          <div className="sidebar-status">
            <div className="status-item">
              <span className={`status-dot ${aiStatus.rag.initialized ? 'active' : 'inactive'}`}></span>
              RAG Engine
            </div>
            <div className="status-item">
              <span className={`status-dot ${aiStatus.mcp.initialized ? 'active' : 'inactive'}`}></span>
              MCP Engine
            </div>
            <div className="status-item">
              <span className={`status-dot ${Object.values(aiStatus.services).some(Boolean) ? 'active' : 'inactive'}`}></span>
              AI Models
            </div>
          </div>

          {/* Current Session */}
          <div className="current-session">
            <div className="session-label">Current Session</div>
            <div className="session-item current">
              <div className="session-icon">💬</div>
              <div className="session-info">
                <div className="session-title">Active Chat</div>
                <div className="session-id">{currentSession}</div>
              </div>
              <button 
                className="save-session-btn"
                onClick={onSaveSession}
                title="Save current session"
              >
                💾
              </button>
            </div>
          </div>

          {/* Chat History */}
          <div className="chat-history">
            <div className="history-label">
              History ({filteredHistory.length})
            </div>
            
            {filteredHistory.length === 0 ? (
              <div className="no-history">
                {searchTerm ? 'No matching conversations' : 'No saved conversations'}
              </div>
            ) : (
              <div className="history-list">
                {filteredHistory.map((session) => (
                  <div 
                    key={session.id}
                    className="session-item"
                    onClick={() => onLoadSession(session)}
                  >
                    <div className="session-icon">📝</div>
                    <div className="session-info">
                      <div className="session-preview">
                        {getSessionPreview(session)}
                      </div>
                      <div className="session-meta">
                        <span className="session-date">
                          {formatSessionDate(session.timestamp)}
                        </span>
                        <span className="session-count">
                          {session.messages.length} messages
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="sidebar-footer">
            <div className="footer-stats">
              <div className="stat-item">
                <span className="stat-value">{chatHistory.length}</span>
                <span className="stat-label">Sessions</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {chatHistory.reduce((total, session) => total + session.messages.length, 0)}
                </span>
                <span className="stat-label">Messages</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatSidebar;