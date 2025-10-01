import React, { useState, useEffect } from 'react';

/**
 * Smart Model Selector with Auto Mode (like Cursor)
 * Automatically selects the best model based on query complexity
 */
const ModelSelector = React.forwardRef(({ selectedModel, onModelChange, className = '' }, ref) => {
  const [availableModels, setAvailableModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoMode, setAutoMode] = useState(true);

  // Model configurations with performance characteristics
  const modelConfigs = {
    auto: {
      name: 'Auto',
      icon: '🤖',
      description: 'Automatically selects the best model for your query',
      speed: 'Smart',
      quality: 'Optimal',
      size: 'Adaptive',
      color: '#10b981',
      isAuto: true,
    },
    'phi3:mini': {
      name: 'Phi-3 Mini',
      icon: '⚡',
      description: 'Fastest responses, great for quick questions',
      speed: 'Very Fast (~15s)',
      quality: 'Good',
      size: '2.2GB',
      color: '#3b82f6',
      bestFor: ['Quick questions', 'Simple tasks', 'Fast responses'],
    },
    'mistral:7b': {
      name: 'Mistral 7B',
      icon: '🚀',
      description: 'Balanced speed and quality, excellent for most tasks',
      speed: 'Fast (~20s)',
      quality: 'Very Good',
      size: '4.4GB',
      color: '#8b5cf6',
      bestFor: ['General questions', 'Regulatory advice', 'Balanced performance'],
    },
    'qwen2:7b': {
      name: 'Qwen2 7B',
      icon: '🧠',
      description: 'Great for technical content and detailed analysis',
      speed: 'Fast (~22s)',
      quality: 'Very Good',
      size: '4.4GB',
      color: '#f59e0b',
      bestFor: ['Technical questions', 'Document analysis', 'Detailed explanations'],
    },
    'llama3.1:8b': {
      name: 'Llama 3.1 8B',
      icon: '🦙',
      description: 'High quality responses, good reasoning',
      speed: 'Medium (~25s)',
      quality: 'Excellent',
      size: '4.9GB',
      color: '#ef4444',
      bestFor: ['Complex questions', 'Reasoning tasks', 'High-quality responses'],
    },

  };

  useEffect(() => {
    checkAvailableModels();
  }, []);

  const checkAvailableModels = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      if (response.ok) {
        const data = await response.json();
        const models = data.models?.map(m => m.name) || [];

        // Add auto mode and filter available models
        const available = ['auto', ...models.filter(model => modelConfigs[model])];
        setAvailableModels(available);

        // Set default to auto if not already selected
        if (!selectedModel || !available.includes(selectedModel)) {
          onModelChange('auto');
        }
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
      // Fallback to basic models
      setAvailableModels(['auto', 'phi3:mini']);
    }
    setIsLoading(false);
  };

  // Auto model selection logic (like Cursor)
  const selectBestModel = (query = '') => {
    if (!query) return 'phi3:mini'; // Default for empty queries

    const queryLower = query.toLowerCase();
    const queryLength = query.length;
    const wordCount = query.split(' ').length;

    // Complex reasoning indicators
    const complexKeywords = [
      'analyze',
      'compare',
      'evaluate',
      'explain in detail',
      'comprehensive',
      'step by step',
      'pros and cons',
      'advantages and disadvantages',
      'complex',
      'detailed analysis',
      'research',
      'thorough',
    ];

    // Technical content indicators
    const technicalKeywords = [
      'technical',
      'specification',
      'implementation',
      'architecture',
      'algorithm',
      'code',
      'programming',
      'development',
      'engineering',
    ];

    // Regulatory/compliance indicators
    const regulatoryKeywords = [
      'fda',
      'regulation',
      'compliance',
      'iso',
      'standard',
      'requirement',
      'guideline',
      'approval',
      'submission',
      'validation',
      'audit',
    ];

    // Quick question indicators
    const quickKeywords = [
      'what is',
      'define',
      'quick',
      'simple',
      'brief',
      'short answer',
      'yes or no',
      'true or false',
      'list',
      'name',
    ];

    const hasComplexKeywords = complexKeywords.some(keyword => queryLower.includes(keyword));
    const hasTechnicalKeywords = technicalKeywords.some(keyword => queryLower.includes(keyword));
    const hasRegulatoryKeywords = regulatoryKeywords.some(keyword => queryLower.includes(keyword));
    const hasQuickKeywords = quickKeywords.some(keyword => queryLower.includes(keyword));

    // Decision logic
    if (hasQuickKeywords || (queryLength < 50 && wordCount < 10)) {
      return 'phi3:mini'; // Fast for simple questions
    }

    if (hasComplexKeywords || queryLength > 200 || wordCount > 40) {
      // Use most powerful available model for complex queries
      if (availableModels.includes('llama3.1:8b')) return 'llama3.1:8b';
      if (availableModels.includes('mistral:7b')) return 'mistral:7b';
    }

    if (hasTechnicalKeywords) {
      return availableModels.includes('qwen2:7b') ? 'qwen2:7b' : 'mistral:7b';
    }

    if (hasRegulatoryKeywords) {
      return availableModels.includes('mistral:7b') ? 'mistral:7b' : 'llama3.1:8b';
    }

    // Default balanced choice
    return availableModels.includes('mistral:7b') ? 'mistral:7b' : 'phi3:mini';
  };

  const handleModelSelect = modelId => {
    if (modelId === 'auto') {
      setAutoMode(true);
    } else {
      setAutoMode(false);
    }
    onModelChange(modelId);
  };

  // Get the actual model that would be used in auto mode
  const getAutoSelectedModel = (query = '') => {
    return selectedModel === 'auto' ? selectBestModel(query) : selectedModel;
  };

  // Expose the auto selection function for parent components
  React.useImperativeHandle(ref, () => ({
    selectBestModel,
    getAutoSelectedModel,
  }));

  if (isLoading) {
    return (
      <div className={`model-selector loading ${className}`}>
        <div className="loading-spinner">⏳</div>
        <span>Loading models...</span>
      </div>
    );
  }

  return (
    <div className={`model-selector ${className}`}>
      <div className="model-selector-header">
        <h4>🤖 AI Model</h4>
        <button
          className="refresh-btn"
          onClick={checkAvailableModels}
          title="Refresh available models"
        >
          🔄
        </button>
      </div>

      <div className="model-grid">
        {availableModels.map(modelId => {
          const config = modelConfigs[modelId];
          if (!config) return null;

          const isSelected = selectedModel === modelId;

          return (
            <div
              key={modelId}
              className={`model-card ${isSelected ? 'selected' : ''} ${config.isAuto ? 'auto-mode' : ''}`}
              onClick={() => handleModelSelect(modelId)}
              style={{ '--model-color': config.color }}
            >
              <div className="model-header">
                <span className="model-icon">{config.icon}</span>
                <div className="model-info">
                  <h5 className="model-name">{config.name}</h5>
                  {config.isAuto && <span className="auto-badge">Smart Selection</span>}
                </div>
                {isSelected && <span className="selected-indicator">✓</span>}
              </div>

              <p className="model-description">{config.description}</p>

              <div className="model-specs">
                <div className="spec-item">
                  <span className="spec-label">Speed:</span>
                  <span className="spec-value">{config.speed}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Quality:</span>
                  <span className="spec-value">{config.quality}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Size:</span>
                  <span className="spec-value">{config.size}</span>
                </div>
              </div>

              {config.bestFor && (
                <div className="best-for">
                  <span className="best-for-label">Best for:</span>
                  <ul className="best-for-list">
                    {config.bestFor.map((use, index) => (
                      <li key={index}>{use}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedModel === 'auto' && (
        <div className="auto-mode-info">
          <div className="auto-mode-header">
            <span className="auto-icon">🤖</span>
            <h5>Auto Mode Active</h5>
          </div>
          <p>
            I'll automatically choose the best model based on your question complexity. Simple
            questions use fast models, complex analysis uses powerful models.
          </p>
          <div className="auto-examples">
            <div className="example">
              <strong>Quick question:</strong> "What is FDA?" →{' '}
              <span className="model-tag phi3">Phi-3 Mini ⚡</span>
            </div>
            <div className="example">
              <strong>Regulatory advice:</strong> "510(k) requirements" →{' '}
              <span className="model-tag mistral">Mistral 7B 🚀</span>
            </div>
            <div className="example">
              <strong>Complex analysis:</strong> "Compare FDA vs EU regulations" →{' '}
              <span className="model-tag llama">Llama 3.1 🦙</span>
            </div>
          </div>
        </div>
      )}

      <div className="model-stats">
        <div className="stat">
          <span className="stat-value">{availableModels.length - 1}</span>
          <span className="stat-label">Models Available</span>
        </div>
        <div className="stat">
          <span className="stat-value">$0</span>
          <span className="stat-label">Monthly Cost</span>
        </div>
        <div className="stat">
          <span className="stat-value">∞</span>
          <span className="stat-label">Usage Limit</span>
        </div>
      </div>
    </div>
  );
});

export default ModelSelector;
