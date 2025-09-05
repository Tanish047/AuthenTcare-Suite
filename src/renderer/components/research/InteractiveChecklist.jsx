import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext.jsx';

const InteractiveChecklist = ({ 
  selectedMarket, 
  selectedLicense,
  onProgressUpdate 
}) => {
  const { state, dispatch } = useAppContext();
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customItemTitle, setCustomItemTitle] = useState('');
  const [customItemDescription, setCustomItemDescription] = useState('');

  // Default checklist items based on regulatory requirements
  const getDefaultChecklistItems = () => {
    const baseItems = [
      {
        id: 'doc-review',
        title: 'Documentation Review',
        description: 'Complete review of all technical documentation and specifications',
        status: 'completed',
        category: 'Documentation',
        priority: 'high',
        estimatedTime: '2-3 days',
        required: true
      },
      {
        id: 'risk-assessment',
        title: 'Risk Assessment',
        description: 'Comprehensive risk analysis and mitigation strategies',
        status: 'in-progress',
        category: 'Safety',
        priority: 'high',
        estimatedTime: '3-5 days',
        required: true
      },
      {
        id: 'quality-system',
        title: 'Quality Management System',
        description: 'QMS documentation and compliance verification',
        status: 'completed',
        category: 'Quality',
        priority: 'high',
        estimatedTime: '1-2 weeks',
        required: true
      },
      {
        id: 'clinical-data',
        title: 'Clinical Data Review',
        description: 'Analysis of clinical evidence and study data',
        status: 'incomplete',
        category: 'Clinical',
        priority: 'medium',
        estimatedTime: '1-2 weeks',
        required: false
      },
      {
        id: 'labeling-review',
        title: 'Labeling and Instructions',
        description: 'Review of product labeling and user instructions',
        status: 'in-progress',
        category: 'Documentation',
        priority: 'medium',
        estimatedTime: '3-5 days',
        required: true
      },
      {
        id: 'manufacturing-info',
        title: 'Manufacturing Information',
        description: 'Manufacturing processes and facility documentation',
        status: 'incomplete',
        category: 'Manufacturing',
        priority: 'high',
        estimatedTime: '1 week',
        required: true
      }
    ];

    // Add market-specific items
    const marketSpecificItems = [];
    
    if (selectedMarket?.name?.includes('FDA') || selectedMarket?.regulatoryBody?.includes('FDA')) {
      marketSpecificItems.push(
        {
          id: 'fda-510k',
          title: '510(k) Submission',
          description: 'FDA 510(k) premarket notification submission',
          status: 'completed',
          category: 'Regulatory',
          priority: 'high',
          estimatedTime: '2-4 weeks',
          required: true,
          marketSpecific: true
        },
        {
          id: 'fda-response',
          title: 'FDA Response Review',
          description: 'Review and respond to FDA questions or requests',
          status: 'incomplete',
          category: 'Regulatory',
          priority: 'high',
          estimatedTime: '1-2 weeks',
          required: true,
          marketSpecific: true
        }
      );
    }

    if (selectedMarket?.name?.includes('EMA') || selectedMarket?.regulatoryBody?.includes('EMA')) {
      marketSpecificItems.push(
        {
          id: 'ce-marking',
          title: 'CE Marking Process',
          description: 'European CE marking compliance and documentation',
          status: 'in-progress',
          category: 'Regulatory',
          priority: 'high',
          estimatedTime: '3-6 weeks',
          required: true,
          marketSpecific: true
        },
        {
          id: 'notified-body',
          title: 'Notified Body Assessment',
          description: 'Third-party conformity assessment by notified body',
          status: 'incomplete',
          category: 'Regulatory',
          priority: 'high',
          estimatedTime: '4-8 weeks',
          required: true,
          marketSpecific: true
        }
      );
    }

    return [...baseItems, ...marketSpecificItems];
  };

  // Initialize checklist items
  useEffect(() => {
    if (state.checklistItems.length === 0) {
      const defaultItems = getDefaultChecklistItems();
      dispatch({ type: 'SET_CHECKLIST_ITEMS', items: defaultItems });
    }
  }, [selectedMarket?.name, selectedLicense?.license_number, dispatch, state.checklistItems.length]);

  // Calculate progress
  useEffect(() => {
    if (state.checklistItems.length > 0) {
      const completedItems = state.checklistItems.filter(item => item.status === 'completed').length;
      const progress = Math.round((completedItems / state.checklistItems.length) * 100);
      
      // Only update if progress has actually changed
      if (progress !== state.checklistProgress) {
        dispatch({ type: 'SET_CHECKLIST_PROGRESS', progress });
        if (onProgressUpdate) {
          onProgressUpdate(progress);
        }
      }
    }
  }, [state.checklistItems, state.checklistProgress, dispatch, onProgressUpdate]);

  const handleItemToggle = (itemId) => {
    const item = state.checklistItems.find(item => item.id === itemId);
    if (!item) return;

    let newStatus;
    switch (item.status) {
      case 'incomplete':
        newStatus = 'in-progress';
        break;
      case 'in-progress':
        newStatus = 'completed';
        break;
      case 'completed':
        newStatus = 'incomplete';
        break;
      default:
        newStatus = 'incomplete';
    }

    dispatch({ type: 'UPDATE_CHECKLIST_ITEM', itemId, status: newStatus });
  };

  const handleAddCustomItem = () => {
    if (!customItemTitle.trim()) return;

    const newItem = {
      id: `custom-${Date.now()}`,
      title: customItemTitle.trim(),
      description: customItemDescription.trim() || 'Custom checklist item',
      status: 'incomplete',
      category: 'Custom',
      priority: 'medium',
      estimatedTime: 'TBD',
      required: false,
      custom: true
    };

    dispatch({ 
      type: 'SET_CHECKLIST_ITEMS', 
      items: [...state.checklistItems, newItem] 
    });

    setCustomItemTitle('');
    setCustomItemDescription('');
    setShowAddCustom(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10b981'; // Green
      case 'in-progress':
        return '#f59e0b'; // Amber
      case 'incomplete':
        return '#ef4444'; // Red
      default:
        return '#6b7280'; // Gray
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'in-progress':
        return '🟡';
      case 'incomplete':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'incomplete':
        return 'Incomplete';
      default:
        return 'Unknown';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#dc2626';
      case 'medium':
        return '#d97706';
      case 'low':
        return '#059669';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="interactive-checklist" style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      border: '1px solid #e5e7eb',
      marginTop: '32px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid #f3f4f6'
      }}>
        <div>
          <h3 style={{
            color: '#1f2937',
            fontWeight: '700',
            fontSize: '20px',
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ✅ Regulatory Compliance Checklist
          </h3>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            margin: 0
          }}>
            Track your progress through regulatory requirements
          </p>
        </div>
        
        <div style={{
          textAlign: 'right'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: state.checklistProgress >= 80 ? '#10b981' : state.checklistProgress >= 50 ? '#f59e0b' : '#ef4444',
            marginBottom: '4px'
          }}>
            {state.checklistProgress}%
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280'
          }}>
            Complete
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        marginBottom: '24px'
      }}>
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#f3f4f6',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${state.checklistProgress}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${
              state.checklistProgress >= 80 ? '#10b981, #059669' : 
              state.checklistProgress >= 50 ? '#f59e0b, #d97706' : 
              '#ef4444, #dc2626'
            })`,
            transition: 'width 0.5s ease-in-out',
            borderRadius: '4px'
          }} />
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '8px',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Checklist Items */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '24px'
      }}>
        {state.checklistItems.map((item) => (
          <div
            key={item.id}
            className="checklist-item"
            onClick={() => handleItemToggle(item.id)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '12px',
              border: `2px solid ${getStatusColor(item.status)}20`,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
          >
            {/* Status Indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: getStatusColor(item.status),
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              flexShrink: 0
            }}>
              {getStatusIcon(item.status)}
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px'
              }}>
                <h4 style={{
                  color: '#1f2937',
                  fontWeight: '600',
                  fontSize: '16px',
                  margin: 0,
                  textDecoration: item.status === 'completed' ? 'line-through' : 'none',
                  opacity: item.status === 'completed' ? 0.7 : 1
                }}>
                  {item.title}
                </h4>
                
                {item.required && (
                  <span style={{
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    fontSize: '10px',
                    fontWeight: '600',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>
                    Required
                  </span>
                )}

                {item.marketSpecific && (
                  <span style={{
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    fontSize: '10px',
                    fontWeight: '600',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>
                    Market Specific
                  </span>
                )}

                <span style={{
                  backgroundColor: `${getPriorityColor(item.priority)}20`,
                  color: getPriorityColor(item.priority),
                  fontSize: '10px',
                  fontWeight: '600',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  textTransform: 'uppercase'
                }}>
                  {item.priority}
                </span>
              </div>

              <p style={{
                color: '#6b7280',
                fontSize: '14px',
                margin: '0 0 8px 0',
                lineHeight: '1.4'
              }}>
                {item.description}
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                fontSize: '12px',
                color: '#9ca3af'
              }}>
                <span>📂 {item.category}</span>
                <span>⏱️ {item.estimatedTime}</span>
                <span style={{
                  color: getStatusColor(item.status),
                  fontWeight: '600'
                }}>
                  {getStatusText(item.status)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Item */}
      <div style={{
        borderTop: '1px solid #e5e7eb',
        paddingTop: '16px'
      }}>
        {!showAddCustom ? (
          <button
            onClick={() => setShowAddCustom(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              backgroundColor: '#f3f4f6',
              border: '2px dashed #d1d5db',
              borderRadius: '8px',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              width: '100%',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.target.style.backgroundColor = '#e5e7eb';
              e.target.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={e => {
              e.target.style.backgroundColor = '#f3f4f6';
              e.target.style.borderColor = '#d1d5db';
            }}
          >
            ➕ Add Custom Item
          </button>
        ) : (
          <div style={{
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <input
              type="text"
              placeholder="Item title..."
              value={customItemTitle}
              onChange={(e) => setCustomItemTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                marginBottom: '8px'
              }}
            />
            <textarea
              placeholder="Description (optional)..."
              value={customItemDescription}
              onChange={(e) => setCustomItemDescription(e.target.value)}
              rows={2}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                marginBottom: '12px',
                resize: 'vertical'
              }}
            />
            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              <button
                onClick={handleAddCustomItem}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Add Item
              </button>
              <button
                onClick={() => {
                  setShowAddCustom(false);
                  setCustomItemTitle('');
                  setCustomItemDescription('');
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveChecklist;