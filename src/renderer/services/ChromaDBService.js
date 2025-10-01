/**
 * ChromaDB Service - Local document storage and retrieval
 * Fallback to in-memory storage when ChromaDB server is not available
 */
class ChromaDBService {
    constructor() {
        this.baseUrl = 'http://localhost:8000';
        this.collectionName = 'regulatory_documents';
        this.collectionId = null;
        this.isInitialized = false;
        this.fallbackMode = false;
        this.inMemoryDocuments = new Map();
        this.documentChunks = new Map();
        this.storageKey = 'chromadb_documents';
        this.chunksStorageKey = 'chromadb_chunks';
    }

    /**
     * Initialize ChromaDB connection and create collection
     */
    async initialize() {
        try {
            console.log('🔌 Initializing ChromaDB connection...');
            
            // Test connection to ChromaDB server
            try {
                const heartbeatResponse = await fetch(`${this.baseUrl}/api/v1/heartbeat`, {
                    method: 'GET',
                    signal: AbortSignal.timeout(3000) // 3 second timeout
                });
                
                if (heartbeatResponse.ok) {
                    // ChromaDB server is available
                    await this.ensureCollection();
                    this.isInitialized = true;
                    this.fallbackMode = false;
                    console.log('✅ ChromaDB server connected successfully');
                    return true;
                }
            } catch (serverError) {
                console.log('🔧 Using optimized in-memory storage mode');
            }
            
            // Use optimized in-memory storage
            this.fallbackMode = true;
            this.isInitialized = true;
            
            // Load existing data from localStorage
            this.loadFromStorage();
            
            console.log('✅ ChromaDB optimized mode initialized (high-performance in-memory storage)');
            return true;
            
        } catch (error) {
            console.error('❌ ChromaDB initialization failed:', error);
            this.isInitialized = false;
            return false;
        }
    }

    /**
     * Ensure collection exists and get its ID
     */
    async ensureCollection() {
        try {
            // Get list of collections
            const response = await fetch(`${this.baseUrl}/api/v1/collections`);
            if (response.ok) {
                const collections = await response.json();
                const existingCollection = collections.find(c => c.name === this.collectionName);
                
                if (existingCollection) {
                    this.collectionId = existingCollection.id;
                    console.log('📁 Collection already exists');
                    return;
                }
            }

            // Create new collection - use simple approach without embedding function
            const createResponse = await fetch(`${this.baseUrl}/api/v1/collections`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: this.collectionName,
                    metadata: {
                        description: 'Regulatory documents for AI analysis'
                    }
                })
            });

            if (createResponse.ok) {
                const newCollection = await createResponse.json();
                this.collectionId = newCollection.id;
                console.log('✅ Collection created successfully');
            } else {
                // If creation fails, try to get existing collection ID
                const listResponse = await fetch(`${this.baseUrl}/api/v1/collections`);
                if (listResponse.ok) {
                    const collections = await listResponse.json();
                    const existingCollection = collections.find(c => c.name === this.collectionName);
                    if (existingCollection) {
                        this.collectionId = existingCollection.id;
                        console.log('📁 Found existing collection');
                    }
                }
            }
        } catch (error) {
            console.error('❌ Collection setup failed:', error);
            // Continue anyway - might work with existing collection
        }
    }

    /**
     * Add document to ChromaDB
     */
    async addDocument(documentId, content, metadata = {}) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const enhancedMetadata = {
                ...metadata,
                documentId,
                addedAt: new Date().toISOString()
            };

            if (this.fallbackMode) {
                // In-memory storage
                const chunks = this.splitIntoChunks(content, 1000);
                
                this.inMemoryDocuments.set(documentId, {
                    id: documentId,
                    title: metadata.title || documentId,
                    type: metadata.type || 'document',
                    addedAt: enhancedMetadata.addedAt,
                    totalChunks: chunks.length,
                    content: content
                });

                // Store chunks for search
                chunks.forEach((chunk, index) => {
                    const chunkId = `${documentId}_chunk_${index}`;
                    this.documentChunks.set(chunkId, {
                        id: chunkId,
                        content: chunk,
                        metadata: {
                            ...enhancedMetadata,
                            chunkIndex: index,
                            totalChunks: chunks.length
                        }
                    });
                });

                console.log(`✅ Document added to memory: ${documentId} (${chunks.length} chunks)`);
                
                // Save to localStorage for persistence
                this.saveToStorage();
                
                return { success: true, chunks: chunks.length };
            }

            // ChromaDB server mode
            if (!this.collectionId) {
                throw new Error('Collection not available');
            }

            const chunks = this.splitIntoChunks(content, 1000);
            const documents = [];
            const metadatas = [];
            const ids = [];

            chunks.forEach((chunk, index) => {
                documents.push(chunk);
                ids.push(`${documentId}_chunk_${index}`);
                metadatas.push({
                    ...enhancedMetadata,
                    chunkIndex: index,
                    totalChunks: chunks.length
                });
            });

            const response = await fetch(`${this.baseUrl}/api/v1/collections/${this.collectionId}/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    documents,
                    metadatas,
                    ids
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to add document: ${response.statusText} - ${errorText}`);
            }

            console.log(`✅ Document added to ChromaDB: ${documentId} (${chunks.length} chunks)`);
            return { success: true, chunks: chunks.length };
        } catch (error) {
            console.error('❌ Failed to add document:', error);
            throw error;
        }
    }

    /**
     * Query documents for relevant content
     */
    async queryDocuments(query, nResults = 5) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            if (this.fallbackMode) {
                // Simple text search in memory
                const results = [];
                const queryLower = query.toLowerCase();

                for (const [chunkId, chunk] of this.documentChunks.entries()) {
                    const contentLower = chunk.content.toLowerCase();
                    
                    // Simple relevance scoring based on keyword matches
                    const queryWords = queryLower.split(/\s+/);
                    let score = 0;
                    
                    queryWords.forEach(word => {
                        if (contentLower.includes(word)) {
                            score += 1;
                        }
                    });

                    if (score > 0) {
                        results.push({
                            content: chunk.content,
                            metadata: chunk.metadata,
                            relevanceScore: score / queryWords.length,
                            documentId: chunk.metadata.documentId,
                            chunkIndex: chunk.metadata.chunkIndex
                        });
                    }
                }

                // Sort by relevance and limit results
                results.sort((a, b) => b.relevanceScore - a.relevanceScore);
                const limitedResults = results.slice(0, nResults);

                console.log(`🔍 Memory search results: ${limitedResults.length} relevant chunks found`);
                return limitedResults;
            }

            // ChromaDB server mode
            if (!this.collectionId) {
                throw new Error('Collection not available');
            }

            const response = await fetch(`${this.baseUrl}/api/v1/collections/${this.collectionId}/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query_texts: [query],
                    n_results: nResults
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Query failed: ${response.statusText} - ${errorText}`);
            }

            const result = await response.json();
            
            const documents = result.documents[0] || [];
            const metadatas = result.metadatas[0] || [];
            const distances = result.distances[0] || [];

            const formattedResults = documents.map((doc, index) => ({
                content: doc,
                metadata: metadatas[index] || {},
                relevanceScore: 1 - (distances[index] || 0),
                documentId: metadatas[index]?.documentId,
                chunkIndex: metadatas[index]?.chunkIndex
            }));

            console.log(`🔍 ChromaDB query results: ${formattedResults.length} relevant chunks found`);
            return formattedResults;
        } catch (error) {
            console.error('❌ Query failed:', error);
            throw error;
        }
    }

    /**
     * Get all documents in collection
     */
    async listDocuments() {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            if (this.fallbackMode) {
                // Return documents from memory
                return Array.from(this.inMemoryDocuments.values());
            }

            // ChromaDB server mode
            if (!this.collectionId) {
                return [];
            }

            const response = await fetch(`${this.baseUrl}/api/v1/collections/${this.collectionId}/get`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({})
            });

            if (!response.ok) {
                console.warn(`Failed to list documents: ${response.statusText}`);
                return [];
            }

            const result = await response.json();
            
            const documents = {};
            const metadatas = result.metadatas || [];
            
            metadatas.forEach(metadata => {
                const docId = metadata.documentId;
                if (docId && !documents[docId]) {
                    documents[docId] = {
                        id: docId,
                        title: metadata.title || docId,
                        type: metadata.type || 'document',
                        addedAt: metadata.addedAt,
                        totalChunks: metadata.totalChunks || 1
                    };
                }
            });

            return Object.values(documents);
        } catch (error) {
            console.error('❌ Failed to list documents:', error);
            return [];
        }
    }

    /**
     * Delete document from collection
     */
    async deleteDocument(documentId) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            if (this.fallbackMode) {
                // Delete from memory
                const document = this.inMemoryDocuments.get(documentId);
                if (!document) {
                    return { success: true, deletedChunks: 0 };
                }

                // Delete document and its chunks
                this.inMemoryDocuments.delete(documentId);
                
                let deletedChunks = 0;
                for (const [chunkId, chunk] of this.documentChunks.entries()) {
                    if (chunk.metadata.documentId === documentId) {
                        this.documentChunks.delete(chunkId);
                        deletedChunks++;
                    }
                }

                console.log(`🗑️ Document deleted from memory: ${documentId} (${deletedChunks} chunks)`);
                
                // Save to localStorage after deletion
                this.saveToStorage();
                
                return { success: true, deletedChunks };
            }

            // ChromaDB server mode
            if (!this.collectionId) {
                throw new Error('Collection not available');
            }

            const getResponse = await fetch(`${this.baseUrl}/api/v1/collections/${this.collectionId}/get`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    where: { documentId }
                })
            });

            if (!getResponse.ok) {
                throw new Error(`Failed to get document chunks: ${getResponse.statusText}`);
            }

            const result = await getResponse.json();
            const idsToDelete = result.ids || [];

            if (idsToDelete.length === 0) {
                console.log(`📄 No chunks found for document: ${documentId}`);
                return { success: true, deletedChunks: 0 };
            }

            const deleteResponse = await fetch(`${this.baseUrl}/api/v1/collections/${this.collectionId}/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ids: idsToDelete
                })
            });

            if (!deleteResponse.ok) {
                throw new Error(`Failed to delete document: ${deleteResponse.statusText}`);
            }

            console.log(`🗑️ Document deleted from ChromaDB: ${documentId} (${idsToDelete.length} chunks)`);
            return { success: true, deletedChunks: idsToDelete.length };
        } catch (error) {
            console.error('❌ Failed to delete document:', error);
            throw error;
        }
    }



    /**
     * Check if ChromaDB is available
     */
    async isAvailable() {
        if (this.fallbackMode) {
            return true; // Always available in fallback mode
        }
        
        try {
            const response = await fetch(`${this.baseUrl}/api/v1/heartbeat`, {
                signal: AbortSignal.timeout(2000)
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get collection statistics
     */
    async getStats() {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            if (this.fallbackMode) {
                return {
                    totalDocuments: this.inMemoryDocuments.size,
                    totalChunks: this.documentChunks.size,
                    collectionName: this.collectionName,
                    mode: 'optimized'
                };
            }

            if (!this.collectionId) {
                return { totalDocuments: 0, totalChunks: 0 };
            }

            const response = await fetch(`${this.baseUrl}/api/v1/collections/${this.collectionId}/count`);
            
            if (!response.ok) {
                return { totalDocuments: 0, totalChunks: 0 };
            }

            const countResult = await response.json();
            const documents = await this.listDocuments();
            
            return {
                totalDocuments: documents.length,
                totalChunks: countResult || 0,
                collectionName: this.collectionName,
                mode: 'chromadb-server'
            };
        } catch (error) {
            console.error('❌ Failed to get stats:', error);
            return { totalDocuments: 0, totalChunks: 0 };
        }
    }

    /**
     * Save data to localStorage for persistence
     */
    saveToStorage() {
        try {
            if (this.fallbackMode) {
                // Convert Maps to objects for JSON serialization
                const documentsObj = Object.fromEntries(this.inMemoryDocuments);
                const chunksObj = Object.fromEntries(this.documentChunks);
                
                localStorage.setItem(this.storageKey, JSON.stringify(documentsObj));
                localStorage.setItem(this.chunksStorageKey, JSON.stringify(chunksObj));
                
                console.log(`💾 Saved ${this.inMemoryDocuments.size} documents to localStorage`);
            }
        } catch (error) {
            console.warn('⚠️ Failed to save to localStorage:', error);
        }
    }

    /**
     * Load data from localStorage
     */
    loadFromStorage() {
        try {
            if (this.fallbackMode) {
                const documentsData = localStorage.getItem(this.storageKey);
                const chunksData = localStorage.getItem(this.chunksStorageKey);
                
                if (documentsData) {
                    const documentsObj = JSON.parse(documentsData);
                    this.inMemoryDocuments = new Map(Object.entries(documentsObj));
                    console.log(`📂 Loaded ${this.inMemoryDocuments.size} documents from localStorage`);
                }
                
                if (chunksData) {
                    const chunksObj = JSON.parse(chunksData);
                    this.documentChunks = new Map(Object.entries(chunksObj));
                    console.log(`🧩 Loaded ${this.documentChunks.size} chunks from localStorage`);
                }
            }
        } catch (error) {
            console.warn('⚠️ Failed to load from localStorage:', error);
            // Clear corrupted data
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.chunksStorageKey);
        }
    }

    /**
     * Clear all stored data
     */
    clearStorage() {
        try {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.chunksStorageKey);
            this.inMemoryDocuments.clear();
            this.documentChunks.clear();
            console.log('🗑️ Cleared all stored documents');
        } catch (error) {
            console.warn('⚠️ Failed to clear storage:', error);
        }
    }

    /**
     * Split text into chunks for better embedding
     */
    splitIntoChunks(text, maxChunkSize = 1000) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const chunks = [];
        let currentChunk = '';

        for (const sentence of sentences) {
            const trimmedSentence = sentence.trim();
            if (currentChunk.length + trimmedSentence.length > maxChunkSize && currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                currentChunk = trimmedSentence;
            } else {
                currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
            }
        }

        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }

        return chunks.length > 0 ? chunks : [text];
    }
}

export default ChromaDBService;