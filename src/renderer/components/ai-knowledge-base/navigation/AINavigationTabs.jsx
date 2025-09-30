import React from 'react';
import { performanceMonitor } from '../../../utils/performanceMonitor.js';

/**
 * AI Navigation Tabs - Modern tab interface for AI Knowledge Base sections
 */
const AINavigationTabs = ({ activeTab, onTabChange, aiStatus, showSetupGuide }) => {
  const tabs = [
    {
      id: 'chat',
      label: 'AI Assistant',
      icon: '💬',
      description: 'Conversational AI for regulatory queries and guidance',
      badge: aiStatus.services.free ? 'FREE' : aiStatus.services.openai || aiStatus.services.cohere ? 'AI' : null,
      disabled: false
    },
    {
      id: 'documents',
      label: 'Document Hub',
      icon: '📚',
      description: 'Upload, analyze, and search regulatory documents',
      badge: aiStatus.rag.initialized ? 'RAG' : null,
      disabled: false
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: '📊',
      description: 'Usage insights and performance metrics',
      badge: 'PRO',
      disabled: false
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      description: 'Configure AI models and system preferences',
      badge: null,
      disabled: false
    }
  ];

  // Add setup tab if needed
  if (showSetupGuide) {
    tabs.unshift({
      id: 'setup',
      label: 'Free AI Setup',
      icon: '🆓',
      description: 'Set up your free AI Knowledge Base',
      badge: 'NEW',
      disabled: false
    });
  }

  const handleTabClick = (tabId) => {
    if (tabs.find(tab => tab.id === tabId)?.disabled) return;
    
    performanceMonitor.markMilestone(`tab_click_${tabId}`);
    onTabChange(tabId);
  };

  return (
    <div className="ai-navigation-tabs">
      <div className="tabs-container">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${
              activeTab === tab.id ? 'active' : ''
            } ${tab.disabled ? 'disabled' : ''}`}
            onClick={() => handleTabClick(tab.id)}
            disabled={tab.disabled}
            title={tab.description}
          >
            <div className="tab-content">
              <span className="tab-icon">{tab.icon}</span>
              <div className="tab-text">
                <span className="tab-label">{tab.label}</span>
                <span className="tab-description">{tab.description}</span>
              </div>
              {tab.badge && (
                <span className={`tab-badge badge-${tab.badge.toLowerCase()}`}>
                  {tab.badge}
                </span>
              )}
            </div>
            
            {/* Active indicator */}
            {activeTab === tab.id && (
              <div className="tab-active-indicator"></div>
            )}
          </button>
        ))}
      </div>
      
      {/* Tab content preview */}
      <div className="tab-preview">
        {tabs.find(tab => tab.id === activeTab)?.description}
      </div>
    </div>
  );
};

export default AINavigationTabs;