import React, { useState, useEffect, useRef } from 'react';

const UserDatabase = ({ onBack }) => {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameItem, setRenameItem] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [currentPath, setCurrentPath] = useState('');
  const [pathHistory, setPathHistory] = useState(['']);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [clipboard, setClipboard] = useState({ items: [], operation: null });
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadFiles();

    // Set up upload progress listener
    const removeListener = window.userDatabaseAPI.onUploadProgress((data) => {
      setUploadProgress(data);
      if (data.completed) {
        setTimeout(() => {
          setUploadProgress(null);
          loadFiles();
        }, 1000);
      }
    });

    // Keyboard shortcuts
    const handleKeyDown = (e) => {
      // Ctrl+A - Select All
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        if (isSelectionMode) {
          handleSelectAll();
        }
      }

      // Ctrl+C - Copy
      if (e.ctrlKey && e.key === 'c' && selectedFiles.size > 0) {
        e.preventDefault();
        handleCopy();
      }

      // Ctrl+X - Cut
      if (e.ctrlKey && e.key === 'x' && selectedFiles.size > 0) {
        e.preventDefault();
        handleCut();
      }

      // Ctrl+V - Paste
      if (e.ctrlKey && e.key === 'v' && clipboard.items.length > 0) {
        e.preventDefault();
        handlePaste();
      }

      // Delete key - Delete selected items
      if (e.key === 'Delete' && selectedFiles.size > 0) {
        e.preventDefault();
        setShowDeleteModal(true);
      }

      // Escape - Clear selection or close modals
      if (e.key === 'Escape') {
        if (contextMenu) {
          closeContextMenu();
        } else if (isSelectionMode) {
          setSelectedFiles(new Set());
          setIsSelectionMode(false);
        }
      }

      // Backspace - Navigate up
      if (e.key === 'Backspace' && currentPath && !showDeleteModal && !showCreateFolderModal && !showRenameModal) {
        e.preventDefault();
        handleNavigateUp();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      removeListener();
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPath, isSelectionMode, selectedFiles, clipboard, contextMenu, showDeleteModal, showCreateFolderModal, showRenameModal]);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await window.userDatabaseAPI.getFiles(currentPath);
      setFiles(result.data || []);
    } catch (err) {
      setError('Failed to load files: ' + err.message);
      console.error('Error loading files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    try {
      const result = await window.userDatabaseAPI.openFileDialog({
        properties: ['openFile', 'multiSelections']
      });

      if (!result.canceled && result.filePaths.length > 0) {
        setIsLoading(true);
        await window.userDatabaseAPI.uploadFiles(result.filePaths, currentPath);
        // Files will be reloaded when upload progress completes
      }
    } catch (err) {
      setError('Failed to upload files: ' + err.message);
      console.error('Error uploading files:', err);
      setIsLoading(false);
    }
  };

  const handleSelectFile = (fileId) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map(f => f.id)));
    }
  };

  const handleDelete = async () => {
    if (selectedFiles.size === 0) {
      setError('No files selected for deletion');
      return;
    }

    try {
      setIsLoading(true);
      await window.userDatabaseAPI.deleteItems(Array.from(selectedFiles));
      setSelectedFiles(new Set());
      setShowDeleteModal(false);
      setIsSelectionMode(false);
      await loadFiles();
    } catch (err) {
      setError('Failed to delete files: ' + err.message);
      console.error('Error deleting files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setError('Folder name cannot be empty');
      return;
    }

    try {
      setIsLoading(true);
      await window.userDatabaseAPI.createFolder(currentPath, newFolderName);
      setNewFolderName('');
      setShowCreateFolderModal(false);
      await loadFiles();
    } catch (err) {
      setError('Failed to create folder: ' + err.message);
      console.error('Error creating folder:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRename = async () => {
    if (!newItemName.trim()) {
      setError('Name cannot be empty');
      return;
    }

    try {
      setIsLoading(true);
      await window.userDatabaseAPI.renameItem(renameItem.id, newItemName);
      setNewItemName('');
      setShowRenameModal(false);
      setRenameItem(null);
      await loadFiles();
    } catch (err) {
      setError('Failed to rename item: ' + err.message);
      console.error('Error renaming item:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (selectedFiles.size === 0) return;

    try {
      // Store in local clipboard for better UX
      setClipboard({
        items: Array.from(selectedFiles),
        operation: 'copy',
        sourcePath: currentPath
      });

      await window.userDatabaseAPI.copyItems(Array.from(selectedFiles), currentPath);
      setError(null);
      // Show success feedback
      const itemCount = selectedFiles.size;
      setError(`✓ Copied ${itemCount} item${itemCount > 1 ? 's' : ''} to clipboard`);
      setTimeout(() => setError(null), 2000);
    } catch (err) {
      setError('Failed to copy items: ' + err.message);
    }
  };

  const handleCut = async () => {
    if (selectedFiles.size === 0) return;

    try {
      // Store in local clipboard for better UX
      setClipboard({
        items: Array.from(selectedFiles),
        operation: 'cut',
        sourcePath: currentPath
      });

      await window.userDatabaseAPI.cutItems(Array.from(selectedFiles), currentPath);
      setError(null);
      // Show success feedback
      const itemCount = selectedFiles.size;
      setError(`✓ Cut ${itemCount} item${itemCount > 1 ? 's' : ''} to clipboard`);
      setTimeout(() => setError(null), 2000);
    } catch (err) {
      setError('Failed to cut items: ' + err.message);
    }
  };

  const handlePaste = async () => {
    if (!clipboard.items || clipboard.items.length === 0) {
      setError('No items in clipboard to paste');
      return;
    }

    try {
      setIsLoading(true);
      await window.userDatabaseAPI.pasteItems(currentPath);

      // Clear clipboard after cut operation
      if (clipboard.operation === 'cut') {
        setClipboard({ items: [], operation: null, sourcePath: '' });
      }

      await loadFiles();
      setError(null);
      // Show success feedback
      const itemCount = clipboard.items.length;
      setError(`✓ Pasted ${itemCount} item${itemCount > 1 ? 's' : ''}`);
      setTimeout(() => setError(null), 2000);
    } catch (err) {
      setError('Failed to paste items: ' + err.message);
      console.error('Error pasting items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderOpen = (folder) => {
    const newPath = currentPath ? `${currentPath}/${folder.name}` : folder.name;
    setCurrentPath(newPath);
    setPathHistory([...pathHistory, newPath]);
    setSelectedFiles(new Set());
    setIsSelectionMode(false);
  };

  const handleNavigateUp = () => {
    if (currentPath === '') return;

    const pathParts = currentPath.split('/');
    pathParts.pop();
    const newPath = pathParts.join('/');

    setCurrentPath(newPath);
    setPathHistory(pathHistory.slice(0, -1));
    setSelectedFiles(new Set());
    setIsSelectionMode(false);
  };

  const handleNavigateToPath = (targetPath) => {
    setCurrentPath(targetPath);
    const newHistory = [''];
    if (targetPath) {
      const parts = targetPath.split('/');
      for (let i = 0; i < parts.length; i++) {
        newHistory.push(parts.slice(0, i + 1).join('/'));
      }
    }
    setPathHistory(newHistory);
    setSelectedFiles(new Set());
    setIsSelectionMode(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      try {
        setIsLoading(true);
        const filePaths = files.map(file => file.path);
        await window.userDatabaseAPI.uploadFiles(filePaths, currentPath);
      } catch (err) {
        setError('Failed to upload dropped files: ' + err.message);
        setIsLoading(false);
      }
    }
  };

  const handleContextMenu = (e, file) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      file
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  };

  return (
    <div
      style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        borderBottom: '2px solid #e0e0e0',
        paddingBottom: '16px'
      }}>
        <div>
          <h2 style={{
            color: '#2c5aa0',
            fontWeight: '700',
            fontSize: '28px',
            marginBottom: '8px',
            margin: 0
          }}>
            📁 User Database
          </h2>

          {/* Breadcrumb Navigation */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '8px',
            fontSize: '14px'
          }}>
            <button
              onClick={() => handleNavigateToPath('')}
              style={{
                background: 'none',
                border: 'none',
                color: currentPath === '' ? '#2c5aa0' : '#666',
                cursor: 'pointer',
                textDecoration: currentPath === '' ? 'underline' : 'none',
                fontWeight: currentPath === '' ? '600' : 'normal'
              }}
            >
              🏠 Home
            </button>

            {currentPath && currentPath.split('/').map((part, index, array) => {
              const pathToHere = array.slice(0, index + 1).join('/');
              const isLast = index === array.length - 1;

              return (
                <React.Fragment key={index}>
                  <span style={{ color: '#ccc' }}>›</span>
                  <button
                    onClick={() => !isLast && handleNavigateToPath(pathToHere)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: isLast ? '#2c5aa0' : '#666',
                      cursor: isLast ? 'default' : 'pointer',
                      textDecoration: isLast ? 'underline' : 'none',
                      fontWeight: isLast ? '600' : 'normal'
                    }}
                  >
                    📁 {part}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {currentPath && (
            <button
              onClick={handleNavigateUp}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              ↑ Up
            </button>
          )}

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{
              fontSize: '12px',
              color: '#666',
              padding: '4px 8px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e0e0e0'
            }}>
              💡 Shortcuts: Ctrl+C/X/V, Del, Esc, Backspace
            </div>

            <button
              onClick={onBack}
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              ← Back to Completion
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}>
        <button
          onClick={handleUpload}
          disabled={isLoading}
          style={{
            padding: '10px 16px',
            borderRadius: '6px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          📤 Upload Files
        </button>

        <button
          onClick={() => setShowCreateFolderModal(true)}
          disabled={isLoading}
          style={{
            padding: '10px 16px',
            borderRadius: '6px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          📁 New Folder
        </button>

        <button
          onClick={() => setIsSelectionMode(!isSelectionMode)}
          style={{
            padding: '10px 16px',
            borderRadius: '6px',
            backgroundColor: isSelectionMode ? '#ffc107' : '#6c757d',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {isSelectionMode ? '✓ Selection Mode' : '☑️ Select'}
        </button>

        {isSelectionMode && (
          <>
            <button
              onClick={handleSelectAll}
              style={{
                padding: '10px 16px',
                borderRadius: '6px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {selectedFiles.size === files.length ? 'Deselect All' : 'Select All'}
            </button>

            <button
              onClick={handleCopy}
              disabled={selectedFiles.size === 0}
              style={{
                padding: '10px 16px',
                borderRadius: '6px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                cursor: selectedFiles.size === 0 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: selectedFiles.size === 0 ? 0.6 : 1
              }}
            >
              📋 Copy
            </button>

            <button
              onClick={handleCut}
              disabled={selectedFiles.size === 0}
              style={{
                padding: '10px 16px',
                borderRadius: '6px',
                backgroundColor: '#fd7e14',
                color: 'white',
                border: 'none',
                cursor: selectedFiles.size === 0 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: selectedFiles.size === 0 ? 0.6 : 1
              }}
            >
              ✂️ Cut
            </button>

            <button
              onClick={handlePaste}
              disabled={!clipboard.items || clipboard.items.length === 0}
              style={{
                padding: '10px 16px',
                borderRadius: '6px',
                backgroundColor: '#20c997',
                color: 'white',
                border: 'none',
                cursor: (!clipboard.items || clipboard.items.length === 0) ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: (!clipboard.items || clipboard.items.length === 0) ? 0.6 : 1
              }}
            >
              📋 Paste {clipboard.items && clipboard.items.length > 0 ? `(${clipboard.items.length})` : ''}
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={selectedFiles.size === 0}
              style={{
                padding: '10px 16px',
                borderRadius: '6px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                cursor: selectedFiles.size === 0 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: selectedFiles.size === 0 ? 0.6 : 1
              }}
            >
              🗑️ Delete ({selectedFiles.size})
            </button>
          </>
        )}
      </div>

      {/* Upload Progress */}
      {uploadProgress && (
        <div style={{
          marginBottom: '20px',
          padding: '16px',
          backgroundColor: '#e7f3ff',
          border: '1px solid #b3d9ff',
          borderRadius: '8px'
        }}>
          <div style={{ marginBottom: '8px', fontWeight: '500' }}>
            Uploading: {uploadProgress.currentFile || 'Processing...'}
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e0e0e0',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${uploadProgress.percentage || 0}%`,
              height: '100%',
              backgroundColor: '#28a745',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <div style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
            {uploadProgress.current || 0} of {uploadProgress.total || 0} files ({uploadProgress.percentage || 0}%)
          </div>
        </div>
      )}

      {/* Error/Success Message */}
      {error && (
        <div style={{
          marginBottom: '20px',
          padding: '12px 16px',
          backgroundColor: error.startsWith('✓') ? '#d4edda' : '#f8d7da',
          color: error.startsWith('✓') ? '#155724' : '#721c24',
          border: `1px solid ${error.startsWith('✓') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '6px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: error.startsWith('✓') ? '#155724' : '#721c24',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !uploadProgress && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
          color: '#666'
        }}>
          <div style={{ marginRight: '12px' }}>Loading...</div>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid #e0e0e0',
            borderTop: '2px solid #2c5aa0',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      )}

      {/* Drag and Drop Overlay */}
      {isDragOver && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          border: '3px dashed #28a745',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          fontSize: '24px',
          fontWeight: '600',
          color: '#28a745'
        }}>
          📤 Drop files here to upload
        </div>
      )}

      {/* File List */}
      {!isLoading && files.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#666',
          backgroundColor: isDragOver ? '#e7f3ff' : '#f8f9fa',
          borderRadius: '8px',
          border: `2px dashed ${isDragOver ? '#28a745' : '#e0e0e0'}`,
          transition: 'all 0.3s ease'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
          <h3 style={{ marginBottom: '8px', color: '#666' }}>No files yet</h3>
          <p style={{ marginBottom: '20px' }}>Upload your first files to get started or drag & drop files here</p>
          <button
            onClick={handleUpload}
            style={{
              padding: '12px 24px',
              borderRadius: '6px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            📤 Upload Files
          </button>
        </div>
      ) : (
        <div style={{
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          backgroundColor: '#fff',
          overflow: 'hidden'
        }}>
          {/* File List Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isSelectionMode ? '40px 1fr 120px 150px 100px' : '1fr 120px 150px 100px',
            gap: '16px',
            padding: '16px 20px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #e0e0e0',
            fontWeight: '600',
            fontSize: '14px',
            color: '#666'
          }}>
            {isSelectionMode && <div></div>}
            <div>Name</div>
            <div>Size</div>
            <div>Modified</div>
            <div>Actions</div>
          </div>

          {/* File Items */}
          {files.map((file) => (
            <div
              key={file.id}
              style={{
                display: 'grid',
                gridTemplateColumns: isSelectionMode ? '40px 1fr 120px 150px 100px' : '1fr 120px 150px 100px',
                gap: '16px',
                padding: '12px 20px',
                borderBottom: '1px solid #f0f0f0',
                alignItems: 'center',
                backgroundColor: selectedFiles.has(file.id) ? '#e7f3ff' : 'transparent',
                cursor: 'pointer'
              }}
              onContextMenu={(e) => handleContextMenu(e, file)}
              onClick={() => isSelectionMode && handleSelectFile(file.id)}
            >
              {isSelectionMode && (
                <input
                  type="checkbox"
                  checked={selectedFiles.has(file.id)}
                  onChange={() => handleSelectFile(file.id)}
                  style={{ cursor: 'pointer' }}
                />
              )}

              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                onDoubleClick={() => {
                  if (file.type === 'folder' && !isSelectionMode) {
                    handleFolderOpen(file);
                  }
                }}
              >
                <span style={{ fontSize: '20px' }}>
                  {file.type === 'folder' ? '📁' : '📄'}
                </span>
                <span style={{
                  fontWeight: '500',
                  cursor: file.type === 'folder' && !isSelectionMode ? 'pointer' : 'default',
                  color: file.type === 'folder' ? '#2c5aa0' : 'inherit'
                }}>
                  {file.name}
                </span>
              </div>

              <div style={{ color: '#666', fontSize: '14px' }}>
                {file.type === 'folder' ? '-' : formatFileSize(file.size)}
              </div>

              <div style={{ color: '#666', fontSize: '14px' }}>
                {formatDate(file.dateModified)}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {file.type === 'folder' && !isSelectionMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFolderOpen(file);
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    📂 Open
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenameItem(file);
                    setNewItemName(file.name);
                    setShowRenameModal(true);
                  }}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  ✏️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999
            }}
            onClick={closeContextMenu}
          />
          <div
            style={{
              position: 'fixed',
              top: contextMenu.y,
              left: contextMenu.x,
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              zIndex: 1000,
              minWidth: '150px'
            }}
          >
            {contextMenu.file.type === 'folder' && (
              <button
                onClick={() => {
                  handleFolderOpen(contextMenu.file);
                  closeContextMenu();
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                📂 Open
              </button>
            )}

            <button
              onClick={() => {
                setSelectedFiles(new Set([contextMenu.file.id]));
                handleCopy();
                closeContextMenu();
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              � Coply
            </button>

            <button
              onClick={() => {
                setSelectedFiles(new Set([contextMenu.file.id]));
                handleCut();
                closeContextMenu();
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ✂️ Cut
            </button>

            <button
              onClick={() => {
                setRenameItem(contextMenu.file);
                setNewItemName(contextMenu.file.name);
                setShowRenameModal(true);
                closeContextMenu();
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ✏️ Rename
            </button>

            <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #eee' }} />

            <button
              onClick={() => {
                setSelectedFiles(new Set([contextMenu.file.id]));
                setShowDeleteModal(true);
                closeContextMenu();
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#dc3545'
              }}
            >
              🗑️ Delete
            </button>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ marginBottom: '16px', color: '#dc3545' }}>
              🗑️ Confirm Deletion
            </h3>
            <p style={{ marginBottom: '16px' }}>
              Are you sure you want to delete {selectedFiles.size} item(s)? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ marginBottom: '16px', color: '#17a2b8' }}>
              📁 Create New Folder
            </h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginBottom: '16px',
                fontSize: '14px'
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowCreateFolderModal(false);
                  setNewFolderName('');
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  cursor: newFolderName.trim() ? 'pointer' : 'not-allowed',
                  opacity: newFolderName.trim() ? 1 : 0.6
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {showRenameModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ marginBottom: '16px', color: '#17a2b8' }}>
              ✏️ Rename Item
            </h3>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="New name"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginBottom: '16px',
                fontSize: '14px'
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleRename()}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowRenameModal(false);
                  setNewItemName('');
                  setRenameItem(null);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRename}
                disabled={!newItemName.trim()}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  cursor: newItemName.trim() ? 'pointer' : 'not-allowed',
                  opacity: newItemName.trim() ? 1 : 0.6
                }}
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default UserDatabase;