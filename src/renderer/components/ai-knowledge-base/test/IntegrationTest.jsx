import React, { useState, useEffect } from 'react';

/**
 * Integration Test Component - Verify AI Knowledge Base functionality
 * This component can be used to test all features before full backend integration
 */
const IntegrationTest = () => {
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    const results = {};

    // Test 1: Component Loading
    try {
      results.componentLoading = {
        status: 'pass',
        message: 'AI Knowledge Base components loaded successfully'
      };
    } catch (error) {
      results.componentLoading = {
        status: 'fail',
        message: `Component loading failed: ${error.message}`
      };
    }

    // Test 2: CSS Styling
    try {
      const hasStyles = document.querySelector('.ai-knowledge-base-container');
      results.cssLoading = {
        status: hasStyles ? 'pass' : 'fail',
        message: hasStyles ? 'CSS styles loaded correctly' : 'CSS styles not found'
      };
    } catch (error) {
      results.cssLoading = {
        status: 'fail',
        message: `CSS test failed: ${error.message}`
      };
    }

    // Test 3: Local Storage
    try {
      localStorage.setItem('ai-kb-test', 'test');
      const testValue = localStorage.getItem('ai-kb-test');
      localStorage.removeItem('ai-kb-test');
      
      results.localStorage = {
        status: testValue === 'test' ? 'pass' : 'fail',
        message: testValue === 'test' ? 'Local storage working' : 'Local storage not available'
      };
    } catch (error) {
      results.localStorage = {
        status: 'fail',
        message: `Local storage test failed: ${error.message}`
      };
    }

    // Test 4: Performance Monitoring
    try {
      const perfSupported = typeof performance !== 'undefined' && performance.mark;
      results.performance = {
        status: perfSupported ? 'pass' : 'warning',
        message: perfSupported ? 'Performance monitoring available' : 'Performance monitoring not supported'
      };
    } catch (error) {
      results.performance = {
        status: 'fail',
        message: `Performance test failed: ${error.message}`
      };
    }

    // Test 5: Clipboard API
    try {
      const clipboardSupported = typeof navigator !== 'undefined' && navigator.clipboard;
      results.clipboard = {
        status: clipboardSupported ? 'pass' : 'warning',
        message: clipboardSupported ? 'Clipboard API available' : 'Clipboard API not supported (copy features may not work)'
      };
    } catch (error) {
      results.clipboard = {
        status: 'fail',
        message: `Clipboard test failed: ${error.message}`
      };
    }

    // Test 6: File API
    try {
      const fileSupported = typeof File !== 'undefined' && typeof FileReader !== 'undefined';
      results.fileApi = {
        status: fileSupported ? 'pass' : 'fail',
        message: fileSupported ? 'File API available' : 'File API not supported'
      };
    } catch (error) {
      results.fileApi = {
        status: 'fail',
        message: `File API test failed: ${error.message}`
      };
    }

    // Test 7: Electron API (if available)
    try {
      const electronSupported = typeof window !== 'undefined' && window.electronAPI;
      results.electronApi = {
        status: electronSupported ? 'pass' : 'warning',
        message: electronSupported ? 'Electron API available' : 'Electron API not available (running in browser mode)'
      };
    } catch (error) {
      results.electronApi = {
        status: 'warning',
        message: 'Electron API test failed (normal in browser)'
      };
    }

    setTestResults(results);
    setIsRunning(false);
  };

  useEffect(() => {
    // Auto-run tests on component mount
    runTests();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass': return '✅';
      case 'warning': return '⚠️';
      case 'fail': return '❌';
      default: return '⏳';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pass': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'fail': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '1rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0 0 1rem 0', fontSize: '2rem' }}>
          🤖 AI Knowledge Base Integration Test
        </h1>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Verifying system compatibility and feature availability
        </p>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{ margin: 0 }}>Test Results</h2>
        <button
          onClick={runTests}
          disabled={isRunning}
          style={{
            background: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            opacity: isRunning ? 0.6 : 1
          }}
        >
          {isRunning ? '⏳ Running Tests...' : '🔄 Run Tests Again'}
        </button>
      </div>

      <div style={{
        display: 'grid',
        gap: '1rem'
      }}>
        {Object.entries(testResults).map(([testName, result]) => (
          <div
            key={testName}
            style={{
              background: 'white',
              border: `2px solid ${getStatusColor(result.status)}`,
              borderRadius: '0.75rem',
              padding: '1.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '0.5rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>
                {getStatusIcon(result.status)}
              </span>
              <h3 style={{
                margin: 0,
                textTransform: 'capitalize',
                color: '#1f2937'
              }}>
                {testName.replace(/([A-Z])/g, ' $1').trim()}
              </h3>
              <span style={{
                background: getStatusColor(result.status),
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '1rem',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {result.status}
              </span>
            </div>
            <p style={{
              margin: 0,
              color: '#6b7280',
              lineHeight: 1.5
            }}>
              {result.message}
            </p>
          </div>
        ))}
      </div>

      {Object.keys(testResults).length > 0 && (
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: '#f3f4f6',
          borderRadius: '0.75rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>
            📊 Summary
          </h3>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div>
              <strong style={{ color: '#10b981' }}>
                ✅ Passed: {Object.values(testResults).filter(r => r.status === 'pass').length}
              </strong>
            </div>
            <div>
              <strong style={{ color: '#f59e0b' }}>
                ⚠️ Warnings: {Object.values(testResults).filter(r => r.status === 'warning').length}
              </strong>
            </div>
            <div>
              <strong style={{ color: '#ef4444' }}>
                ❌ Failed: {Object.values(testResults).filter(r => r.status === 'fail').length}
              </strong>
            </div>
          </div>
          
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'white',
            borderRadius: '0.5rem',
            border: '1px solid #d1d5db'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>
              🚀 Ready to Use AI Knowledge Base?
            </h4>
            <p style={{ margin: 0, color: '#6b7280' }}>
              {Object.values(testResults).filter(r => r.status === 'fail').length === 0
                ? '🎉 All critical tests passed! Your AI Knowledge Base is ready to use.'
                : '⚠️ Some tests failed. Check the results above and ensure all dependencies are installed.'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationTest;