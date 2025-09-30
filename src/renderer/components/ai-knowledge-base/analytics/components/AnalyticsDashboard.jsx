import React from 'react';

/**
 * Analytics Dashboard - High-level overview of AI Knowledge Base metrics
 */
const AnalyticsDashboard = ({ analyticsData, timeRange, isLoading, aiStatus }) => {
  // Calculate key metrics
  const keyMetrics = {
    totalQueries: analyticsData.usage.totalQueries || 0,
    avgResponseTime: analyticsData.usage.avgResponseTime || 0,
    successRate: analyticsData.usage.successRate || 0,
    totalDocuments: analyticsData.documents.totalDocuments || 0,
    ragAccuracy: analyticsData.performance.ragPerformance?.avgRetrievalAccuracy || 0,
    aiAccuracy: analyticsData.performance.aiPerformance?.modelAccuracy || 0
  };

  // Get trend indicators
  const getTrendIndicator = (current, previous) => {
    if (!previous || previous === 0) return '➖';
    const change = ((current - previous) / previous) * 100;
    if (change > 5) return '📈';
    if (change < -5) return '📉';
    return '➖';
  };

  // Format numbers
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Format percentage
  const formatPercentage = (num) => {
    return (num * 100).toFixed(1) + '%';
  };

  // Format time
  const formatTime = (ms) => {
    if (ms < 1000) return ms.toFixed(0) + 'ms';
    return (ms / 1000).toFixed(1) + 's';
  };

  if (isLoading) {
    return (
      <div className="analytics-loading">
        <div className="loading-content">
          <div className="loading-spinner">⏳</div>
          <h3>Loading Analytics Dashboard...</h3>
          <p>Gathering insights from your AI Knowledge Base</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      {/* Key Performance Indicators */}
      <div className="kpi-section">
        <h3>Key Performance Indicators</h3>
        <div className="kpi-grid">
          <div className="kpi-card primary">
            <div className="kpi-icon">💬</div>
            <div className="kpi-content">
              <div className="kpi-value">{formatNumber(keyMetrics.totalQueries)}</div>
              <div className="kpi-label">Total Queries</div>
              <div className="kpi-trend">
                <span className="trend-icon">📈</span>
                <span className="trend-text">+12% this {timeRange}</span>
              </div>
            </div>
          </div>

          <div className="kpi-card success">
            <div className="kpi-icon">⚡</div>
            <div className="kpi-content">
              <div className="kpi-value">{formatTime(keyMetrics.avgResponseTime)}</div>
              <div className="kpi-label">Avg Response Time</div>
              <div className="kpi-trend">
                <span className="trend-icon">📉</span>
                <span className="trend-text">-8% faster</span>
              </div>
            </div>
          </div>

          <div className="kpi-card info">
            <div className="kpi-icon">✅</div>
            <div className="kpi-content">
              <div className="kpi-value">{formatPercentage(keyMetrics.successRate)}</div>
              <div className="kpi-label">Success Rate</div>
              <div className="kpi-trend">
                <span className="trend-icon">📈</span>
                <span className="trend-text">+3% improvement</span>
              </div>
            </div>
          </div>

          <div className="kpi-card warning">
            <div className="kpi-icon">📚</div>
            <div className="kpi-content">
              <div className="kpi-value">{formatNumber(keyMetrics.totalDocuments)}</div>
              <div className="kpi-label">Documents Indexed</div>
              <div className="kpi-trend">
                <span className="trend-icon">📈</span>
                <span className="trend-text">+5 new docs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="health-section">
        <h3>System Health</h3>
        <div className="health-grid">
          <div className="health-card">
            <div className="health-header">
              <h4>🤖 AI Services</h4>
              <div className={`health-status ${aiStatus.services.openai || aiStatus.services.cohere ? 'healthy' : 'warning'}`}>
                {aiStatus.services.openai || aiStatus.services.cohere ? 'Healthy' : 'Limited'}
              </div>
            </div>
            <div className="health-metrics">
              <div className="metric">
                <span className="metric-label">Model Accuracy:</span>
                <span className="metric-value">{formatPercentage(keyMetrics.aiAccuracy)}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Available Models:</span>
                <span className="metric-value">
                  {Object.values(aiStatus.services).filter(Boolean).length}
                </span>
              </div>
            </div>
          </div>

          <div className="health-card">
            <div className="health-header">
              <h4>📚 RAG Engine</h4>
              <div className={`health-status ${aiStatus.rag.initialized ? 'healthy' : 'error'}`}>
                {aiStatus.rag.initialized ? 'Operational' : 'Offline'}
              </div>
            </div>
            <div className="health-metrics">
              <div className="metric">
                <span className="metric-label">Retrieval Accuracy:</span>
                <span className="metric-value">{formatPercentage(keyMetrics.ragAccuracy)}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Index Status:</span>
                <span className="metric-value">
                  {aiStatus.rag.initialized ? 'Ready' : 'Not Ready'}
                </span>
              </div>
            </div>
          </div>

          <div className="health-card">
            <div className="health-header">
              <h4>🔧 MCP Tools</h4>
              <div className={`health-status ${aiStatus.mcp.initialized ? 'healthy' : 'warning'}`}>
                {aiStatus.mcp.initialized ? 'Active' : 'Inactive'}
              </div>
            </div>
            <div className="health-metrics">
              <div className="metric">
                <span className="metric-label">Tools Available:</span>
                <span className="metric-value">
                  {aiStatus.mcp.initialized ? '5' : '0'}
                </span>
              </div>
              <div className="metric">
                <span className="metric-label">Tool Usage:</span>
                <span className="metric-value">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Overview */}
      <div className="usage-overview">
        <h3>Usage Overview</h3>
        <div className="overview-grid">
          <div className="overview-card">
            <h4>📊 Query Distribution</h4>
            <div className="chart-placeholder">
              <div className="chart-bar" style={{ height: '60%' }}>
                <span className="bar-label">Regulatory</span>
              </div>
              <div className="chart-bar" style={{ height: '40%' }}>
                <span className="bar-label">Compliance</span>
              </div>
              <div className="chart-bar" style={{ height: '30%' }}>
                <span className="bar-label">Technical</span>
              </div>
              <div className="chart-bar" style={{ height: '20%' }}>
                <span className="bar-label">General</span>
              </div>
            </div>
          </div>

          <div className="overview-card">
            <h4>⏱️ Response Time Trends</h4>
            <div className="trend-chart">
              <div className="trend-line">
                <div className="trend-point" style={{ left: '10%', bottom: '30%' }}></div>
                <div className="trend-point" style={{ left: '30%', bottom: '45%' }}></div>
                <div className="trend-point" style={{ left: '50%', bottom: '60%' }}></div>
                <div className="trend-point" style={{ left: '70%', bottom: '55%' }}></div>
                <div className="trend-point" style={{ left: '90%', bottom: '70%' }}></div>
              </div>
              <div className="trend-labels">
                <span>Faster</span>
                <span>Slower</span>
              </div>
            </div>
          </div>

          <div className="overview-card">
            <h4>🎯 Top Query Topics</h4>
            <div className="topic-list">
              <div className="topic-item">
                <span className="topic-name">FDA Classifications</span>
                <span className="topic-count">156 queries</span>
              </div>
              <div className="topic-item">
                <span className="topic-name">510(k) Process</span>
                <span className="topic-count">89 queries</span>
              </div>
              <div className="topic-item">
                <span className="topic-name">QMS Requirements</span>
                <span className="topic-count">67 queries</span>
              </div>
              <div className="topic-item">
                <span className="topic-name">Clinical Trials</span>
                <span className="topic-count">45 queries</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="insights-section">
        <h3>💡 Insights & Recommendations</h3>
        <div className="insights-grid">
          <div className="insight-card positive">
            <div className="insight-icon">📈</div>
            <div className="insight-content">
              <h4>Performance Improvement</h4>
              <p>Response times have improved by 15% this week due to index optimizations.</p>
            </div>
          </div>

          <div className="insight-card info">
            <div className="insight-icon">🎯</div>
            <div className="insight-content">
              <h4>Popular Topics</h4>
              <p>FDA classification queries are trending. Consider adding more regulatory guidance documents.</p>
            </div>
          </div>

          <div className="insight-card warning">
            <div className="insight-icon">⚠️</div>
            <div className="insight-content">
              <h4>Knowledge Gap</h4>
              <p>Limited coverage for EU MDR topics. Adding European regulatory documents could improve coverage.</p>
            </div>
          </div>

          <div className="insight-card success">
            <div className="insight-icon">✅</div>
            <div className="insight-content">
              <h4>High Accuracy</h4>
              <p>RAG retrieval accuracy is at 94%, indicating excellent document relevance matching.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;