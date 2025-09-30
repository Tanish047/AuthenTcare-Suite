import React, { useState, useEffect } from 'react';
import ActionMenu from '../ActionMenu.jsx';

const MarketList = ({
  selectedVersion,
  versionMarkets = [],
  allMarkets = [],
  selectedMarket,
  onSelect,
  onAddMarket,
  onEdit,
  onDelete,
  onBulkDelete,
  loading = false,
  error = '',
}) => {
  const [showAddMarketDropdown, setShowAddMarketDropdown] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMarkets, setSelectedMarkets] = useState(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeletePassword, setBulkDeletePassword] = useState('');
  const [bulkDeleteError, setBulkDeleteError] = useState('');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (showAddMarketDropdown && !event.target.closest('.add-market-dropdown-container')) {
        setShowAddMarketDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddMarketDropdown]);

  // Handle escape key for bulk delete modal
  useEffect(() => {
    const handleEscapeKey = event => {
      if (event.key === 'Escape' && showBulkDeleteModal) {
        handleBulkDeleteCancel();
      }
    };

    if (showBulkDeleteModal) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [showBulkDeleteModal]);

  // Get markets available for this version (not yet added)
  const availableMarkets = allMarkets.filter(
    market => !versionMarkets.some(vm => vm.id === market.id)
  );

  // Get markets already added to this version
  const addedMarkets = allMarkets.filter(market => versionMarkets.some(vm => vm.id === market.id));

  const handleAddMarket = async market => {
    setShowAddMarketDropdown(false);

    if (!selectedVersion) {
      setShowErrorMessage('No version selected');
      setTimeout(() => setShowErrorMessage(''), 5000);
      return;
    }

    try {
      await onAddMarket(market.id);
      setShowSuccessMessage('Market added successfully!');
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Failed to add market to version:', error);
      setShowErrorMessage(error.message || 'Failed to add market to version');
      setTimeout(() => setShowErrorMessage(''), 5000);
    }
  };

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedMarkets(new Set());
  };

  const handleMarketSelection = marketId => {
    const newSelected = new Set(selectedMarkets);
    if (newSelected.has(marketId)) {
      newSelected.delete(marketId);
    } else {
      newSelected.add(marketId);
    }
    setSelectedMarkets(newSelected);
  };

  const handleBulkDeleteClick = () => {
    if (selectedMarkets.size === 0) return;
    setShowBulkDeleteModal(true);
  };

  const handleBulkDeleteConfirm = async () => {
    if (!bulkDeletePassword) {
      setBulkDeleteError('Password is required.');
      return;
    }

    // Check password (assuming same password check as single delete)
    const { checkPassword } = await import('../../utils/password.js');
    if (!checkPassword(bulkDeletePassword)) {
      setBulkDeleteError('Incorrect password.');
      return;
    }

    try {
      const marketIds = Array.from(selectedMarkets);

      if (onBulkDelete) {
        // Use the bulk delete function if provided
        await onBulkDelete(marketIds);
      } else {
        // Fallback to individual deletions using the API directly
        for (const marketId of marketIds) {
          if (selectedVersion) {
            await window.dbAPI.removeVersionMarket(selectedVersion.id, marketId);
          }
        }
      }

      setSelectedMarkets(new Set());
      setIsSelectionMode(false);
      setShowBulkDeleteModal(false);
      setBulkDeletePassword('');
      setBulkDeleteError('');
      setShowSuccessMessage(
        `Successfully removed ${marketIds.length} market${marketIds.length > 1 ? 's' : ''} from version`
      );
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Failed to delete markets:', error);
      setBulkDeleteError(error.message || 'Failed to delete selected markets');
    }
  };

  const handleBulkDeleteCancel = () => {
    setShowBulkDeleteModal(false);
    setBulkDeletePassword('');
    setBulkDeleteError('');
  };

  return (
    <div style={{ marginTop: 0 }}>
      {/* Add Target Market Section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <div style={{ color: '#666', fontSize: '14px' }}>Available Target Markets</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {versionMarkets.length > 0 && (
            <>
              {isSelectionMode ? (
                <>
                  <button
                    onClick={handleBulkDeleteClick}
                    disabled={selectedMarkets.size === 0}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '4px',
                      backgroundColor: selectedMarkets.size > 0 ? '#dc3545' : '#6c757d',
                      color: 'white',
                      border: 'none',
                      cursor: selectedMarkets.size > 0 ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}
                    title={`Delete ${selectedMarkets.size} selected markets`}
                  >
                    🗑️ Delete ({selectedMarkets.size})
                  </button>
                  <button
                    onClick={handleToggleSelectionMode}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '4px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleToggleSelectionMode}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                  title="Select multiple markets for bulk operations"
                >
                  Select
                </button>
              )}
            </>
          )}
          <div className="add-market-dropdown-container" style={{ position: 'relative' }}>
            <button
              onClick={() => setShowAddMarketDropdown(!showAddMarketDropdown)}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                backgroundColor: '#2c5aa0',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
              }}
              title="View all countries and add new target markets"
            >
              <span>+</span>
              Add a Target Market
              <span
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '10px',
                  padding: '2px 6px',
                  fontSize: '11px',
                  marginLeft: '4px',
                }}
              >
                {versionMarkets.length}/{allMarkets.length}
              </span>
            </button>

            {showAddMarketDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  zIndex: 1000,
                  minWidth: '220px',
                  maxHeight: '320px',
                  overflowY: 'auto',
                  marginTop: '4px',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f8f9fa',
                    borderBottom: '1px solid #eee',
                    fontSize: '12px',
                    color: '#666',
                    fontWeight: '600',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  Select Market ({availableMarkets.length} available, {versionMarkets.length} added)
                </div>

                {/* Available Markets */}
                {availableMarkets.length > 0 && (
                  <>
                    <div
                      style={{
                        padding: '6px 16px',
                        backgroundColor: '#e8f5e8',
                        fontSize: '11px',
                        color: '#2d5a2d',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Available ({availableMarkets.length})
                    </div>
                    {availableMarkets.map(market => (
                      <button
                        key={`available-${market.id}`}
                        onClick={() => handleAddMarket(market)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: 'none',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '14px',
                          borderBottom: '1px solid #eee',
                          transition: 'background-color 0.2s ease',
                          color: '#333',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                        onMouseEnter={e => {
                          e.target.style.backgroundColor = '#f0f8f0';
                        }}
                        onMouseLeave={e => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                        title={`Add ${market.name} to this version`}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: '14px',
                              color: '#333',
                              fontWeight: '500',
                            }}
                          >
                            {market.name}
                          </div>
                          {market.region && (
                            <div
                              style={{
                                fontSize: '12px',
                                color: '#666',
                                marginTop: '2px',
                              }}
                            >
                              {market.region} • {market.regulatory_body}
                            </div>
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: '12px',
                            color: '#28a745',
                            fontWeight: '600',
                          }}
                        >
                          + Add
                        </span>
                      </button>
                    ))}
                  </>
                )}

                {/* Already Added Markets */}
                {addedMarkets.length > 0 && (
                  <>
                    <div
                      style={{
                        padding: '6px 16px',
                        backgroundColor: '#f0f0f0',
                        fontSize: '11px',
                        color: '#666',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderTop: availableMarkets.length > 0 ? '2px solid #ddd' : 'none',
                      }}
                    >
                      Already Added to This Version ({addedMarkets.length})
                    </div>
                    {addedMarkets.map(market => (
                      <button
                        key={`added-${market.id}`}
                        disabled={true}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: 'none',
                          backgroundColor: '#f8f9fa',
                          cursor: 'not-allowed',
                          textAlign: 'left',
                          fontSize: '14px',
                          borderBottom: '1px solid #eee',
                          color: '#999',
                          opacity: 0.7,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                        title={`${market.name} is already added to this version`}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: '14px',
                              color: '#666',
                              fontWeight: '500',
                            }}
                          >
                            {market.name}
                          </div>
                          {market.region && (
                            <div
                              style={{
                                fontSize: '12px',
                                color: '#999',
                                marginTop: '2px',
                              }}
                            >
                              {market.region} • {market.regulatory_body}
                            </div>
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: '12px',
                            color: '#28a745',
                            fontWeight: '600',
                          }}
                        >
                          ✓ Added
                        </span>
                      </button>
                    ))}
                  </>
                )}

                {/* No markets available message */}
                {availableMarkets.length === 0 && allMarkets.length > 0 && (
                  <div
                    style={{
                      padding: '16px',
                      fontSize: '14px',
                      color: '#666',
                      textAlign: 'center',
                      fontStyle: 'italic',
                    }}
                  >
                    🎉 All available markets have been added to this version!
                  </div>
                )}

                {/* No markets in database message */}
                {allMarkets.length === 0 && (
                  <div
                    style={{
                      padding: '16px',
                      fontSize: '14px',
                      color: '#666',
                      textAlign: 'center',
                      fontStyle: 'italic',
                    }}
                  >
                    No markets available in database. Please add markets first.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            color: '#155724',
            marginBottom: '16px',
            fontSize: '14px',
          }}
        >
          ✓{' '}
          {typeof showSuccessMessage === 'string'
            ? showSuccessMessage
            : 'Market added successfully!'}
        </div>
      )}

      {/* Error Message */}
      {(showErrorMessage || error) && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            color: '#721c24',
            marginBottom: '16px',
            fontSize: '14px',
          }}
        >
          ⚠️ {showErrorMessage || error}
        </div>
      )}

      {/* Loading Message */}
      {loading && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#d1ecf1',
            border: '1px solid #bee5eb',
            borderRadius: '4px',
            color: '#0c5460',
            marginBottom: '16px',
            fontSize: '14px',
          }}
        >
          Loading markets...
        </div>
      )}

      <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24 }}>
        {versionMarkets && versionMarkets.length > 0 ? (
          versionMarkets.map(market => (
            <li key={market.id} style={{ marginBottom: 12 }}>
              <div
                onClick={() => {
                  if (isSelectionMode) {
                    handleMarketSelection(market.id);
                  } else {
                    onSelect({ ...market, selectedCountry: market.name });
                  }
                }}
                style={{
                  padding: '16px',
                  border:
                    '1px solid ' +
                    (isSelectionMode && selectedMarkets.has(market.id)
                      ? '#17a2b8'
                      : selectedMarket?.id === market.id
                        ? '#2c5aa0'
                        : '#e0e0e0'),
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor:
                    isSelectionMode && selectedMarkets.has(market.id)
                      ? '#e7f3ff'
                      : selectedMarket?.id === market.id
                        ? '#f0f7ff'
                        : '#fff',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                onMouseEnter={e => {
                  if (!isSelectionMode && selectedMarket?.id !== market.id) {
                    e.target.style.backgroundColor = '#f8f9fa';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelectionMode && selectedMarket?.id !== market.id) {
                    e.target.style.backgroundColor = '#fff';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  {isSelectionMode && (
                    <input
                      type="checkbox"
                      checked={selectedMarkets.has(market.id)}
                      onChange={() => handleMarketSelection(market.id)}
                      style={{
                        marginRight: '12px',
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                      }}
                      onClick={e => e.stopPropagation()}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: '600',
                        fontSize: '16px',
                        color: '#2c5aa0',
                        marginBottom: '4px',
                      }}
                    >
                      {market.name}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#666',
                      }}
                    >
                      {market.region && `Region: ${market.region} • `}
                      {isSelectionMode
                        ? 'Click to select/deselect'
                        : 'Click to proceed to license selection'}
                    </div>
                  </div>
                </div>

                {!isSelectionMode && (
                  <div onClick={e => e.stopPropagation()}>
                    <ActionMenu
                      actions={[
                        {
                          key: 'edit',
                          label: 'Edit',
                          icon: '✏️',
                          onClick: () => onEdit(market),
                        },
                        {
                          key: 'delete',
                          label: 'Remove from Version',
                          icon: '🗑️',
                          danger: true,
                          onClick: () => onDelete(market),
                        },
                      ]}
                    />
                  </div>
                )}
              </div>
            </li>
          ))
        ) : (
          <li style={{ color: '#888' }}>
            {selectedVersion
              ? `No markets added to ${selectedVersion.version_number} yet. Use the "Add a Target Market" button above.`
              : 'No version selected.'}
          </li>
        )}
      </ul>

      {/* Bulk Delete Modal */}
      {showBulkDeleteModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={e => {
            if (e.target === e.currentTarget) {
              handleBulkDeleteCancel();
            }
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              minWidth: '400px',
              maxWidth: '500px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3
              style={{
                margin: '0 0 16px 0',
                color: '#dc3545',
                fontSize: '18px',
                fontWeight: '600',
              }}
            >
              Remove Multiple Markets from Version
            </h3>

            <p style={{ marginBottom: '16px', color: '#333' }}>
              Are you sure you want to remove{' '}
              <strong>
                {selectedMarkets.size} market{selectedMarkets.size > 1 ? 's' : ''}
              </strong>{' '}
              from this version? This will not delete the markets from the database, only remove
              them from this specific version.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <strong>Markets to be removed:</strong>
              <ul
                style={{
                  marginTop: '8px',
                  paddingLeft: '20px',
                  maxHeight: '120px',
                  overflowY: 'auto',
                  backgroundColor: '#f8f9fa',
                  padding: '12px',
                  borderRadius: '4px',
                  border: '1px solid #e9ecef',
                }}
              >
                {Array.from(selectedMarkets).map(marketId => {
                  const market = versionMarkets.find(m => m.id === marketId);
                  return market ? (
                    <li key={marketId} style={{ marginBottom: '4px', color: '#495057' }}>
                      {market.name}
                    </li>
                  ) : null;
                })}
              </ul>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#495057',
                }}
              >
                Enter password to confirm:
              </label>
              <input
                type="password"
                value={bulkDeletePassword}
                onChange={e => setBulkDeletePassword(e.target.value)}
                placeholder="Enter password"
                autoFocus
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ced4da',
                  fontSize: '14px',
                }}
                onClick={e => e.stopPropagation()}
                onFocus={e => e.stopPropagation()}
                onKeyPress={e => {
                  e.stopPropagation();
                  if (e.key === 'Enter') {
                    handleBulkDeleteConfirm();
                  }
                }}
              />
              {bulkDeleteError && (
                <p
                  style={{
                    color: '#dc3545',
                    marginTop: '8px',
                    fontSize: '14px',
                    margin: '8px 0 0 0',
                  }}
                >
                  {bulkDeleteError}
                </p>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={handleBulkDeleteCancel}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDeleteConfirm}
                disabled={!bulkDeletePassword}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  backgroundColor: bulkDeletePassword ? '#dc3545' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  cursor: bulkDeletePassword ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                Remove {selectedMarkets.size} Market{selectedMarkets.size > 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketList;
