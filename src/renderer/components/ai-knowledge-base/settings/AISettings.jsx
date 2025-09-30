import React, { useState, useEffect } from 'react';
import { performanceMonitor } from '../../../utils/performanceMonitor.js';
import { telemetry } from '../../../utils/telemetry.js';

/**
 * AI Settings - Configuration panel for AI models and services
 */
const AISettings = ({ aiStatus, onStatusUpdate }) => {
  const [settings, setSettings] = useState({
    openai: {
      enabled: false,
      apiKey: '',
      model: 'gpt-3.5-turbo',
      maxTokens: 2000,
      temperature: 0.7
    },
    cohere: {
      enabled: false,
      apiKey: '',
      model: 'command',
      maxTokens: 2000,
      temperature: 0.7
    },
    pinecone: {
      enabled: false,
      apiKey: '',
      environment: '',
      indexName: 'regulatory-docs'
    },
    rag: {
      enabled: true,
      chunkSize: 1000,
      chunkOverlap: 200,
      maxResults: 5,
      threshold: 0.7,
      reranking: true
    },
    mcp: {
      enabled: true,
      tools: {
        'regulatory-brain': true,
        'document-analyzer': true,
        'compliance-checker': true
      }
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testResults, setTestResults] = useState({});

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const currentSettings = await window.electronAPI?.settingsAPI?.getAISettings();
        if (currentSettings?.success) {
          setSettings(prev => ({ ...prev, ...currentSettings.data }));
        }
      } catch (error) {
        console.error('Failed to load AI settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Handle setting changes
  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  // Save settings
  const handleSaveSettings = async () => {
    setIsSaving(true);
    const timer = performanceMonitor.startTimer('ai_settings_save');

    try {
      const result = await window.electronAPI.settingsAPI.saveAISettings(settings);
      
      if (result.success) {
        // Reinitialize services with new settings
        if (settings.rag.enabled) {
          await window.electronAPI.ragAPI.initialize(settings.rag);
        }
        
        if (settings.mcp.enabled) {
          await window.electronAPI.mcpAPI.initialize(settings.mcp);
        }

        // Update status
        onStatusUpdate(prev => ({
          ...prev,
          rag: { initialized: settings.rag.enabled, status: 'ready' },
          mcp: { initialized: settings.mcp.enabled, status: 'ready' }
        }));

        await telemetry.logEvent('ai_settings', 'saved', {
          saveTime: timer.end(),
          ragEnabled: settings.rag.enabled,
          mcpEnabled: settings.mcp.enabled
        });
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      await telemetry.logError('ai_settings_save_failed', {
        error: error.message
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Test API connection
  const handleTestConnection = async (service) => {
    setTestResults(prev => ({ ...prev, [service]: { testing: true } }));

    try {
      let result;
      switch (service) {
        case 'openai':
          result = await window.electronAPI.aiAPI.testOpenAI({
            apiKey: settings.openai.apiKey,
            model: settings.openai.model
          });
          break;
        case 'cohere':
          result = await window.electronAPI.aiAPI.testCohere({
            apiKey: settings.cohere.apiKey,
            model: settings.cohere.model
          });
          break;
        case 'pinecone':
          result = await window.electronAPI.ragAPI.testPinecone({
            apiKey: settings.pinecone.apiKey,
            environment: settings.pinecone.environment
          });
          break;
        default:
          throw new Error('Unknown service');
      }

      setTestResults(prev => ({
        ...prev,
        [service]: {
          success: result.success,
          message: result.message,
          latency: result.latency
        }
      }));

    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [service]: {
          success: false,
          message: error.message
        }
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="ai-settings-loading">
        <div className="loading-content">
          <div className="loading-spinner">⚙️</div>
          <h3>Loading AI Settings...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-settings">
      {/* Settings Header */}
      <div className="settings-header">
        <h2>AI Configuration</h2>
        <p>Configure AI models, services, and advanced features</p>
        
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setSettings({})} // Reset to defaults
            disabled={isSaving}
          >
            Reset Defaults
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleSaveSettings}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="settings-content">
        {/* OpenAI Configuration */}
        <div className="settings-section">
          <div className="section-header">
            <h3>🤖 OpenAI Configuration</h3>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.openai.enabled}
                onChange={(e) => handleSettingChange('openai', 'enabled', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {settings.openai.enabled && (
            <div className="section-content">
              <div className="form-group">
                <label>API Key</label>
                <div className="input-with-test">
                  <input
                    type="password"
                    value={settings.openai.apiKey}
                    onChange={(e) => handleSettingChange('openai', 'apiKey', e.target.value)}
                    placeholder="sk-..."
                  />
                  <button 
                    className="test-btn"
                    onClick={() => handleTestConnection('openai')}
                    disabled={!settings.openai.apiKey}
                  >
                    Test
                  </button>
                </div>
                {testResults.openai && (
                  <div className={`test-result ${testResults.openai.success ? 'success' : 'error'}`}>
                    {testResults.openai.testing ? 'Testing...' : testResults.openai.message}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Model</label>
                <select
                  value={settings.openai.model}
                  onChange={(e) => handleSettingChange('openai', 'model', e.target.value)}
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Max Tokens</label>
                  <input
                    type="number"
                    value={settings.openai.maxTokens}
                    onChange={(e) => handleSettingChange('openai', 'maxTokens', parseInt(e.target.value))}
                    min="100"
                    max="4000"
                  />
                </div>
                <div className="form-group">
                  <label>Temperature</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.openai.temperature}
                    onChange={(e) => handleSettingChange('openai', 'temperature', parseFloat(e.target.value))}
                  />
                  <span className="range-value">{settings.openai.temperature}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cohere Configuration */}
        <div className="settings-section">
          <div className="section-header">
            <h3>🧠 Cohere Configuration</h3>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.cohere.enabled}
                onChange={(e) => handleSettingChange('cohere', 'enabled', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {settings.cohere.enabled && (
            <div className="section-content">
              <div className="form-group">
                <label>API Key</label>
                <div className="input-with-test">
                  <input
                    type="password"
                    value={settings.cohere.apiKey}
                    onChange={(e) => handleSettingChange('cohere', 'apiKey', e.target.value)}
                    placeholder="Your Cohere API key"
                  />
                  <button 
                    className="test-btn"
                    onClick={() => handleTestConnection('cohere')}
                    disabled={!settings.cohere.apiKey}
                  >
                    Test
                  </button>
                </div>
                {testResults.cohere && (
                  <div className={`test-result ${testResults.cohere.success ? 'success' : 'error'}`}>
                    {testResults.cohere.testing ? 'Testing...' : testResults.cohere.message}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RAG Configuration */}
        <div className="settings-section">
          <div className="section-header">
            <h3>📚 RAG Engine Configuration</h3>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.rag.enabled}
                onChange={(e) => handleSettingChange('rag', 'enabled', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {settings.rag.enabled && (
            <div className="section-content">
              <div className="form-row">
                <div className="form-group">
                  <label>Chunk Size</label>
                  <input
                    type="number"
                    value={settings.rag.chunkSize}
                    onChange={(e) => handleSettingChange('rag', 'chunkSize', parseInt(e.target.value))}
                    min="500"
                    max="2000"
                  />
                </div>
                <div className="form-group">
                  <label>Chunk Overlap</label>
                  <input
                    type="number"
                    value={settings.rag.chunkOverlap}
                    onChange={(e) => handleSettingChange('rag', 'chunkOverlap', parseInt(e.target.value))}
                    min="0"
                    max="500"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Max Results</label>
                  <input
                    type="number"
                    value={settings.rag.maxResults}
                    onChange={(e) => handleSettingChange('rag', 'maxResults', parseInt(e.target.value))}
                    min="1"
                    max="20"
                  />
                </div>
                <div className="form-group">
                  <label>Similarity Threshold</label>
                  <input
                    type="range"
                    min="0.5"
                    max="1"
                    step="0.05"
                    value={settings.rag.threshold}
                    onChange={(e) => handleSettingChange('rag', 'threshold', parseFloat(e.target.value))}
                  />
                  <span className="range-value">{settings.rag.threshold}</span>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.rag.reranking}
                    onChange={(e) => handleSettingChange('rag', 'reranking', e.target.checked)}
                  />
                  Enable result reranking for improved relevance
                </label>
              </div>
            </div>
          )}
        </div>

        {/* MCP Configuration */}
        <div className="settings-section">
          <div className="section-header">
            <h3>🔧 MCP Tools Configuration</h3>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.mcp.enabled}
                onChange={(e) => handleSettingChange('mcp', 'enabled', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {settings.mcp.enabled && (
            <div className="section-content">
              <div className="tools-list">
                {Object.entries(settings.mcp.tools).map(([tool, enabled]) => (
                  <div key={tool} className="tool-item">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => handleSettingChange('mcp', 'tools', {
                          ...settings.mcp.tools,
                          [tool]: e.target.checked
                        })}
                      />
                      <div className="tool-info">
                        <span className="tool-name">{tool}</span>
                        <span className="tool-description">
                          {tool === 'regulatory-brain' && 'Advanced regulatory analysis and guidance'}
                          {tool === 'document-analyzer' && 'Deep document analysis and extraction'}
                          {tool === 'compliance-checker' && 'Automated compliance verification'}
                        </span>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Footer */}
      <div className="settings-footer">
        <div className="footer-info">
          <div className="info-item">
            <span className="info-icon">🔒</span>
            <span>All API keys are encrypted and stored locally</span>
          </div>
          <div className="info-item">
            <span className="info-icon">⚡</span>
            <span>Changes take effect immediately after saving</span>
          </div>
          <div className="info-item">
            <span className="info-icon">💡</span>
            <span>Test connections before saving to verify configuration</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISettings;