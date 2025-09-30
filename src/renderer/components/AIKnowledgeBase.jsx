import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRAG } from '../hooks/useRAG';

const AIKnowledgeBase = () => {
  const {
    isInitialized,
    isInitializing,
    isIndexing,
    isQuerying,
    status,
    documents,
    analytics,
    indexingProgress,
    initializeRAG,
    query,
    indexMultipleFiles,
    selectFiles,
    selectFolder,
    semanticSearch,
    hybridSearch,
    crossModalSearch,
  } = useRAG();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // grid, list, timeline
  const [sortBy, setSortBy] = useState('recent'); // recent, relevance, size, type
  const [filterType, setFilterType] = useState('all'); // all, documents, images, audio, video, structured
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Initialize RAG on mount
  useEffect(() => {
    if (!isInitialized && !isInitializing) {
      initializeRAG();
    }
  }, [isInitialized, isInitializing, initializeRAG]);

  // Mock data for demonstration - replace with real data
  const mockDocuments = [
    {
      id: 1,
      title: 'FDA 510(k) Submission Guidelines',
      type: 'pdf',
      size: '2.4 MB',
      pages: 45,
      uploadDate: '2024-01-15',
      tags: ['FDA', '510k', 'Medical Device', 'Regulatory'],
      summary:
        'Comprehensive guide for FDA 510(k) premarket submissions including requirements, timelines, and best practices.',
      confidence: 0.95,
      thumbnail: '📄',
      status: 'processed',
    },
    {
      id: 2,
      title: 'EMA Clinical Trial Regulation',
      type: 'docx',
      size: '1.8 MB',
      pages: 32,
      uploadDate: '2024-01-14',
      tags: ['EMA', 'Clinical Trials', 'Europe', 'Regulation'],
      summary:
        'European Medicines Agency guidelines for clinical trial applications and regulatory compliance.',
      confidence: 0.92,
      thumbnail: '📋',
      status: 'processed',
    },
    {
      id: 3,
      title: 'CDSCO Device Registration Process',
      type: 'pdf',
      size: '3.1 MB',
      pages: 58,
      uploadDate: '2024-01-13',
      tags: ['CDSCO', 'India', 'Registration', 'Medical Device'],
      summary:
        'Complete guide to Central Drugs Standard Control Organization device registration procedures.',
      confidence: 0.88,
      thumbnail: '🏥',
      status: 'processing',
    },
    {
      id: 4,
      title: 'ISO 13485 Quality Management',
      type: 'pdf',
      size: '4.2 MB',
      pages: 78,
      uploadDate: '2024-01-12',
      tags: ['ISO', 'Quality', 'Management', 'Standards'],
      summary:
        'International standard for quality management systems in medical device manufacturing.',
      confidence: 0.97,
      thumbnail: '⚙️',
      status: 'processed',
    },
    {
      id: 5,
      title: 'Medical Device Classification Guide',
      type: 'xlsx',
      size: '856 KB',
      pages: 12,
      uploadDate: '2024-01-11',
      tags: ['Classification', 'Risk Assessment', 'Regulatory'],
      summary:
        'Comprehensive classification matrix for medical devices across different regulatory frameworks.',
      confidence: 0.91,
      thumbnail: '📊',
      status: 'processed',
    },
  ];

  const allTags = useMemo(() => {
    const tags = new Set();
    mockDocuments.forEach(doc => doc.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, []);

  const filteredDocuments = useMemo(() => {
    let filtered = mockDocuments;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        doc =>
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(doc => selectedTags.every(tag => doc.tags.includes(tag)));
    }

    // Filter by type
    if (filterType !== 'all') {
      const typeMap = {
        documents: ['pdf', 'docx', 'txt'],
        images: ['jpg', 'png', 'svg'],
        audio: ['mp3', 'wav'],
        video: ['mp4', 'avi'],
        structured: ['xlsx', 'csv', 'json'],
      };
      filtered = filtered.filter(doc => typeMap[filterType]?.includes(doc.type));
    }

    // Sort documents
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.uploadDate) - new Date(a.uploadDate);
        case 'relevance':
          return b.confidence - a.confidence;
        case 'size':
          return parseFloat(b.size) - parseFloat(a.size);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedTags, filterType, sortBy]);

  const handleFileUpload = useCallback(
    async files => {
      try {
        if (files && files.length > 0) {
          await indexMultipleFiles(Array.from(files));
          setShowUploadModal(false);
        }
      } catch (error) {
        console.error('File upload failed:', error);
      }
    },
    [indexMultipleFiles]
  );

  const handleDrop = useCallback(
    e => {
      e.preventDefault();
      setDragOver(false);
      const files = e.dataTransfer.files;
      handleFileUpload(files);
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback(e => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(e => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const getFileIcon = type => {
    const icons = {
      pdf: '📄',
      docx: '📝',
      xlsx: '📊',
      txt: '📃',
      jpg: '🖼️',
      png: '🖼️',
      mp3: '🎵',
      mp4: '🎬',
      csv: '📈',
    };
    return icons[type] || '📁';
  };

  const getStatusColor = status => {
    switch (status) {
      case 'processed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-blue-900 flex items-center justify-center">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            {isInitializing ? (
              <div className="relative">
                <div className="animate-spin w-10 h-10 border-4 border-white/30 border-t-white rounded-full"></div>
                <div className="absolute inset-0 animate-ping w-10 h-10 border-4 border-white/20 rounded-full"></div>
              </div>
            ) : (
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {isInitializing ? 'Initializing Knowledge Base' : 'Knowledge Base Ready'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            {isInitializing
              ? 'Setting up your intelligent document repository...'
              : 'Ready to organize and analyze your regulatory documents.'}
          </p>
          {!isInitializing && (
            <button
              onClick={initializeRAG}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Launch Knowledge Base
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(156, 146, 172, 0.1) 0%, transparent 50%), 
                             radial-gradient(circle at 75% 75%, rgba(156, 146, 172, 0.1) 0%, transparent 50%)`,
            }}
          ></div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Drag Overlay */}
        {dragOver && (
          <div className="fixed inset-0 bg-blue-500/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white/90 dark:bg-gray-800/90 rounded-3xl p-12 text-center shadow-2xl border-2 border-dashed border-blue-500">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Drop Files Here
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Release to upload documents to your knowledge base
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white/10 backdrop-blur-2xl border-b border-white/20 sticky top-0 z-40 shadow-2xl">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-600 rounded-2xl blur opacity-75 animate-pulse"></div>
                    <svg
                      className="w-8 h-8 text-white relative z-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                    AI Knowledge Base
                  </h1>
                  <p className="text-lg text-white/80 font-medium">
                    Intelligent document repository and analysis
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Upload Button */}
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-600 hover:from-purple-400 hover:via-indigo-400 hover:to-blue-500 text-white font-bold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-purple-500/25 transform hover:scale-110 transition-all duration-300 flex items-center space-x-3 group"
                >
                  <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <span className="text-lg">Add Documents</span>
                </button>

                {/* Analytics */}
                {analytics && (
                  <div className="hidden md:flex items-center space-x-6 bg-white/15 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/20 shadow-xl">
                    <div className="flex items-center space-x-2 text-white">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-bold text-lg">
                          {analytics.documentsIndexed || mockDocuments.length}
                        </div>
                        <div className="text-xs text-white/70">Documents</div>
                      </div>
                    </div>
                    <div className="w-px h-8 bg-white/30"></div>
                    <div className="flex items-center space-x-2 text-white">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="font-bold text-lg">
                          {Math.round(
                            mockDocuments.reduce((acc, doc) => acc + parseFloat(doc.size), 0) * 10
                          ) / 10}
                        </div>
                        <div className="text-xs text-white/70">MB Total</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Search Bar */}
              <div className="lg:col-span-2 relative">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <svg
                    className="w-6 h-6 text-white/60"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search documents, tags, or content..."
                  className="w-full pl-16 pr-6 py-4 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-lg leading-relaxed transition-all duration-300 shadow-xl focus:shadow-2xl focus:scale-[1.02] transform"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-white/20 backdrop-blur-xl rounded-2xl p-1.5 border border-white/30">
                {[
                  { key: 'grid', icon: '⊞', label: 'Grid' },
                  { key: 'list', icon: '☰', label: 'List' },
                  { key: 'timeline', icon: '📅', label: 'Timeline' },
                ].map(mode => (
                  <button
                    key={mode.key}
                    onClick={() => setViewMode(mode.key)}
                    className={`flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      viewMode === mode.key
                        ? 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white shadow-xl'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                    title={mode.label}
                  >
                    <span className="text-lg">{mode.icon}</span>
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-6 py-4 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl text-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-300 shadow-xl focus:shadow-2xl text-lg font-medium"
                style={{ backgroundImage: 'none' }}
              >
                <option value="recent" className="bg-purple-900 text-white">
                  Most Recent
                </option>
                <option value="relevance" className="bg-purple-900 text-white">
                  Highest Confidence
                </option>
                <option value="size" className="bg-purple-900 text-white">
                  File Size
                </option>
                <option value="type" className="bg-purple-900 text-white">
                  File Type
                </option>
              </select>
            </div>

            {/* Tags Filter */}
            {allTags.length > 0 && (
              <div className="mt-6">
                <div className="flex flex-wrap gap-3">
                  <span className="text-lg font-semibold text-white py-2 flex items-center">
                    <span className="w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full mr-3"></span>
                    Tags:
                  </span>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTags(prev =>
                          prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                        );
                      }}
                      className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-300 transform hover:scale-105 ${
                        selectedTags.includes(tag)
                          ? 'bg-gradient-to-r from-purple-400 to-indigo-500 border-purple-300 text-white shadow-xl'
                          : 'bg-white/20 border-white/30 text-white hover:bg-white/30 hover:border-white/50'
                      }`}
                    >
                      {tag}
                      {selectedTags.includes(tag) && <span className="ml-2 text-white/80">×</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Processing Status */}
          {isIndexing && (
            <div className="mb-8 bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 transform hover:scale-[1.01] transition-all duration-500">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="animate-spin w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full"></div>
                  <div className="absolute inset-0 animate-ping w-12 h-12 border-4 border-purple-400/20 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">Processing Documents</h3>
                  {indexingProgress && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-lg text-white">
                        <span className="font-medium">Progress</span>
                        <span className="font-bold">{indexingProgress.percentage || 0}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-600 h-3 rounded-full transition-all duration-500 progress-bar"
                          style={{ width: `${indexingProgress.percentage || 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Documents Grid/List */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDocuments.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocument(doc)}
                  className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 cursor-pointer group"
                >
                  {/* Document Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">
                      {doc.thumbnail}
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-xl text-sm font-semibold border-2 ${getStatusColor(doc.status)} shadow-lg`}
                    >
                      {doc.status}
                    </div>
                  </div>

                  {/* Document Info */}
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-purple-300 transition-colors duration-300">
                    {doc.title}
                  </h3>

                  <p className="text-base text-white/80 mb-6 line-clamp-3 leading-relaxed">
                    {doc.summary}
                  </p>

                  {/* Metadata */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between text-sm text-white/70">
                      <span className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-lg">
                        <span className="text-lg">{getFileIcon(doc.type)}</span>
                        <span className="font-medium">{doc.type.toUpperCase()}</span>
                      </span>
                      <span className="bg-white/10 px-3 py-1.5 rounded-lg font-medium">
                        {doc.size}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-white/70">
                      <span className="bg-white/10 px-3 py-1.5 rounded-lg font-medium">
                        {doc.pages} pages
                      </span>
                      <span className="bg-white/10 px-3 py-1.5 rounded-lg font-medium">
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Confidence Score */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white/80">AI Confidence:</span>
                        <span className="text-sm font-bold text-white">
                          {Math.round(doc.confidence * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${doc.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {doc.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 bg-gradient-to-r from-purple-400/20 to-indigo-500/20 text-purple-200 text-sm rounded-lg border border-purple-400/30 backdrop-blur-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                    {doc.tags.length > 3 && (
                      <span className="px-3 py-1.5 bg-white/10 text-white/70 text-sm rounded-lg border border-white/20 backdrop-blur-sm font-medium">
                        +{doc.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="space-y-4">
              {filteredDocuments.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocument(doc)}
                  className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6 hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-300 cursor-pointer modern-card group"
                >
                  <div className="flex items-center space-x-6">
                    {/* Document Icon */}
                    <div className="text-3xl flex-shrink-0">{doc.thumbnail}</div>

                    {/* Document Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                          {doc.title}
                        </h3>
                        <div
                          className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(doc.status)} flex-shrink-0 ml-4`}
                        >
                          {doc.status}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {doc.summary}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center space-x-1">
                            <span>{getFileIcon(doc.type)}</span>
                            <span>{doc.type.toUpperCase()}</span>
                          </span>
                          <span>{doc.size}</span>
                          <span>{doc.pages} pages</span>
                          <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Confidence:
                          </span>
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full"
                              style={{ width: `${doc.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {Math.round(doc.confidence * 100)}%
                          </span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {doc.tags.slice(0, 5).map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs rounded-md border border-purple-200 dark:border-purple-800"
                          >
                            {tag}
                          </span>
                        ))}
                        {doc.tags.length > 5 && (
                          <span className="px-2 py-1 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-md border border-gray-200 dark:border-gray-600">
                            +{doc.tags.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'timeline' && (
            <div className="space-y-8">
              {Object.entries(
                filteredDocuments.reduce((acc, doc) => {
                  const date = new Date(doc.uploadDate).toLocaleDateString();
                  if (!acc[date]) acc[date] = [];
                  acc[date].push(doc);
                  return acc;
                }, {})
              ).map(([date, docs]) => (
                <div key={date} className="relative">
                  {/* Timeline Date */}
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl font-semibold text-sm shadow-lg">
                      {date}
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent ml-4"></div>
                  </div>

                  {/* Documents for this date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ml-8">
                    {docs.map(doc => (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDocument(doc)}
                        className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/50 p-4 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer modern-card group"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl flex-shrink-0">{doc.thumbnail}</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2 text-sm">
                              {doc.title}
                            </h4>
                            <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                              <span>{doc.type.toUpperCase()}</span>
                              <span>•</span>
                              <span>{doc.size}</span>
                              <span>•</span>
                              <span>{Math.round(doc.confidence * 100)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredDocuments.length === 0 && (
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <svg
                  className="w-16 h-16 text-white/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-white mb-6">
                {searchQuery || selectedTags.length > 0 ? 'No documents found' : 'No documents yet'}
              </h3>
              <p className="text-xl text-white/80 max-w-lg mx-auto mb-10 leading-relaxed">
                {searchQuery || selectedTags.length > 0
                  ? "Try adjusting your search criteria or filters to find what you're looking for."
                  : 'Upload your first documents to start building your intelligent knowledge base.'}
              </p>
              {!searchQuery && selectedTags.length === 0 && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-600 hover:from-purple-400 hover:via-indigo-400 hover:to-blue-500 text-white font-bold px-10 py-5 rounded-2xl shadow-2xl hover:shadow-purple-500/25 transform hover:scale-110 transition-all duration-300 text-lg"
                >
                  Upload Documents
                </button>
              )}
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-10 max-w-lg w-full">
              <div className="text-center">
                <div className="relative mx-auto mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-600 rounded-2xl blur opacity-75 animate-pulse"></div>
                    <svg
                      className="w-10 h-10 text-white relative z-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Upload Documents</h3>
                <p className="text-lg text-white/80 mb-8 leading-relaxed">
                  Add documents to your knowledge base for AI analysis and intelligent search.
                </p>

                <div className="space-y-4">
                  <button
                    onClick={async () => {
                      try {
                        const result = await selectFiles();
                        if (result.success && result.files.length > 0) {
                          await handleFileUpload(result.files);
                        }
                      } catch (error) {
                        console.error('File selection failed:', error);
                      }
                    }}
                    className="w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-600 hover:from-purple-400 hover:via-indigo-400 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 text-lg"
                  >
                    Choose Files
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        const result = await selectFolder();
                        if (result.success && result.folder) {
                          // Handle folder upload
                          setShowUploadModal(false);
                        }
                      } catch (error) {
                        console.error('Folder selection failed:', error);
                      }
                    }}
                    className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-xl text-white font-bold py-4 px-8 rounded-2xl border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 text-lg"
                  >
                    Choose Folder
                  </button>
                </div>

                <div className="mt-8 pt-6 border-t border-white/20">
                  <p className="text-sm text-white/70 leading-relaxed">
                    Supported formats: PDF, DOCX, TXT, XLSX, CSV, Images, Audio, Video
                  </p>
                </div>

                <button
                  onClick={() => setShowUploadModal(false)}
                  className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-xl rounded-xl text-white hover:text-white transition-all duration-300 flex items-center justify-center transform hover:scale-110"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Document Detail Modal */}
        {selectedDocument && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{selectedDocument.thumbnail}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedDocument.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center space-x-1">
                        <span>{getFileIcon(selectedDocument.type)}</span>
                        <span>{selectedDocument.type.toUpperCase()}</span>
                      </span>
                      <span>{selectedDocument.size}</span>
                      <span>{selectedDocument.pages} pages</span>
                      <span>{new Date(selectedDocument.uploadDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDocument(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Status and Confidence */}
                <div className="flex items-center justify-between">
                  <div
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${getStatusColor(selectedDocument.status)}`}
                  >
                    {selectedDocument.status}
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Confidence:</span>
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                        style={{ width: `${selectedDocument.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {Math.round(selectedDocument.confidence * 100)}%
                    </span>
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Summary</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {selectedDocument.summary}
                  </p>
                </div>

                {/* Tags */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-sm rounded-lg border border-purple-200 dark:border-purple-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                    Open Document
                  </button>
                  <button className="flex-1 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200">
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIKnowledgeBase;
