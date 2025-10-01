import React from 'react';

/**
 * Quick Actions - Predefined prompts for common regulatory queries
 */
const QuickActions = ({ onActionClick }) => {
  const actionCategories = [
    {
      title: 'FDA Regulations',
      icon: '🏥',
      actions: [
        {
          id: 'fda-classification',
          title: 'Device Classification',
          description: 'Learn about FDA Class I, II, III classifications',
          icon: '🏷️',
        },
        {
          id: 'regulatory-pathway',
          title: 'Regulatory Pathways',
          description: '510(k), PMA, De Novo pathways explained',
          icon: '🛤️',
        },
      ],
    },
    {
      title: 'Quality Management',
      icon: '⚙️',
      actions: [
        {
          id: 'qms-requirements',
          title: 'QMS Requirements',
          description: 'ISO 13485 and FDA QSR overview',
          icon: '📋',
        },
        {
          id: 'clinical-trials',
          title: 'Clinical Trials',
          description: 'Clinical study requirements and design',
          icon: '🧪',
        },
      ],
    },
    {
      title: 'Compliance',
      icon: '✅',
      actions: [
        {
          id: 'labeling-requirements',
          title: 'Labeling Requirements',
          description: 'FDA labeling and IFU requirements',
          icon: '🏷️',
        },
        {
          id: 'post-market',
          title: 'Post-Market Surveillance',
          description: 'MDR, adverse event reporting, recalls',
          icon: '📊',
        },
      ],
    },
  ];

  return (
    <div className="quick-actions">
      <div className="quick-actions-header">
        <h3>Quick Actions</h3>
        <p>Get instant answers to common regulatory questions</p>
      </div>

      <div className="actions-grid">
        {actionCategories.map(category => (
          <div key={category.title} className="action-category">
            <div className="category-header">
              <span className="category-icon">{category.icon}</span>
              <h4 className="category-title">{category.title}</h4>
            </div>

            <div className="category-actions">
              {category.actions.map(action => (
                <button
                  key={action.id}
                  className="action-button"
                  onClick={() => onActionClick(action.id)}
                  title={action.description}
                >
                  <div className="action-content">
                    <span className="action-icon">{action.icon}</span>
                    <div className="action-text">
                      <span className="action-title">{action.title}</span>
                      <span className="action-description">{action.description}</span>
                    </div>
                  </div>
                  <span className="action-arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Query Prompt */}
      <div className="custom-query-prompt">
        <div className="prompt-content">
          <span className="prompt-icon">💡</span>
          <div className="prompt-text">
            <strong>Have a specific question?</strong>
            <p>
              Type your regulatory compliance question in the chat below for personalized
              assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
