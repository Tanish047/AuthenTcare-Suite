import React from 'react';

/**
 * Chat Settings - Configuration panel for AI chat parameters
 */
const ChatSettings = ({ settings, onSettingsChange, onClose, aiStatus }) => {
  const handleSettingChange = (key, value) => {
    onSettingsChange(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const modelOptions = [
    { value: 'gpt-4', label: 'GPT-4 (Most Capable)', available: aiStatus.services.openai },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Fast)', available: aiStatus.services.openai },
    { value: 'command', label: 'Cohere Command', available: aiStatus.services.cohere },
    { value: 'mock', label: 'Mock Model (Testing)', available: true },
  ];

  const temperatureOptions = [
    { value: 0.1, label: 'Very Focused (0.1)', description: 'Highly deterministic responses' },
    { value: 0.3, label: 'Focused (0.3)', description: 'Consistent and reliable' },
    {
      value: 0.7,
      label: 'Balanced (0.7)',
      description: 'Good balance of creativity and consistency',
    },
    { value: 0.9, label: 'Creative (0.9)', description: 'More varied and creative responses' },
  ];

  const maxTokensOptions = [
    { value: 500, label: 'Short (500 tokens)', description: 'Brief, concise responses' },
    { value: 1000, label: 'Medium (1000 tokens)', description: 'Detailed explanations' },
    { value: 2000, label: 'Long (2000 tokens)', description: 'Comprehensive responses' },
    { value: 4000, label: 'Very Long (4000 tokens)', description: 'In-depth analysis' },
  ];

  return (
    <div className="chat-settings-panel">
      <div className="settings-header">
        <h3>Chat Settings</h3>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="settings-content">
        {/* Model Selection */}
        <div className="setting-group">
          <label className="setting-label">
            <span className="label-text">AI Model</span>
            <span className="label-description">Choose the AI model for responses</span>
          </label>
          <select
            value={settings.model}
            onChange={e => handleSettingChange('model', e.target.value)}
            className="setting-select"
          >
            {modelOptions.map(option => (
              <option key={option.value} value={option.value} disabled={!option.available}>
                {option.label} {!option.available ? '(Unavailable)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Temperature */}
        <div className="setting-group">
          <label className="setting-label">
            <span className="label-text">Response Style</span>
            <span className="label-description">Controls creativity vs consistency</span>
          </label>
          <div className="temperature-options">
            {temperatureOptions.map(option => (
              <button
                key={option.value}
                className={`temperature-btn ${
                  settings.temperature === option.value ? 'active' : ''
                }`}
                onClick={() => handleSettingChange('temperature', option.value)}
                title={option.description}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Max Tokens */}
        <div className="setting-group">
          <label className="setting-label">
            <span className="label-text">Response Length</span>
            <span className="label-description">Maximum length of AI responses</span>
          </label>
          <div className="token-options">
            {maxTokensOptions.map(option => (
              <button
                key={option.value}
                className={`token-btn ${settings.maxTokens === option.value ? 'active' : ''}`}
                onClick={() => handleSettingChange('maxTokens', option.value)}
                title={option.description}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* System Prompt */}
        <div className="setting-group">
          <label className="setting-label">
            <span className="label-text">System Instructions</span>
            <span className="label-description">Customize the AI's behavior and expertise</span>
          </label>
          <textarea
            value={settings.systemPrompt}
            onChange={e => handleSettingChange('systemPrompt', e.target.value)}
            className="setting-textarea"
            rows={4}
            placeholder="Enter custom system instructions..."
          />
        </div>

        {/* Feature Toggles */}
        <div className="setting-group">
          <label className="setting-label">
            <span className="label-text">Enhanced Features</span>
            <span className="label-description">Enable advanced AI capabilities</span>
          </label>

          <div className="feature-toggles">
            <div className="toggle-item">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={settings.enableRAG}
                  onChange={e => handleSettingChange('enableRAG', e.target.checked)}
                  disabled={!aiStatus.rag.initialized}
                />
                <span className="toggle-slider"></span>
                <div className="toggle-text">
                  <span className="toggle-title">RAG Enhancement</span>
                  <span className="toggle-description">
                    Use document knowledge base for responses
                  </span>
                </div>
              </label>
              {!aiStatus.rag.initialized && (
                <span className="toggle-status">RAG engine not initialized</span>
              )}
            </div>

            <div className="toggle-item">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={settings.enableMCP}
                  onChange={e => handleSettingChange('enableMCP', e.target.checked)}
                  disabled={!aiStatus.mcp.initialized}
                />
                <span className="toggle-slider"></span>
                <div className="toggle-text">
                  <span className="toggle-title">MCP Tools</span>
                  <span className="toggle-description">Enable Model Context Protocol tools</span>
                </div>
              </label>
              {!aiStatus.mcp.initialized && (
                <span className="toggle-status">MCP engine not initialized</span>
              )}
            </div>
          </div>
        </div>

        {/* Preset Configurations */}
        <div className="setting-group">
          <label className="setting-label">
            <span className="label-text">Quick Presets</span>
            <span className="label-description">Apply predefined configurations</span>
          </label>

          <div className="preset-buttons">
            <button
              className="preset-btn"
              onClick={() =>
                onSettingsChange({
                  model: 'gpt-3.5-turbo',
                  temperature: 0.3,
                  maxTokens: 1000,
                  systemPrompt:
                    'You are a precise regulatory compliance assistant. Provide accurate, fact-based responses about medical device regulations.',
                  enableRAG: true,
                  enableMCP: true,
                })
              }
            >
              🎯 Precise Mode
            </button>

            <button
              className="preset-btn"
              onClick={() =>
                onSettingsChange({
                  model: 'gpt-4',
                  temperature: 0.7,
                  maxTokens: 2000,
                  systemPrompt:
                    'You are an expert regulatory consultant. Provide comprehensive, detailed guidance on medical device compliance with practical examples.',
                  enableRAG: true,
                  enableMCP: true,
                })
              }
            >
              🧠 Expert Mode
            </button>

            <button
              className="preset-btn"
              onClick={() =>
                onSettingsChange({
                  model: 'gpt-3.5-turbo',
                  temperature: 0.5,
                  maxTokens: 500,
                  systemPrompt:
                    'You are a helpful regulatory assistant. Provide clear, concise answers to compliance questions.',
                  enableRAG: false,
                  enableMCP: false,
                })
              }
            >
              ⚡ Quick Mode
            </button>
          </div>
        </div>
      </div>

      {/* Settings Footer */}
      <div className="settings-footer">
        <div className="footer-info">
          <span className="info-text">Changes apply immediately to new messages</span>
        </div>
        <div className="footer-actions">
          <button
            className="btn btn-secondary"
            onClick={() => {
              // Reset to defaults
              onSettingsChange({
                model: 'gpt-3.5-turbo',
                temperature: 0.7,
                maxTokens: 1000,
                systemPrompt:
                  'You are an expert AI assistant specializing in medical device regulatory compliance. Provide accurate, helpful, and detailed responses about FDA regulations, medical device classifications, quality management systems, and regulatory pathways.',
                enableRAG: true,
                enableMCP: true,
              });
            }}
          >
            Reset Defaults
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSettings;
