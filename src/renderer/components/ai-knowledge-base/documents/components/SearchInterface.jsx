import React, { useState } from 'react';

/**
 * Search Interface - Search across all documents
 */
const SearchInterface = ({ 
  documents, 
  selectedDocument, 
  onDocumentSelect, 
  onDocumentAnalyze, 
  onDocumentDelete,
  searchResults,
  onSearch,
  isProcessing,
  ragStats 
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    maxResults: 10,
    threshold: 0.7,
    documentTypes: [],
    dateRange: null
  });

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query, filters);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-interface">
      <div className="search-header">
        <h2>Intelligent Search</h2>
        <p>Search across all documents using advanced AI-powered semantic search</p>
      </div>

      {/* Search Input */}
      <div className="search-input-section">
        <div className="search-box">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search for regulatory information, compliance requirements, or specific topics..."
            className="search-input"
          />
          <button 
            className="search-btn"
            onClick={handleSearch}
            disabled={!query.trim() || isProcessing}
          >
            {isProcessing ? '⏳' : '🔍'}
          </button>
        </div>

        {/* Search Filters */}
        <div className="search-filters">
          <div className="filter-group">
            <label>Max Results:</label>
            <select 
              value={filters.maxResults}
              onChange={(e) => setFilters(prev => ({ ...prev, maxResults: parseInt(e.target.value) }))}
            >
              <option value={5}>5 results</option>
              <option value={10}>10 results</option>
              <option value={20}>20 results</option>
              <option value={50}>50 results</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Similarity Threshold:</label>
            <input
              type="range"
              min="0.5"
              max="1"
              step="0.05"
              value={filters.threshold}
              onChange={(e) => setFilters(prev => ({ ...prev, threshold: parseFloat(e.target.value) }))}
            />
            <span className="threshold-value">{(filters.threshold * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="search-results">
        {searchResults.length > 0 ? (
          <div className="results-list">
            <div className="results-header">
              <h3>Search Results ({searchResults.length})</h3>
            </div>
            
            {searchResults.map((result, index) => (
              <div key={index} className="result-item">
                <div className="result-header">
                  <h4 className="result-title">{result.title || result.filename}</h4>
                  <div className="result-score">
                    Relevance: {(result.score * 100).toFixed(1)}%
                  </div>
                </div>
                
                <div className="result-content">
                  <p className="result-excerpt">{result.content}</p>
                </div>
                
                <div className="result-metadata">
                  <span className="result-source">Source: {result.source}</span>
                  <span className="result-page">Page: {result.page || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : query && !isProcessing ? (
          <div className="no-results">
            <div className="no-results-content">
              <div className="no-results-icon">🔍</div>
              <h3>No Results Found</h3>
              <p>Try adjusting your search terms or lowering the similarity threshold.</p>
            </div>
          </div>
        ) : (
          <div className="search-placeholder">
            <div className="placeholder-content">
              <div className="placeholder-icon">🔍</div>
              <h3>Intelligent Document Search</h3>
              <p>Enter your search query above to find relevant information across all your documents.</p>
              
              <div className="search-tips">
                <h4>Search Tips:</h4>
                <ul>
                  <li>Use natural language queries for best results</li>
                  <li>Try specific regulatory terms or concepts</li>
                  <li>Adjust the similarity threshold to fine-tune results</li>
                  <li>Search supports semantic understanding, not just keyword matching</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchInterface;