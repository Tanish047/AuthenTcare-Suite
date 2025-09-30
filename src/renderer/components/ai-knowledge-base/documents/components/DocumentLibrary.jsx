import React, { useState, useMemo } from 'react';

/**
 * Document Library - Manage and organize document collection
 */
const DocumentLibrary = ({ 
  documents, 
  selectedDocument, 
  onDocumentSelect, 
  onDocumentAnalyze, 
  onDocumentDelete,
  onDocumentUpload,
  isProcessing,
  ragStats 
}) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('uploadedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.metadata?.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(doc => {
        const type = doc.type || '';
        switch (filterType) {
          case 'pdf': return type.includes('pdf');
          case 'word': return type.includes('word') || type.includes('docx');
          case 'text': return type.includes('text') || type.includes('plain');
          case 'json': return type.includes('json');
          default: return true;
        }
      });
    }

    // Sort documents
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'uploadedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortBy === 'size') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [documents, searchTerm, filterType, sortBy, sortOrder]);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon
  const getFileIcon = (type) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('docx')) return '📝';
    if (type.includes('text')) return '📃';
    if (type.includes('json')) return '🔧';
    if (type.includes('xml')) return '📋';
    return '📁';
  };

  // Get document status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'processed': return 'green';
      case 'processing': return 'orange';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onDocumentUpload(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="document-library">
      {/* Library Header */}
      <div className="library-header">
        <div className="header-controls">
          {/* Search */}
          <div className="search-box">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          {/* Filters */}
          <div className="filter-controls">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="pdf">PDF Documents</option>
              <option value="word">Word Documents</option>
              <option value="text">Text Files</option>
              <option value="json">JSON Files</option>
            </select>

            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="uploadedAt">Upload Date</option>
              <option value="name">Name</option>
              <option value="size">File Size</option>
              <option value="chunks">Chunks</option>
            </select>

            <button
              className="sort-order-btn"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          {/* View Mode */}
          <div className="view-controls">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              ⊞
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Results Info */}
        <div className="results-info">
          Showing {filteredDocuments.length} of {documents.length} documents
        </div>
      </div>

      {/* Document Grid/List */}
      <div 
        className={`documents-container ${viewMode}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {filteredDocuments.length === 0 ? (
          <div className="empty-library">
            <div className="empty-content">
              <div className="empty-icon">📚</div>
              <h3>No Documents Found</h3>
              {searchTerm || filterType !== 'all' ? (
                <p>Try adjusting your search or filters</p>
              ) : (
                <>
                  <p>Upload documents to start building your knowledge base</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => document.querySelector('.document-uploader input').click()}
                  >
                    Upload Documents
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className={`documents-${viewMode}`}>
            {filteredDocuments.map((document) => (
              <div
                key={document.id}
                className={`document-item ${selectedDocument?.id === document.id ? 'selected' : ''}`}
                onClick={() => onDocumentSelect(document)}
              >
                {/* Document Icon */}
                <div className="document-icon">
                  {getFileIcon(document.type)}
                </div>

                {/* Document Info */}
                <div className="document-info">
                  <div className="document-name" title={document.name}>
                    {document.name}
                  </div>
                  
                  <div className="document-meta">
                    <span className="document-size">
                      {formatFileSize(document.size)}
                    </span>
                    <span className="document-chunks">
                      {document.chunks || 0} chunks
                    </span>
                    <span className="document-date">
                      {new Date(document.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Document Status */}
                  <div className="document-status">
                    <span 
                      className={`status-indicator ${getStatusColor(document.status)}`}
                    >
                      {document.status || 'unknown'}
                    </span>
                  </div>

                  {/* Analysis Status */}
                  {document.analysis && (
                    <div className="analysis-preview">
                      <span className="analysis-indicator">🔬 Analyzed</span>
                      {document.analysis.entities && (
                        <span className="entity-count">
                          {document.analysis.entities.length} entities
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Document Actions */}
                <div className="document-actions">
                  <button
                    className="action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDocumentAnalyze(document.id, 'full');
                    }}
                    title="Analyze Document"
                    disabled={isProcessing}
                  >
                    🔬
                  </button>
                  
                  <button
                    className="action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Download or view document
                      console.log('View document:', document.id);
                    }}
                    title="View Document"
                  >
                    👁️
                  </button>
                  
                  <button
                    className="action-btn danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${document.name}"?`)) {
                        onDocumentDelete(document.id);
                      }
                    }}
                    title="Delete Document"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Library Stats */}
      <div className="library-stats">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📄</div>
            <div className="stat-content">
              <div className="stat-value">{documents.length}</div>
              <div className="stat-label">Total Documents</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🧩</div>
            <div className="stat-content">
              <div className="stat-value">{ragStats.totalChunks}</div>
              <div className="stat-label">Text Chunks</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">💾</div>
            <div className="stat-content">
              <div className="stat-value">{formatFileSize(ragStats.indexSize)}</div>
              <div className="stat-label">Index Size</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🔬</div>
            <div className="stat-content">
              <div className="stat-value">
                {documents.filter(doc => doc.analysis).length}
              </div>
              <div className="stat-label">Analyzed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentLibrary;