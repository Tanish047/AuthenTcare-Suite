import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext.jsx';
import { performanceMonitor } from '../../utils/performanceMonitor.js';
import { telemetry } from '../../utils/telemetry.js';
import freeAIInitializer from '../../utils/initializeFreeAI.js';

// Import modular components
import AINavigationTabs from './navigation/AINavigationTabs.jsx';
import AIChatAssistant from './chat/AIChatAssistant.jsx';
import DocumentIntelligenceHub from './documents/DocumentIntelligenceHub.jsx';
import KnowledgeAnalytics from './analytics/KnowledgeAnalytics.jsx';
import AISettings from './settings/AISettings.jsx';
import FreeAISetupGuide from './setup/FreeAISetupGuide.jsx';
import LoadingOverlay from './common/LoadingOverlay.jsx';
import ErrorBoundary from '../ErrorBoundary.jsx';

/**
 * AI Knowledge Base Container - Main orchestrator for AI features
 * Provides a modern, segmented interface for AI-powered regulatory compliance
 */
const AIKnowledgeBaseContainer = () => {
  const { state, dispatch } = useAppContext();
  const [activeTab, setActiveTab] = useState('chat');
  const [isInitializing, setIsInitializing] = useState(true);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [aiStatus, setAiStatus] = useState({
    rag: { initialized: false, status: 'initializing' },
    mcp: { initialized: false, status: 'initializing' },
    services: { openai: false, cohere: false, pinecone: false, free: false }
  });

  // Performance tracking
  useEffect(() => {
    const timer = performanceMonitor.startTimer('ai_knowledge_base_init');
    
    return () => {
      timer.end({ activeTab });
    };
  }, [activeTab]);

  // Initialize AI services
  useEffect(() => {
    const initializeAIServices = async () => {
      try {
        performanceMonitor.markMilestone('ai_services_init_start');
        
        // Initialize Free AI Services first
        console.log('🆓 Initializing Free AI Services...');
        const freeAIResult = await freeAIInitializer.initialize();
        
        if (freeAIResult.success) {
          setAiStatus(prev => ({
            ...prev,
            rag: { initialized: true, status: 'ready' },
            mcp: { initialized: true, status: 'ready' },
            services: { 
              openai: false, 
              cohere: false, 
              local: true,
              free: true
            }
          }));
          
          console.log('✅ Free AI services initialized successfully');
        } else {
          console.log('⚠️ Free AI services not available, trying paid services...');
          
          // Show setup guide if free AI is not working
          setShowSetupGuide(true);
          
          // Fallback to paid services if available
          const ragResult = await window.electronAPI?.ragAPI?.initialize();
          if (ragResult?.success) {
            setAiStatus(prev => ({
              ...prev,
              rag: { initialized: true, status: 'ready' }
            }));
          }

          const mcpResult = await window.electronAPI?.mcpAPI?.initialize();
          if (mcpResult?.success) {
            setAiStatus(prev => ({
              ...prev,
              mcp: { initialized: true, status: 'ready' }
            }));
          }

          // Get AI services status
          const ragStatus = await window.electronAPI?.ragAPI?.getStatus();
          if (ragStatus?.aiServicesAvailable) {
            setAiStatus(prev => ({
              ...prev,
              services: ragStatus.aiServicesAvailable
            }));
          }
        }

        performanceMonitor.markMilestone('ai_services_init_complete');
        setIsInitializing(false);
        
        await telemetry.logEvent('ai_knowledge_base', 'initialized', {
          freeAI: freeAIResult.success,
          ragInitialized: true,
          mcpInitialized: true,
          serviceType: freeAIResult.success ? 'free' : 'paid'
        });
        
      } catch (error) {
        console.error('Failed to initialize AI services:', error);
        await telemetry.logError('ai_initialization_failed', {
          error: error.message,
          stack: error.stack
        });
        setIsInitializing(false);
      }
    };

    initializeAIServices();
  }, []);

  // Handle tab changes
  const handleTabChange = (tabId) => {
    performanceMonitor.markMilestone(`ai_tab_switch_${tabId}`);
    setActiveTab(tabId);
    
    telemetry.logEvent('ai_knowledge_base', 'tab_changed', {
      from: activeTab,
      to: tabId
    });
  };

  // Render active component based on tab
  const renderActiveComponent = () => {
    const commonProps = {
      aiStatus,
      onStatusUpdate: setAiStatus
    };

    switch (activeTab) {
      case 'chat':
        return (
          <ErrorBoundary>
            <AIChatAssistant {...commonProps} />
          </ErrorBoundary>
        );
      case 'documents':
        return (
          <ErrorBoundary>
            <DocumentIntelligenceHub {...commonProps} />
          </ErrorBoundary>
        );
      case 'analytics':
        return (
          <ErrorBoundary>
            <KnowledgeAnalytics {...commonProps} />
          </ErrorBoundary>
        );
      case 'settings':
        return (
          <ErrorBoundary>
            <AISettings {...commonProps} />
          </ErrorBoundary>
        );
      case 'setup':
        return (
          <ErrorBoundary>
            <FreeAISetupGuide 
              onComplete={() => {
                setShowSetupGuide(false);
                setActiveTab('chat');
              }}
            />
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary>
            <AIChatAssistant {...commonProps} />
          </ErrorBoundary>
        );
    }
  };

  if (isInitializing) {
    return (
      <LoadingOverlay 
        message="Initializing AI Knowledge Base..."
        details={[
          `RAG Engine: ${aiStatus.rag.status}`,
          `MCP Engine: ${aiStatus.mcp.status}`,
          `AI Services: ${Object.values(aiStatus.services).filter(Boolean).length}/3 ready`
        ]}
      />
    );
  }

  return (
    <div className="ai-knowledge-base-container">
      {/* Header with navigation */}
      <div className="ai-kb-header">
        <div className="ai-kb-title-section">
          <h1 className="ai-kb-title">
            <span className="ai-kb-icon">🤖</span>
            AI Knowledge Base
          </h1>
          <p className="ai-kb-subtitle">
            Advanced AI-powered regulatory intelligence and document analysis
          </p>
        </div>
        
        {/* AI Status Indicators */}
        <div className="ai-status-indicators">
          <div className={`status-indicator ${aiStatus.rag.initialized ? 'active' : 'inactive'}`}>
            <span className="status-dot"></span>
            RAG Engine
          </div>
          <div className={`status-indicator ${aiStatus.mcp.initialized ? 'active' : 'inactive'}`}>
            <span className="status-dot"></span>
            MCP Engine
          </div>
          <div className={`status-indicator ${Object.values(aiStatus.services).some(Boolean) ? 'active' : 'inactive'}`}>
            <span className="status-dot"></span>
            AI Services
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <AINavigationTabs 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        aiStatus={aiStatus}
        showSetupGuide={showSetupGuide}
      />

      {/* Main Content Area */}
      <div className="ai-kb-content">
        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default AIKnowledgeBaseContainer;