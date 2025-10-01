import { useState, useEffect, useCallback } from 'react';
import { getSharedChromaDBService } from '../services/SharedChromaDBService.js';
import '../styles/document-hub.css';

/**
 * Document Hub - Upload and manage documents for AI analysis
 */
const DocumentHub = ({ onDocumentAdded, onDocumentDeleted }) => {
    const [chromaService] = useState(() => getSharedChromaDBService());
    const [documents, setDocuments] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [stats, setStats] = useState({ totalDocuments: 0, totalChunks: 0 });
    const [isConnected, setIsConnected] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [selectedDocuments, setSelectedDocuments] = useState(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    // Initialize ChromaDB connection
    useEffect(() => {
        initializeChromaDB();
    }, []);

    const initializeChromaDB = async () => {
        try {
            // Check if service is already initialized
            if (chromaService.isInitialized) {
                console.log('🔧 ChromaDB already initialized, loading data...');
                setIsConnected(true);
                await loadDocuments();
                await loadStats();
                return;
            }

            console.log('🔌 Initializing ChromaDB for the first time...');
            const connected = await chromaService.initialize();
            setIsConnected(connected);
            
            if (connected) {
                await loadDocuments();
                await loadStats();
            }
        } catch (error) {
            console.error('❌ ChromaDB connection failed:', error);
            setIsConnected(false);
        }
    };

    const loadDocuments = async () => {
        try {
            console.log('📋 Loading documents from ChromaDB...');
            const docs = await chromaService.listDocuments();
            console.log(`📄 Loaded ${docs.length} documents:`, docs);
            setDocuments(docs);
        } catch (error) {
            console.error('❌ Failed to load documents:', error);
        }
    };

    const loadStats = async () => {
        try {
            const statsData = await chromaService.getStats();
            setStats(statsData);
        } catch (error) {
            console.error('❌ Failed to load stats:', error);
        }
    };

    // Handle file upload
    const handleFileUpload = useCallback(async (files) => {
        if (!files || files.length === 0 || !isConnected) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                console.log(`📄 Processing file: ${file.name}`);

                // Read file content
                const content = await readFileContent(file);
                
                // Generate document ID
                const documentId = `doc_${Date.now()}_${i}`;
                
                // Prepare metadata
                const metadata = {
                    title: file.name,
                    type: file.type || 'application/octet-stream',
                    size: file.size,
                    uploadedAt: new Date().toISOString(),
                    fileName: file.name
                };

                // Add to ChromaDB
                console.log(`🔧 Adding document to ChromaDB: ${documentId}`);
                const result = await chromaService.addDocument(documentId, content, metadata);
                console.log(`✅ Document added result:`, result);
                
                // Update progress
                setUploadProgress(((i + 1) / files.length) * 100);
            }

            // Refresh data
            console.log('🔄 Refreshing document list...');
            await loadDocuments();
            await loadStats();
            console.log(`📊 Updated stats: ${stats.totalDocuments} docs, ${stats.totalChunks} chunks`);
            
            // Notify parent component
            if (onDocumentAdded) {
                onDocumentAdded(files.length);
            }

            console.log(`✅ Successfully uploaded ${files.length} document(s)`);
        } catch (error) {
            console.error('❌ Upload failed:', error);
            alert(`Upload failed: ${error.message}`);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    }, [isConnected, chromaService, onDocumentAdded]);

    // Read file content based on type
    const readFileContent = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                let content = e.target.result;
                
                // For text files, use as-is
                if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
                    resolve(content);
                } else {
                    // For other files, extract text representation
                    // This is a simple approach - in production, you'd want proper PDF/Word parsing
                    resolve(`Document: ${file.name}\nType: ${file.type}\nSize: ${file.size} bytes\nContent: ${content.substring(0, 5000)}...`);
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            
            // Read as text
            reader.readAsText(file);
        });
    };

    // Handle document deletion
    const handleDeleteDocument = async (documentId, title) => {
        if (!confirm(`Delete document "${title}"?`)) return;

        try {
            await chromaService.deleteDocument(documentId);
            await loadDocuments();
            await loadStats();
            
            if (onDocumentDeleted) {
                onDocumentDeleted(documentId);
            }
            
            console.log(`🗑️ Document deleted: ${title}`);
        } catch (error) {
            console.error('❌ Delete failed:', error);
            alert(`Delete failed: ${error.message}`);
        }
    };

    // Handle clearing all documents
    const handleClearAllDocuments = async () => {
        if (!confirm(`Delete all ${documents.length} documents? This action cannot be undone.`)) return;

        try {
            // Delete each document
            for (const doc of documents) {
                await chromaService.deleteDocument(doc.id);
            }
            
            // Alternatively, use the clearStorage method for faster clearing
            // chromaService.clearStorage();
            
            await loadDocuments();
            await loadStats();
            
            console.log(`🗑️ All documents cleared`);
        } catch (error) {
            console.error('❌ Clear all failed:', error);
            alert(`Clear all failed: ${error.message}`);
        }
    };

    // Selection handlers
    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedDocuments(new Set());
    };

    const handleDocumentSelect = (documentId, isSelected) => {
        const newSelected = new Set(selectedDocuments);
        if (isSelected) {
            newSelected.add(documentId);
        } else {
            newSelected.delete(documentId);
        }
        setSelectedDocuments(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedDocuments.size === documents.length) {
            setSelectedDocuments(new Set());
        } else {
            setSelectedDocuments(new Set(documents.map(doc => doc.id)));
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedDocuments.size === 0) return;
        
        if (!confirm(`Delete ${selectedDocuments.size} selected documents? This action cannot be undone.`)) return;

        try {
            // Delete selected documents
            for (const documentId of selectedDocuments) {
                await chromaService.deleteDocument(documentId);
            }
            
            await loadDocuments();
            await loadStats();
            setSelectedDocuments(new Set());
            
            console.log(`🗑️ Deleted ${selectedDocuments.size} selected documents`);
        } catch (error) {
            console.error('❌ Delete selected failed:', error);
            alert(`Delete selected failed: ${error.message}`);
        }
    };

    // Drag and drop handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        handleFileUpload(files);
    };

    // File input handler
    const handleFileInputChange = (e) => {
        const files = Array.from(e.target.files);
        handleFileUpload(files);
        e.target.value = ''; // Reset input
    };

    if (!isConnected) {
        return (
            <div className="document-hub-container">
                <div className="connection-error">
                    <h3>🚀 Initializing Optimized Storage</h3>
                    <p>Setting up high-performance document storage...</p>
                    <button onClick={initializeChromaDB} className="btn btn-primary">
                        🔄 Initialize Storage
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="document-hub-container">
            {/* Header */}
            <div className="document-hub-header">
                <h3>📄 Document Hub</h3>
                <div className="hub-stats">
                    <span className="stat-item">📚 {stats.totalDocuments} docs</span>
                    <span className="stat-item">🧩 {stats.totalChunks} chunks</span>
                    <span className="stat-item">🚀 Optimized</span>
                </div>
            </div>

            {/* Upload Area */}
            <div 
                className={`upload-area ${dragOver ? 'drag-over' : ''} ${isUploading ? 'uploading' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {isUploading ? (
                    <div className="upload-progress">
                        <div className="progress-bar">
                            <div 
                                className="progress-fill" 
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                        <p>Uploading... {Math.round(uploadProgress)}%</p>
                    </div>
                ) : (
                    <>
                        <div className="upload-icon">📁</div>
                        <p className="upload-text">
                            Drag & drop documents here or{' '}
                            <label className="file-input-label">
                                browse files
                                <input
                                    type="file"
                                    multiple
                                    accept=".txt,.md,.pdf,.doc,.docx"
                                    onChange={handleFileInputChange}
                                    className="file-input-hidden"
                                />
                            </label>
                        </p>
                        <p className="upload-hint">
                            Supports: TXT, MD, PDF, DOC, DOCX
                        </p>
                    </>
                )}
            </div>

            {/* Documents List */}
            <div className="documents-list">
                <div className="documents-header">
                    <h4>📋 Uploaded Documents</h4>
                    <div className="documents-actions">
                        {documents.length > 0 && (
                            <button 
                                onClick={toggleSelectionMode} 
                                className={`btn btn-sm ${isSelectionMode ? 'btn-primary' : 'btn-secondary'}`}
                            >
                                {isSelectionMode ? '✅ Exit Select' : '☑️ Select'}
                            </button>
                        )}
                        {isSelectionMode && (
                            <>
                                <button onClick={handleSelectAll} className="btn btn-secondary btn-sm">
                                    {selectedDocuments.size === documents.length ? '☐ Deselect All' : '☑️ Select All'}
                                </button>
                                {selectedDocuments.size > 0 && (
                                    <button onClick={handleDeleteSelected} className="btn btn-danger btn-sm">
                                        🗑️ Delete Selected ({selectedDocuments.size})
                                    </button>
                                )}
                            </>
                        )}
                        <button onClick={loadDocuments} className="btn btn-secondary btn-sm">
                            🔄 Refresh
                        </button>
                        {documents.length > 0 && !isSelectionMode && (
                            <button onClick={handleClearAllDocuments} className="btn btn-danger btn-sm">
                                🗑️ Clear All ({documents.length})
                            </button>
                        )}
                    </div>
                </div>
                
                {documents.length === 0 ? (
                    <div className="no-documents">
                        <p>No documents uploaded yet</p>
                        <p className="hint">Upload regulatory documents to enable AI-powered analysis</p>
                    </div>
                ) : (
                    <div className="documents-grid">
                        {documents.map(doc => (
                            <div key={doc.id} className={`document-card ${isSelectionMode ? 'selection-mode' : ''} ${selectedDocuments.has(doc.id) ? 'selected' : ''}`}>
                                {isSelectionMode && (
                                    <div className="document-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedDocuments.has(doc.id)}
                                            onChange={(e) => handleDocumentSelect(doc.id, e.target.checked)}
                                            className="document-select-checkbox"
                                        />
                                    </div>
                                )}
                                <div className="document-info">
                                    <div className="document-title">{doc.title}</div>
                                    <div className="document-meta">
                                        <span className="document-type">{doc.type}</span>
                                        <span className="document-chunks">{doc.totalChunks} chunks</span>
                                    </div>
                                    <div className="document-date">
                                        {new Date(doc.addedAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="document-actions">
                                    {!isSelectionMode && (
                                        <button
                                            onClick={() => handleDeleteDocument(doc.id, doc.title)}
                                            className="btn btn-danger btn-sm"
                                            title="Delete document"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Usage Instructions */}
            <div className="usage-instructions">
                <h4>💡 How to Use</h4>
                <ol>
                    <li><strong>Upload Documents</strong>: Drag regulatory files into the upload area</li>
                    <li><strong>Ask Questions</strong>: Use the AI chat to ask about your uploaded documents</li>
                    <li><strong>Get Answers</strong>: AI will search your documents and provide relevant answers</li>
                    <li><strong>Manage Documents</strong>: Delete individual documents, select multiple, or clear all</li>
                    <li><strong>Batch Operations</strong>: Click "Select" to choose multiple documents for deletion</li>
                </ol>
                <p className="privacy-note">
                    🔒 <strong>Privacy Guaranteed</strong>: All documents stay on your computer and persist across sessions.
                </p>
            </div>
        </div>
    );
};

export default DocumentHub;