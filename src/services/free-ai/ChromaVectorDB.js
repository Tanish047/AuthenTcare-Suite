/**
 * ChromaDB Vector Database Service - Free unlimited storage
 * Provides vector storage and similarity search capabilities
 */

class ChromaVectorDB {
  constructor() {
    this.baseURL = 'http://localhost:8000'; // ChromaDB default port
    this.collectionName = 'regulatory_documents';
    this.isAvailable = false;
    this.collection = null;
    
    this.initialize();
  }

  async initialize() {
    try {
      // Check if ChromaDB is running
      const response = await fetch(`${this.baseURL}/api/v1/heartbeat`);
      if (response.ok) {
        this.isAvailable = true;
        await this.ensureCollection();
        console.log('ChromaDB initialized successfully');
      }
    } catch (error) {
      console.log('ChromaDB not available, using in-memory storage');
      this.isAvailable = false;
      this.initializeInMemoryStorage();
    }
  }

  initializeInMemoryStorage() {
    // Fallback in-memory storage for development
    this.inMemoryStorage = {
      documents: [],
      embeddings: [],
      metadata: [],
      ids: []
    };
  }

  async ensureCollection() {
    try {
      // Try to get existing collection
      const response = await fetch(`${this.baseURL}/api/v1/collections/${this.collectionName}`);
      
      if (!response.ok) {
        // Create new collection
        await fetch(`${this.baseURL}/api/v1/collections`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: this.collectionName,
            metadata: {
              description: 'Regulatory documents and compliance data',
              created_at: new Date().toISOString()
            }
          })
        });
        console.log(`Created ChromaDB collection: ${this.collectionName}`);
      }
    } catch (error) {
      console.error('Error ensuring collection:', error);
    }
  }

  async addDocuments(documents) {
    if (!this.isAvailable) {
      return this.addDocumentsInMemory(documents);
    }

    try {
      const response = await fetch(`${this.baseURL}/api/v1/collections/${this.collectionName}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documents: documents.map(doc => doc.content),
          embeddings: documents.map(doc => doc.embedding),
          metadatas: documents.map(doc => ({
            filename: doc.filename,
            type: doc.type,
            size: doc.size,
            uploadedAt: doc.uploadedAt,
            pages: doc.pages || 1,
            source: doc.source || 'upload'
          })),
          ids: documents.map(doc => doc.id)
        })
      });

      if (response.ok) {
        console.log(`Added ${documents.length} documents to ChromaDB`);
        return { success: true, count: documents.length };
      } else {
        throw new Error(`ChromaDB add failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Error adding documents to ChromaDB:', error);
      return this.addDocumentsInMemory(documents);
    }
  }

  addDocumentsInMemory(documents) {
    // Fallback in-memory storage
    documents.forEach(doc => {
      this.inMemoryStorage.documents.push(doc.content);
      this.inMemoryStorage.embeddings.push(doc.embedding);
      this.inMemoryStorage.metadata.push({
        filename: doc.filename,
        type: doc.type,
        size: doc.size,
        uploadedAt: doc.uploadedAt
      });
      this.inMemoryStorage.ids.push(doc.id);
    });

    console.log(`Added ${documents.length} documents to in-memory storage`);
    return { success: true, count: documents.length };
  }

  async searchSimilar(queryEmbedding, options = {}) {
    const maxResults = options.maxResults || 5;
    const threshold = options.threshold || 0.7;

    if (!this.isAvailable) {
      return this.searchSimilarInMemory(queryEmbedding, options);
    }

    try {
      const response = await fetch(`${this.baseURL}/api/v1/collections/${this.collectionName}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query_embeddings: [queryEmbedding],
          n_results: maxResults,
          include: ['documents', 'metadatas', 'distances']
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Process results
        const results = [];
        const documents = data.documents?.[0] || [];
        const metadatas = data.metadatas?.[0] || [];
        const distances = data.distances?.[0] || [];

        for (let i = 0; i < documents.length; i++) {
          const similarity = 1 - distances[i]; // Convert distance to similarity
          
          if (similarity >= threshold) {
            results.push({
              content: documents[i],
              metadata: metadatas[i],
              similarity: similarity,
              confidence: similarity
            });
          }
        }

        return {
          success: true,
          results: results,
          total: results.length
        };
      } else {
        throw new Error(`ChromaDB search failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Error searching ChromaDB:', error);
      return this.searchSimilarInMemory(queryEmbedding, options);
    }
  }

  searchSimilarInMemory(queryEmbedding, options = {}) {
    const maxResults = options.maxResults || 5;
    const threshold = options.threshold || 0.7;

    if (!this.inMemoryStorage.embeddings.length) {
      return { success: true, results: [], total: 0 };
    }

    // Calculate cosine similarity for each document
    const similarities = this.inMemoryStorage.embeddings.map((embedding, index) => ({
      index,
      similarity: this.cosineSimilarity(queryEmbedding, embedding)
    }));

    // Filter by threshold and sort by similarity
    const filteredResults = similarities
      .filter(item => item.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxResults);

    // Build results
    const results = filteredResults.map(item => ({
      content: this.inMemoryStorage.documents[item.index],
      metadata: this.inMemoryStorage.metadata[item.index],
      similarity: item.similarity,
      confidence: item.similarity
    }));

    return {
      success: true,
      results: results,
      total: results.length
    };
  }

  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async getCollectionStats() {
    if (!this.isAvailable) {
      return {
        totalDocuments: this.inMemoryStorage.documents.length,
        totalChunks: this.inMemoryStorage.documents.length,
        indexSize: this.inMemoryStorage.documents.reduce((sum, doc) => sum + doc.length, 0),
        lastUpdated: new Date().toISOString()
      };
    }

    try {
      const response = await fetch(`${this.baseURL}/api/v1/collections/${this.collectionName}`);
      if (response.ok) {
        const data = await response.json();
        return {
          totalDocuments: data.count || 0,
          totalChunks: data.count || 0,
          indexSize: data.count * 1000, // Estimate
          lastUpdated: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Error getting collection stats:', error);
    }

    return {
      totalDocuments: 0,
      totalChunks: 0,
      indexSize: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  async deleteDocument(documentId) {
    if (!this.isAvailable) {
      // Remove from in-memory storage
      const index = this.inMemoryStorage.ids.indexOf(documentId);
      if (index > -1) {
        this.inMemoryStorage.documents.splice(index, 1);
        this.inMemoryStorage.embeddings.splice(index, 1);
        this.inMemoryStorage.metadata.splice(index, 1);
        this.inMemoryStorage.ids.splice(index, 1);
        return { success: true };
      }
      return { success: false, error: 'Document not found' };
    }

    try {
      const response = await fetch(`${this.baseURL}/api/v1/collections/${this.collectionName}/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: [documentId]
        })
      });

      return { success: response.ok };
    } catch (error) {
      console.error('Error deleting document:', error);
      return { success: false, error: error.message };
    }
  }

  getStatus() {
    return {
      available: this.isAvailable,
      endpoint: this.baseURL,
      collection: this.collectionName,
      provider: this.isAvailable ? 'chromadb' : 'in-memory',
      storageType: this.isAvailable ? 'unlimited-local' : 'memory'
    };
  }
}

export default ChromaVectorDB;