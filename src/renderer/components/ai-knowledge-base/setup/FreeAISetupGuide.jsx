import React, { useState, useEffect } from 'react';
import freeAIInitializer from '../../../utils/initializeFreeAI.js';

/**
 * Free AI Setup Guide - Helps users verify and optimize their free AI setup
 */
const FreeAISetupGuide = ({ onComplete }) => {
  const [setupStatus, setSetupStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    setIsChecking(true);
    try {
      const status = await freeAIInitializer.initialize();
      setSetupStatus(status);
      
      // Test AI response
      await testAIResponse();
    } catch (error) {
      console.error('Setup check failed:', error);
    }
    setIsChecking(false);
  };

  const testAIResponse = async () => {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'phi3:mini',
          prompt: 'What is FDA?',
          stream: false,
          options: { num_predict: 50 }
        }),
        signal: AbortSignal.timeout(15000)
      });

      const result = await response.json();
      setTestResults({
        working: !!result.response,
        response: result.response?.substring(0, 100) + '...',
        model: 'phi3:mini'
      });
    } catch (error) {
      setTestResults({
        working: false,
        error: error.message
      });
    }
  };

  if (isChecking) {
    return (
      <div className="setup-loading">
        <div className="loading-spinner">⏳</div>
        <h3>Checking Your Free AI Setup...</h3>
        <p>Verifying Ollama and models...</p>
      </div>
    );
  }

  const isReady = setupStatus?.success && testResults.working;

  return (
    <div className="free-ai-setup-guide">
      {/* Status Header */}
      <div className="setup-header">
        <h2>🆓 Free AI Knowledge Base</h2>
        
        {isReady ? (
          <div className="setup-success">
            <span className="success-icon">🎉</span>
            <div className="success-content">
              <h3>Your Free AI is Ready!</h3>
              <p>Unlimited AI queries with zero monthly costs</p>
              <button className="btn btn-primary" onClick={onComplete}>
                Start Using Free AI →
              </button>
            </div>
          </div>
        ) : (
          <div className="setup-pending">
            <span className="pending-icon">⚙️</span>
            <div className="pending-content">
              <h3>Setup Status</h3>
              <p>Let's get your free AI working perfectly</p>
            </div>
          </div>
        )}
      </div>

      {/* Current Status */}
      <div className="status-grid">
        <div className="status-card">
          <h4>🤖 AI Service</h4>
          <div className={`status-indicator ${setupStatus?.success ? 'success' : 'warning'}`}>
            {setupStatus?.success ? '✅ Ollama Running' : '⚠️ Ollama Issue'}
          </div>
          <p>{setupStatus?.message || 'Checking Ollama service...'}</p>
        </div>

        <div className="status-card">
          <h4>🧠 AI Model</h4>
          <div className={`status-indicator ${testResults.working ? 'success' : 'warning'}`}>
            {testResults.working ? '✅ Model Working' : '⚠️ Model Issue'}
          </div>
          <p>{testResults.working ? `Using ${testResults.model}` : 'Testing models...'}</p>
        </div>

        <div className="status-card">
          <h4>💰 Cost</h4>
          <div className="status-indicator success">
            ✅ $0/month
          </div>
          <p>Unlimited usage, no API fees</p>
        </div>
      </div>

      {/* Test Results */}
      {testResults.working && (
        <div className="test-results">
          <h3>🧪 AI Test Results</h3>
          <div className="test-response">
            <strong>Test Question:</strong> "What is FDA?"<br/>
            <strong>AI Response:</strong> "{testResults.response}"
          </div>
          <div className="test-metrics">
            <span>✅ Response received</span>
            <span>🚀 Model: {testResults.model}</span>
            <span>💡 Ready for regulatory questions</span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>🚀 Quick Actions</h3>
        <div className="action-buttons">
          <button 
            className="btn btn-secondary"
            onClick={checkSetupStatus}
            disabled={isChecking}
          >
            {isChecking ? '⏳ Checking...' : '🔄 Refresh Status'}
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={testAIResponse}
            disabled={isChecking}
          >
            🧪 Test AI Response
          </button>

          {isReady && (
            <button 
              className="btn btn-primary"
              onClick={onComplete}
            >
              ✨ Start Using AI
            </button>
          )}
        </div>
      </div>

      {/* Optimization Tips */}
      <div className="optimization-tips">
        <h3>💡 Optimization Tips</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <h4>🏃‍♂️ Speed</h4>
            <p>phi3:mini is your fastest model (~15s responses)</p>
          </div>
          <div className="tip-card">
            <h4>🧠 Quality</h4>
            <p>llama3.1:8b for better responses (slower)</p>
          </div>
          <div className="tip-card">
            <h4>📚 Storage</h4>
            <p>Add ChromaDB for unlimited document storage</p>
          </div>
        </div>
      </div>

      {/* Troubleshooting */}
      {!isReady && (
        <div className="troubleshooting">
          <h3>🔧 Troubleshooting</h3>
          <div className="troubleshoot-steps">
            <div className="step">
              <strong>1. Check Ollama is running:</strong>
              <code>ollama serve</code>
            </div>
            <div className="step">
              <strong>2. Verify models are installed:</strong>
              <code>ollama list</code>
            </div>
            <div className="step">
              <strong>3. Test model directly:</strong>
              <code>ollama run phi3:mini "Hello"</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreeAISetupGuide;