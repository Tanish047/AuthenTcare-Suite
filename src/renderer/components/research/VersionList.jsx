import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import DropdownButton from '../DropdownButton.jsx';
import ActionMenu from '../ActionMenu.jsx';
import BulkDeleteModal from './BulkDeleteModal.jsx';

const VersionList = ({
  selectedProject,
  selectedDevice,
  versions,
  selectedVersion,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
  onBulkDelete,
}) => {
  const [expandedRenewals, setExpandedRenewals] = useState(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Group and sort versions for better display
  const groupedVersions = useMemo(() => {
    if (!versions || versions.length === 0) return [];
    
    // Separate new versions and renewals
    const newVersions = versions.filter(v => v.type === 'new_version');
    const renewals = versions.filter(v => v.type === 'renewal');
    
    // Group renewals by base version
    const renewalGroups = {};
    renewals.forEach(renewal => {
      // Match R-vX-Y pattern to extract base version number
      const baseVersionMatch = renewal.version_number.match(/^R-v(\d+)-\d+$/);
      if (baseVersionMatch) {
        const baseVersion = baseVersionMatch[1]; // Extract the version number (1, 2, 3, etc.)
        if (!renewalGroups[baseVersion]) {
          renewalGroups[baseVersion] = [];
        }
        renewalGroups[baseVersion].push(renewal);
      }
    });
    
    // Sort renewals within each group
    Object.keys(renewalGroups).forEach(baseVersion => {
      renewalGroups[baseVersion].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    });
    
    // Combine and sort all items
    const allItems = [
      ...newVersions.map(v => ({ type: 'version', version: v })),
      ...Object.entries(renewalGroups).map(([baseVersion, renewalList]) => ({
        type: 'renewal_group',
        baseVersion,
        renewals: renewalList,
        mainRenewal: renewalList[0] // Use the most recent renewal as the main one
      }))
    ];
    
    return allItems.sort((a, b) => {
      const aDate = a.type === 'version' ? new Date(a.version.created_at) : new Date(a.mainRenewal.created_at);
      const bDate = b.type === 'version' ? new Date(b.version.created_at) : new Date(b.mainRenewal.created_at);
      return bDate - aDate;
    });
  }, [versions]);

  const toggleRenewalExpansion = (baseVersion) => {
    const newExpanded = new Set(expandedRenewals);
    if (newExpanded.has(baseVersion)) {
      newExpanded.delete(baseVersion);
    } else {
      newExpanded.add(baseVersion);
    }
    setExpandedRenewals(newExpanded);
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedVersions(new Set());
  };

  const toggleVersionSelection = (versionId) => {
    const newSelected = new Set(selectedVersions);
    if (newSelected.has(versionId)) {
      newSelected.delete(versionId);
    } else {
      newSelected.add(versionId);
    }
    setSelectedVersions(newSelected);
  };

  const handleVersionClick = (version) => {
    if (selectionMode) {
      toggleVersionSelection(version.id);
    } else {
      onSelect(version);
    }
  };

  const handleBulkDelete = () => {
    if (selectedVersions.size > 0) {
      setShowBulkDeleteModal(true);
    }
  };

  const handleBulkDeleteConfirm = async (versionsToDelete, password) => {
    if (onBulkDelete) {
      await onBulkDelete(versionsToDelete, password);
      setSelectedVersions(new Set());
      setSelectionMode(false);
      setShowBulkDeleteModal(false);
    }
  };

  if (!selectedProject || !selectedDevice) return null;

  // Helper function to format version display name
  const formatVersionName = (version) => {
    const date = new Date(version.created_at);
    const formattedDate = date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    return `${selectedDevice.name}-${version.version_number}, ${formattedDate}`;
  };

  // Helper function to get full timestamp for hover
  const getFullTimestamp = (version) => {
    const date = new Date(version.created_at);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Helper function to get version tag
  const getVersionTag = (version) => {
    if (version.type === 'renewal') {
      return { 
        text: `Renewal ${version.version_number}`, 
        color: '#e67e22'
      };
    } else {
      return { 
        text: `Version ${version.version_number}`, 
        color: '#27ae60'
      };
    }
  };

  const handleCreateVersion = useCallback((type) => {
    onCreate(type); // Pass the type (renewal or new_version) to the parent
  }, [onCreate]);

  return (
    <div style={{ marginTop: 0 }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 16 
      }}>
        <div style={{ color: '#666', fontSize: '14px' }}>
          Versions for <strong>{selectedDevice.name}</strong>
          {selectionMode && selectedVersions.size > 0 && (
            <span style={{ marginLeft: '8px', color: '#2c5aa0', fontWeight: '600' }}>
              ({selectedVersions.size} selected)
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!selectionMode ? (
            <>
              <button
                onClick={toggleSelectionMode}
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
                Select
              </button>
              
              <DropdownButton
                buttonText="Create New Version"
                buttonIcon="+"
                options={[
                  { key: 'new_version', label: 'New Version' },
                  { key: 'renewal', label: 'Renewal' }
                ]}
                onOptionSelect={(option) => handleCreateVersion(option.key)}
              />
            </>
          ) : (
            <>
              <button
                onClick={toggleSelectionMode}
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
              
              <div style={{ position: 'relative' }}>
                <ActionMenu
                  actions={[
                    {
                      key: 'bulk_delete',
                      label: `Delete Selected (${selectedVersions.size})`,
                      icon: '🗑️',
                      danger: true,
                      onClick: handleBulkDelete
                    }
                  ]}
                  disabled={selectedVersions.size === 0}
                />
              </div>
            </>
          )}
        </div>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {groupedVersions.length > 0 ? (
          groupedVersions.map((item, index) => {
            if (item.type === 'version') {
              const version = item.version;
              const tag = getVersionTag(version);
              return (
                <li key={version.id} style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      border: '1px solid ' + (
                        selectionMode && selectedVersions.has(version.id) ? '#2c5aa0' :
                        selectedVersion?.id === version.id ? '#2c5aa0' : '#e0e0e0'
                      ),
                      borderRadius: '8px',
                      backgroundColor: 
                        selectionMode && selectedVersions.has(version.id) ? '#e3f2fd' :
                        selectedVersion?.id === version.id ? '#f0f7ff' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                    onClick={() => handleVersionClick(version)}
                    title={selectionMode ? 'Click to select/deselect' : `Created: ${getFullTimestamp(version)}`}
                    onMouseEnter={e => {
                      if (!selectionMode && selectedVersion?.id !== version.id) {
                        e.target.style.backgroundColor = '#f8f9fa';
                        e.target.style.borderColor = '#ccc';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!selectionMode && selectedVersion?.id !== version.id) {
                        e.target.style.backgroundColor = '#fff';
                        e.target.style.borderColor = '#e0e0e0';
                      }
                    }}
                  >
                    {selectionMode && (
                      <div style={{ marginRight: '12px' }}>
                        <input
                          type="checkbox"
                          checked={selectedVersions.has(version.id)}
                          onChange={() => toggleVersionSelection(version.id)}
                          style={{ 
                            width: '16px', 
                            height: '16px',
                            cursor: 'pointer'
                          }}
                        />
                      </div>
                    )}
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: '600', 
                        fontSize: '16px', 
                        color: '#2c5aa0',
                        marginBottom: '4px'
                      }}>
                        {formatVersionName(version)}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#666'
                      }}>
                        {selectionMode ? 'Click to select/deselect' : 'Click to view target markets'}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: tag.color,
                          color: 'white'
                        }}
                      >
                        {tag.text}
                      </span>
                      
                      <ActionMenu
                        actions={[
                          {
                            key: 'edit',
                            label: 'Edit',
                            icon: '✏️',
                            onClick: () => onEdit(version)
                          },
                          {
                            key: 'delete',
                            label: 'Delete',
                            icon: '🗑️',
                            danger: true,
                            onClick: () => onDelete(version)
                          }
                        ]}
                      />
                    </div>
                  </div>
                </li>
              );
            } else {
              // Renewal group
              const { baseVersion, renewals, mainRenewal } = item;
              const isExpanded = expandedRenewals.has(baseVersion);
              const hasMultipleRenewals = renewals.length > 1;
              
              return (
                <li key={`renewal-${baseVersion}`} style={{ marginBottom: 12 }}>
                  {/* Main renewal item */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      border: '1px solid ' + (
                        selectionMode && selectedVersions.has(mainRenewal.id) ? '#2c5aa0' :
                        selectedVersion?.id === mainRenewal.id ? '#2c5aa0' : '#e0e0e0'
                      ),
                      borderRadius: hasMultipleRenewals && isExpanded ? '8px 8px 0 0' : '8px',
                      backgroundColor: 
                        selectionMode && selectedVersions.has(mainRenewal.id) ? '#e3f2fd' :
                        selectedVersion?.id === mainRenewal.id ? '#f0f7ff' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                    onClick={() => handleVersionClick(mainRenewal)}
                    title={selectionMode ? 'Click to select/deselect' : `Created: ${getFullTimestamp(mainRenewal)}`}
                    onMouseEnter={e => {
                      if (selectedVersion?.id !== mainRenewal.id) {
                        e.target.style.backgroundColor = '#f8f9fa';
                        e.target.style.borderColor = '#ccc';
                      }
                    }}
                    onMouseLeave={e => {
                      if (selectedVersion?.id !== mainRenewal.id) {
                        e.target.style.backgroundColor = '#fff';
                        e.target.style.borderColor = '#e0e0e0';
                      }
                    }}
                  >
                    {selectionMode && (
                      <div style={{ marginRight: '12px' }}>
                        <input
                          type="checkbox"
                          checked={selectedVersions.has(mainRenewal.id)}
                          onChange={() => toggleVersionSelection(mainRenewal.id)}
                          style={{ 
                            width: '16px', 
                            height: '16px',
                            cursor: 'pointer'
                          }}
                        />
                      </div>
                    )}
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: '600', 
                        fontSize: '16px', 
                        color: '#2c5aa0',
                        marginBottom: '4px'
                      }}>
                        {formatVersionName(mainRenewal)}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#666'
                      }}>
                        {selectionMode ? 'Click to select/deselect' : 
                         hasMultipleRenewals ? `${renewals.length} renewals available` : 'Click to view target markets'}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {hasMultipleRenewals && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRenewalExpansion(baseVersion);
                          }}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {isExpanded ? '▼' : '▶'} {renewals.length}
                        </button>
                      )}
                      
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: '#e67e22',
                          color: 'white'
                        }}
                      >
                        Renewal R-{baseVersion}
                      </span>
                      
                      <ActionMenu
                        actions={[
                          {
                            key: 'edit',
                            label: 'Edit',
                            icon: '✏️',
                            onClick: () => onEdit(mainRenewal)
                          },
                          {
                            key: 'delete',
                            label: 'Delete',
                            icon: '🗑️',
                            danger: true,
                            onClick: () => onDelete(mainRenewal)
                          }
                        ]}
                      />
                    </div>
                  </div>
                  
                  {/* Sub-renewals (expanded) */}
                  {hasMultipleRenewals && isExpanded && (
                    <div style={{ 
                      border: '1px solid #e0e0e0', 
                      borderTop: 'none',
                      borderRadius: '0 0 8px 8px',
                      backgroundColor: '#f8f9fa'
                    }}>
                      {renewals.slice(1).map((renewal, subIndex) => {
                        const tag = getVersionTag(renewal);
                        return (
                          <div
                            key={renewal.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '8px 16px 8px 32px',
                              borderBottom: subIndex < renewals.length - 2 ? '1px solid #e0e0e0' : 'none',
                              cursor: 'pointer',
                              backgroundColor: 
                                selectionMode && selectedVersions.has(renewal.id) ? '#e3f2fd' :
                                selectedVersion?.id === renewal.id ? '#f0f7ff' : 'transparent',
                              transition: 'all 0.2s ease'
                            }}
                            onClick={() => handleVersionClick(renewal)}
                            title={selectionMode ? 'Click to select/deselect' : `Created: ${getFullTimestamp(renewal)}`}
                            onMouseEnter={e => {
                              if (selectedVersion?.id !== renewal.id) {
                                e.target.style.backgroundColor = '#f0f0f0';
                              }
                            }}
                            onMouseLeave={e => {
                              if (selectedVersion?.id !== renewal.id) {
                                e.target.style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            {selectionMode && (
                              <div style={{ marginRight: '8px' }}>
                                <input
                                  type="checkbox"
                                  checked={selectedVersions.has(renewal.id)}
                                  onChange={() => toggleVersionSelection(renewal.id)}
                                  style={{ 
                                    width: '14px', 
                                    height: '14px',
                                    cursor: 'pointer'
                                  }}
                                />
                              </div>
                            )}
                            
                            <div style={{ flex: 1 }}>
                              <div style={{ 
                                fontWeight: '500', 
                                fontSize: '14px', 
                                color: '#2c5aa0',
                                marginBottom: '2px'
                              }}>
                                {formatVersionName(renewal)}
                              </div>
                              <div style={{ 
                                fontSize: '11px', 
                                color: '#666'
                              }}>
                                {selectionMode ? 'Click to select/deselect' : 'Sub-renewal - Click to view target markets'}
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span
                                style={{
                                  padding: '2px 6px',
                                  borderRadius: '8px',
                                  fontSize: '10px',
                                  fontWeight: '500',
                                  backgroundColor: tag.color,
                                  color: 'white'
                                }}
                              >
                                {tag.text}
                              </span>
                              
                              <ActionMenu
                                actions={[
                                  {
                                    key: 'edit',
                                    label: 'Edit',
                                    icon: '✏️',
                                    onClick: () => onEdit(renewal)
                                  },
                                  {
                                    key: 'delete',
                                    label: 'Delete',
                                    icon: '🗑️',
                                    danger: true,
                                    onClick: () => onDelete(renewal)
                                  }
                                ]}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </li>
              );
            }
          })
        ) : (
          <li style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
            No versions available. Create your first version using the button above.
          </li>
        )}
      </ul>

      <BulkDeleteModal
        show={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        versionsToDelete={versions.filter(v => selectedVersions.has(v.id))}
        onConfirmDelete={handleBulkDeleteConfirm}
      />
    </div>
  );
};

export default VersionList;
