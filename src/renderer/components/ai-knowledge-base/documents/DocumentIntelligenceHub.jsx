import React, { useState, useEffect } from 'react';
import { performanceMonitor } from '../../../utils/performanceMonitor.js';
import { telemetry } from '../../../utils/telemetry.js';

// Import document components
import DocumentUploader from './components/DocumentUploader.jsx';
import DocumentLibrary from './components/DocumentLibrary.jsx';
import DocumentAnalyzer from './components/DocumentAnalyzer.jsx';
import KnowledgeGraph from './components/KnowledgeGraph.jsx';
import SearchInterface from './components/SearchInterface.jsx';

/**
 * Document Intelligence Hub - Advanced RAG-powered document analysis workspace
 */
const DocumentIntelligenceHub = ({ aiStatus, onStatusUpdate }) => {
  const [activeView, setActiveView] = useState('library');
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ragStats, setRagStats] = useState({
    totalDocuments: 0,
    totalChunks: 0,
    indexSize: 0,
    lastUpdated: null
  });

  // Initialize document intelligence
  useEffect(() => {
    const initializeDocuments = async () => {
      try {
        // Get existing documents from RAG system
        const ragStatus = await window.electronAPI?.ragAPI?.getStatus();
        if (ragStatus?.success) {
          setDocuments(ragStatus.documents || []);
          setRagStats(ragStatus.stats || ragStats);
        }

        await telemetry.logEvent('document_intelligence', 'initialized', {
          documentCount: ragStatus?.documents?.length || 0
        });
      } catch (error) {
        console.error('Failed to initialize documents:', error);
      }
    };

    if (aiStatus.rag.initialized) {
      initializeDocuments();
    }
  }, [aiStatus.rag.initialized]);

  // Handle document upload
  const handleDocumentUpload = async (files) => {
    setIsProcessing(true);
    const timer = performanceMonitor.startTimer('document_upload');

    try {
      const uploadResults = [];

      for (const file of files) {
        const result = await window.electronAPI.ragAPI.addDocument({
          file: file,
          metadata: {
            filename: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString()
          }
        });

        if (result.success) {
          uploadResults.push({
            id: result.documentId,
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'processed',
            chunks: result.chunks,
            uploadedAt: new Date(),
            metadata: result.metadata
          });
        }
      }

      // Update documents list
      setDocuments(prev => [...prev, ...uploadResults]);

      // Update RAG stats
      const updatedStats = await window.electronAPI.ragAPI.getStatus();
      if (updatedStats?.success) {
        setRagStats(updatedStats.stats);
      }

      await telemetry.logEvent('document_intelligence', 'documents_uploaded', {
        count: uploadResults.length,
        totalSize: uploadResults.reduce((sum, doc) => sum + doc.size, 0),
        processingTime: timer.end()
      });

    } catch (error) {
      console.error('Document upload failed:', error);
      await telemetry.logError('document_upload_failed', {
        error: error.message,
        fileCount: files.length
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle document search
  const handleDocumentSearch = async (query, filters = {}) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = performanceMonitor.startTimer('document_search');

    try {
      const searchResult = await window.electronAPI.ragAPI.search({
        query,
        maxResults: filters.maxResults || 10,
        threshold: filters.threshold || 0.7,
        documentTypes: filters.documentTypes || [],
        dateRange: filters.dateRange || null
      });

      if (searchResult.success) {
        setSearchResults(searchResult.results);
        
        await telemetry.logEvent('document_intelligence', 'search_performed', {
          query: query.substring(0, 100),
          resultCount: searchResult.results.length,
          searchTime: timer.end()
        });
      }
    } catch (error) {
      console.error('Document search failed:', error);
      setSearchResults([]);
    }
  };

  // Handle document analysis
  const handleDocumentAnalysis = async (documentId, analysisType) => {
    setIsProcessing(true);

    try {
      const result = await window.electronAPI.ragAPI.analyzeDocument({
        documentId,
        analysisType,
        options: {
          extractEntities: true,
          generateSummary: true,
          identifyTopics: true
        }
      });

      if (result.success) {
        // Update document with analysis results
        setDocuments(prev => prev.map(doc => 
          doc.id === documentId 
            ? { ...doc, analysis: result.analysis }
            : doc
        ));

        await telemetry.logEvent('document_intelligence', 'document_analyzed', {
          documentId,
          analysisType,
          entitiesFound: result.analysis?.entities?.length || 0
        });
      }
    } catch (error) {
      console.error('Document analysis failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle document deletion
  const handleDocumentDelete = async (documentId) => {
    try {
      const result = await window.electronAPI.ragAPI.removeDocument(documentId);
      
      if (result.success) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        
        // Update stats
        const updatedStats = await window.electronAPI.ragAPI.getStatus();
        if (updatedStats?.success) {
          setRagStats(updatedStats.stats);
        }

        await telemetry.logEvent('document_intelligence', 'document_deleted', {
          documentId
        });
      }
    } catch (error) {
      console.error('Document deletion failed:', error);
    }
  };

  // View navigation
  const views = [
    { id: 'library', label: 'Document Library', icon: '📚', description: 'Manage your document collection' },
    { id: 'search', label: 'Intelligent Search', icon: '🔍', description: 'Search across all documents' },
    { id: 'analyzer', label: 'Document Analyzer', icon: '🔬', description: 'Deep analysis and insights' },
    { id: 'knowledge', label: 'Knowledge Graph', icon: '🕸️', description: 'Visualize document relationships' }
  ];

  const renderActiveView = () => {
    const commonProps = {
      documents,
      selectedDocument,
      onDocumentSelect: setSelectedDocument,
      onDocumentAnalyze: handleDocumentAnalysis,
      onDocumentDelete: handleDocumentDelete,
      isProcessing,
      ragStats
    };

    switch (activeView) {
      case 'library':
        return (
          <DocumentLibrary
            {...commonProps}
            onDocumentUpload={handleDocumentUpload}
          />
        );
      case 'search':
        return (
          <SearchInterface
            {...commonProps}
            searchResults={searchResults}
            onSearch={handleDocumentSearch}
          />
        );
      case 'analyzer':
        return (
          <DocumentAnalyzer
            {...commonProps}
          />
        );
      case 'knowledge':
        return (
          <KnowledgeGraph
            {...commonProps}
          />
        );
      default:
        return <DocumentLibrary {...commonProps} />;
    }
  };

  if (!aiStatus.rag.initialized) {
    return (
      <div className="document-intelligence-disabled">
        <div className="disabled-content">
          <div className="disabled-icon">📚</div>
          <h3>Document Intelligence Unavailable</h3>
          <p>The RAG (Retrieval-Augmented Generation) engine is not initialized.</p>
          <p>Please check your AI configuration and ensure the RAG service is running.</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.electronAPI?.ragAPI?.initialize()}
          >
            Initialize RAG Engine
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="document-intelligence-hub">
      {/* Header */}
      <div className="hub-header">
        <div className="header-content">
          <h2>Document Intelligence Hub</h2>
          <p>Advanced RAG-powered document analysis and knowledge extraction</p>
        </div>
        
        {/* RAG Stats */}
        <div className="rag-stats">
          <div className="stat-item">
            <span className="stat-value">{ragStats.totalDocuments}</span>
            <span className="stat-label">Documents</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{ragStats.totalChunks}</span>
            <span className="stat-label">Chunks</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{(ragStats.indexSize / 1024 / 1024).toFixed(1)}MB</span>
            <span className="stat-label">Index Size</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="hub-navigation">
        <div className="nav-tabs">
          {views.map(view => (
            <button
              key={view.id}
              className={`nav-tab ${activeView === view.id ? 'active' : ''}`}
              onClick={() => setActiveView(view.id)}
              title={view.description}
            >
              <span className="tab-icon">{view.icon}</span>
              <span className="tab-label">{view.label}</span>
            </button>
          ))}
        </div>
        
        {/* Processing Indicator */}
        {isProcessing && (
          <div className="processing-indicator">
            <span className="processing-spinner">⏳</span>
            Processing...
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="hub-content">
        {renderActiveView()}
      </div>

      {/* Document Uploader (Global) */}
      <DocumentUploader
        onUpload={handleDocumentUpload}
        isProcessing={isProcessing}
        supportedTypes={['.pdf', '.docx', '.txt', '.md', '.json', '.xml']}
      />
    </div>
  );
};

export default DocumentIntelligenceHub;