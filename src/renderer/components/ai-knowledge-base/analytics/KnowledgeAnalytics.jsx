import React, { useState, useEffect } from 'react';
import { performanceMonitor } from '../../../utils/performanceMonitor.js';
import { telemetry } from '../../../utils/telemetry.js';

// Import analytics components
import AnalyticsDashboard from './components/AnalyticsDashboard.jsx';
import UsageMetrics from './components/UsageMetrics.jsx';
import PerformanceInsights from './components/PerformanceInsights.jsx';
import DocumentInsights from './components/DocumentInsights.jsx';

/**
 * Knowledge Analytics - Insights and metrics for AI Knowledge Base
 */
const KnowledgeAnalytics = ({ aiStatus, onStatusUpdate }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [analyticsData, setAnalyticsData] = useState({
    usage: {
      totalQueries: 0,
      totalSessions: 0,
      avgResponseTime: 0,
      successRate: 0,
      topQueries: [],
      queryTrends: []
    },
    performance: {
      ragPerformance: {
        avgSearchTime: 0,
        avgRetrievalAccuracy: 0,
        indexEfficiency: 0
      },
      aiPerformance: {
        avgGenerationTime: 0,
        modelAccuracy: 0,
        tokenUsage: 0
      }
    },
    documents: {
      totalDocuments: 0,
      totalChunks: 0,
      mostReferencedDocs: [],
      documentTypes: {},
      knowledgeCoverage: {}
    },
    insights: {
      knowledgeGaps: [],
      popularTopics: [],
      userPatterns: [],
      recommendations: []
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); // 1d, 7d, 30d, 90d

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      const timer = performanceMonitor.startTimer('analytics_load');

      try {
        // Get usage analytics
        const usageData = await window.electronAPI?.analyticsAPI?.getUsageMetrics({
          timeRange,
          includeDetails: true
        });

        // Get performance metrics
        const performanceData = await window.electronAPI?.analyticsAPI?.getPerformanceMetrics({
          timeRange
        });

        // Get document analytics
        const documentData = await window.electronAPI?.ragAPI?.getAnalytics({
          timeRange
        });

        // Get AI insights
        const insightsData = await window.electronAPI?.analyticsAPI?.getInsights({
          timeRange
        });

        setAnalyticsData({
          usage: usageData?.data || analyticsData.usage,
          performance: performanceData?.data || analyticsData.performance,
          documents: documentData?.data || analyticsData.documents,
          insights: insightsData?.data || analyticsData.insights
        });

        await telemetry.logEvent('knowledge_analytics', 'data_loaded', {
          timeRange,
          loadTime: timer.end()
        });

      } catch (error) {
        console.error('Failed to load analytics:', error);
        await telemetry.logError('analytics_load_failed', {
          error: error.message,
          timeRange
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [timeRange]);

  // Analytics views
  const views = [
    { 
      id: 'dashboard', 
      label: 'Overview', 
      icon: '📊', 
      description: 'High-level metrics and KPIs' 
    },
    { 
      id: 'usage', 
      label: 'Usage Metrics', 
      icon: '📈', 
      description: 'User interaction and query analytics' 
    },
    { 
      id: 'performance', 
      label: 'Performance', 
      icon: '⚡', 
      description: 'System performance and optimization insights' 
    },
    { 
      id: 'documents', 
      label: 'Document Insights', 
      icon: '📚', 
      description: 'Document usage and knowledge coverage' 
    }
  ];

  // Time range options
  const timeRanges = [
    { value: '1d', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  // Render active view
  const renderActiveView = () => {
    const commonProps = {
      analyticsData,
      timeRange,
      isLoading,
      aiStatus
    };

    switch (activeView) {
      case 'dashboard':
        return <AnalyticsDashboard {...commonProps} />;
      case 'usage':
        return <UsageMetrics {...commonProps} />;
      case 'performance':
        return <PerformanceInsights {...commonProps} />;
      case 'documents':
        return <DocumentInsights {...commonProps} />;
      default:
        return <AnalyticsDashboard {...commonProps} />;
    }
  };

  // Export analytics data
  const handleExportData = async () => {
    try {
      const exportData = {
        timestamp: new Date().toISOString(),
        timeRange,
        analytics: analyticsData
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `knowledge-analytics-${timeRange}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      await telemetry.logEvent('knowledge_analytics', 'data_exported', {
        timeRange,
        dataSize: blob.size
      });

    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="knowledge-analytics">
      {/* Analytics Header */}
      <div className="analytics-header">
        <div className="header-content">
          <h2>Knowledge Analytics</h2>
          <p>Insights and performance metrics for your AI Knowledge Base</p>
        </div>

        {/* Header Controls */}
        <div className="header-controls">
          {/* Time Range Selector */}
          <div className="time-range-selector">
            <label>Time Range:</label>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="time-range-select"
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Export Button */}
          <button 
            className="btn btn-secondary"
            onClick={handleExportData}
            disabled={isLoading}
          >
            📥 Export Data
          </button>

          {/* Refresh Button */}
          <button 
            className="btn btn-secondary"
            onClick={() => window.location.reload()}
            disabled={isLoading}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="analytics-navigation">
        <div className="nav-tabs">
          {views.map(view => (
            <button
              key={view.id}
              className={`nav-tab ${activeView === view.id ? 'active' : ''}`}
              onClick={() => setActiveView(view.id)}
              title={view.description}
            >
              <span className="tab-icon">{view.icon}</span>
              <span className="tab-label">{view.label}</span>
            </button>
          ))}
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="loading-indicator">
            <span className="loading-spinner">⏳</span>
            Loading analytics...
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="analytics-content">
        {renderActiveView()}
      </div>

      {/* Analytics Footer */}
      <div className="analytics-footer">
        <div className="footer-info">
          <span>Last updated: {new Date().toLocaleString()}</span>
          <span>Data retention: 90 days</span>
          <span>Privacy: All data processed locally</span>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeAnalytics;