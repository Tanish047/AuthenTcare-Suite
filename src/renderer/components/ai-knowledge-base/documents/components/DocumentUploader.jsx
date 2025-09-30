import React, { useState, useRef } from 'react';

/**
 * Document Uploader - Drag & drop file upload with progress tracking
 */
const DocumentUploader = ({ onUpload, isProcessing, supportedTypes }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = (files) => {
    const validFiles = Array.from(files).filter(file => {
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      return supportedTypes.includes(extension);
    });

    if (validFiles.length > 0) {
      setUploadQueue(validFiles.map(file => ({
        file,
        id: `upload_${Date.now()}_${Math.random()}`,
        name: file.name,
        size: file.size,
        status: 'pending'
      })));
      
      onUpload(validFiles);
    }
  };

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon
  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'docx':
      case 'doc': return '📝';
      case 'txt':
      case 'md': return '📃';
      case 'json': return '🔧';
      case 'xml': return '📋';
      default: return '📁';
    }
  };

  return (
    <div className="document-uploader">
      {/* Upload Area */}
      <div
        className={`upload-area ${isDragOver ? 'drag-over' : ''} ${isProcessing ? 'processing' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-content">
          {isProcessing ? (
            <>
              <div className="upload-icon processing">⏳</div>
              <h3>Processing Documents...</h3>
              <p>Please wait while we analyze and index your documents</p>
            </>
          ) : (
            <>
              <div className="upload-icon">📁</div>
              <h3>Upload Documents</h3>
              <p>Drag & drop files here or click to browse</p>
              
              <div className="supported-formats">
                <strong>Supported formats:</strong>
                <div className="format-list">
                  {supportedTypes.map(type => (
                    <span key={type} className="format-tag">{type}</span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Drag Overlay */}
        {isDragOver && (
          <div className="drag-overlay">
            <div className="drag-content">
              <div className="drag-icon">📥</div>
              <h3>Drop files to upload</h3>
            </div>
          </div>
        )}
      </div>

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <div className="upload-queue">
          <div className="queue-header">
            <h4>Upload Queue ({uploadQueue.length} files)</h4>
            <button 
              className="clear-queue-btn"
              onClick={() => setUploadQueue([])}
              disabled={isProcessing}
            >
              Clear
            </button>
          </div>
          
          <div className="queue-list">
            {uploadQueue.map((item) => (
              <div key={item.id} className="queue-item">
                <div className="item-icon">
                  {getFileIcon(item.name)}
                </div>
                
                <div className="item-info">
                  <div className="item-name">{item.name}</div>
                  <div className="item-size">{formatFileSize(item.size)}</div>
                </div>
                
                <div className="item-status">
                  {isProcessing ? (
                    <span className="status processing">Processing...</span>
                  ) : (
                    <span className="status pending">Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="upload-guidelines">
        <h4>📋 Upload Guidelines</h4>
        <ul>
          <li><strong>File Size:</strong> Maximum 50MB per file</li>
          <li><strong>Quality:</strong> Clear, readable text for best results</li>
          <li><strong>Language:</strong> English documents work best</li>
          <li><strong>Processing:</strong> Large files may take several minutes</li>
          <li><strong>Privacy:</strong> Documents are processed locally and securely</li>
        </ul>
      </div>

      {/* Quick Upload Actions */}
      <div className="quick-actions">
        <h4>🚀 Quick Actions</h4>
        <div className="action-buttons">
          <button 
            className="action-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            📁 Browse Files
          </button>
          
          <button 
            className="action-btn"
            onClick={() => {
              // Open sample documents dialog
              console.log('Load sample documents');
            }}
            disabled={isProcessing}
          >
            📚 Load Samples
          </button>
          
          <button 
            className="action-btn"
            onClick={() => {
              // Open URL import dialog
              console.log('Import from URL');
            }}
            disabled={isProcessing}
          >
            🌐 Import URL
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={supportedTypes.join(',')}
        style={{ display: 'none' }}
        onChange={(e) => handleFileSelect(e.target.files)}
      />
    </div>
  );
};

export default DocumentUploader;