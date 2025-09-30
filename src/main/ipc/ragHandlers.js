import { ipcMain, BrowserWindow, dialog } from 'electron';
import { ragEngine } from '../../services/rag/ragEngine.js';
import { telemetry } from '../../services/telemetry.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * RAG IPC Handlers - Bridge between renderer and RAG engine
 */
export class RAGHandlers {
  constructor() {
    this.setupHandlers();
    this.setupEventForwarding();
  }

  setupHandlers() {
    // Core RAG operations
    ipcMain.handle('rag-initialize', this.initializeRAG.bind(this));
    ipcMain.handle('rag-index-document', this.indexDocument.bind(this));
    ipcMain.handle('rag-index-folder', this.indexFolder.bind(this));
    ipcMain.handle('rag-query', this.query.bind(this));
    ipcMain.handle('rag-get-status', this.getStatus.bind(this));

    // Document management
    ipcMain.handle('rag-list-documents', this.listDocuments.bind(this));
    ipcMain.handle('rag-remove-document', this.removeDocument.bind(this));
    ipcMain.handle('rag-update-document', this.updateDocument.bind(this));

    // Search and retrieval
    ipcMain.handle('rag-semantic-search', this.semanticSearch.bind(this));
    ipcMain.handle('rag-hybrid-search', this.hybridSearch.bind(this));
    ipcMain.handle('rag-cross-modal-search', this.crossModalSearch.bind(this));

    // Analytics and insights
    ipcMain.handle('rag-get-analytics', this.getAnalytics.bind(this));
    ipcMain.handle('rag-get-similar-documents', this.getSimilarDocuments.bind(this));
    ipcMain.handle('rag-get-document-clusters', this.getDocumentClusters.bind(this));

    // Configuration
    ipcMain.handle('rag-update-config', this.updateConfig.bind(this));
    ipcMain.handle('rag-get-config', this.getConfig.bind(this));

    // File operations
    ipcMain.handle('rag-select-files', this.selectFiles.bind(this));
    ipcMain.handle('rag-select-folder', this.selectFolder.bind(this));

    console.log('📋 RAG IPC handlers registered');
  }

  setupEventForwarding() {
    // Forward RAG engine events to renderer processes
    ragEngine.on('initialized', data => {
      this.broadcastToRenderers('rag-initialized', data);
    });

    ragEngine.on('document-indexed', data => {
      this.broadcastToRenderers('rag-document-indexed', data);
    });

    ragEngine.on('query-processed', data => {
      this.broadcastToRenderers('rag-query-processed', data);
    });

    ragEngine.on('metrics-updated', data => {
      this.broadcastToRenderers('rag-metrics-updated', data);
    });

    ragEngine.on('error', data => {
      this.broadcastToRenderers('rag-error', data);
    });
  }

  async initializeRAG(event, config = {}) {
    try {
      console.log('🚀 Initializing RAG from IPC...');

      const result = await ragEngine.initialize(config);

      await telemetry.logMaintenance('rag_initialized', 'completed');

      return {
        success: true,
        message: 'RAG Engine initialized successfully',
        status: ragEngine.getStatus(),
        ...result,
      };
    } catch (error) {
      console.error('❌ RAG initialization failed:', error);
      await telemetry.logMaintenance('rag_initialized', 'failed', { error: error.message });

      return {
        success: false,
        error: error.message,
      };
    }
  }

  async indexDocument(event, filePath, metadata = {}) {
    try {
      console.log(`📄 Indexing document via IPC: ${filePath}`);

      // Validate file exists
      await fs.access(filePath);

      const result = await ragEngine.indexDocument(filePath, metadata);

      await telemetry.logMaintenance('rag_document_indexed', 'completed', {
        filePath,
        modality: result.modality,
      });

      return result;
    } catch (error) {
      console.error(`❌ Document indexing failed: ${filePath}`, error);
      await telemetry.logMaintenance('rag_document_indexed', 'failed', {
        filePath,
        error: error.message,
      });

      return {
        success: false,
        error: error.message,
      };
    }
  }

  async indexFolder(event, folderPath, options = {}) {
    try {
      console.log(`📁 Indexing folder via IPC: ${folderPath}`);

      const {
        recursive = true,
        fileTypes = ['text', 'image', 'audio', 'video', 'structured'],
        maxFiles = 1000,
        batchSize = 10,
      } = options;

      // Get all files in folder
      const files = await this.getAllFiles(folderPath, recursive, fileTypes);

      if (files.length > maxFiles) {
        return {
          success: false,
          error: `Too many files (${files.length}). Maximum allowed: ${maxFiles}`,
        };
      }

      const results = [];
      const errors = [];

      // Process files in batches
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);

        const batchPromises = batch.map(async filePath => {
          try {
            const result = await ragEngine.indexDocument(filePath, {
              source: 'folder_batch',
              folderPath,
              ...options.metadata,
            });
            results.push(result);

            // Emit progress
            this.broadcastToRenderers('rag-indexing-progress', {
              processed: results.length,
              total: files.length,
              currentFile: path.basename(filePath),
            });
          } catch (error) {
            errors.push({ filePath, error: error.message });
          }
        });

        await Promise.all(batchPromises);

        // Small delay between batches to prevent overwhelming
        if (i + batchSize < files.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      await telemetry.logMaintenance('rag_folder_indexed', 'completed', {
        folderPath,
        filesProcessed: results.length,
        errors: errors.length,
      });

      return {
        success: true,
        folderPath,
        filesProcessed: results.length,
        errors: errors.length,
        results,
        errorDetails: errors,
      };
    } catch (error) {
      console.error(`❌ Folder indexing failed: ${folderPath}`, error);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  async query(event, queryText, options = {}) {
    try {
      console.log(`🔍 Processing RAG query via IPC: "${queryText}"`);

      const result = await ragEngine.query(queryText, options);

      await telemetry.logMaintenance('rag_query_processed', 'completed', {
        query: queryText,
        resultsCount: result.sources?.length || 0,
      });

      return result;
    } catch (error) {
      console.error(`❌ RAG query failed:`, error);

      return {
        success: false,
        error: error.message,
        query: queryText,
      };
    }
  }

  async semanticSearch(event, query, options = {}) {
    try {
      const result = await ragEngine.query(query, {
        ...options,
        searchType: 'semantic',
        hybridSearch: false,
      });

      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async hybridSearch(event, query, options = {}) {
    try {
      const result = await ragEngine.query(query, {
        ...options,
        searchType: 'hybrid',
        hybridSearch: true,
      });

      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async crossModalSearch(event, query, options = {}) {
    try {
      const result = await ragEngine.query(query, {
        ...options,
        crossModal: true,
        modalities: ['text', 'image', 'audio', 'video', 'structured'],
      });

      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getStatus(event) {
    try {
      const status = ragEngine.getStatus();

      return {
        success: true,
        data: status,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async listDocuments(event, options = {}) {
    try {
      // Mock document listing - in reality would query the vector store
      const documents = [];

      for (const [modality, index] of ragEngine.indices.entries()) {
        for (const [chunkId, chunkData] of index.entries()) {
          const docId = chunkData.metadata.filePath || chunkId;

          if (!documents.find(d => d.id === docId)) {
            documents.push({
              id: docId,
              modality,
              filename: path.basename(chunkData.metadata.filePath || chunkId),
              path: chunkData.metadata.filePath,
              indexedAt: chunkData.metadata.timestamp,
              chunks: 1,
              size: chunkData.metadata.length || 0,
            });
          }
        }
      }

      return {
        success: true,
        documents: documents.slice(0, options.limit || 100),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async removeDocument(event, documentId) {
    try {
      // Mock document removal - in reality would remove from vector store
      console.log(`🗑️ Removing document: ${documentId}`);

      return {
        success: true,
        message: `Document ${documentId} removed successfully`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async updateDocument(event, documentId, metadata) {
    try {
      // Mock document update - in reality would update metadata in vector store
      console.log(`📝 Updating document: ${documentId}`);

      return {
        success: true,
        message: `Document ${documentId} updated successfully`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getAnalytics(event, timeRange = '24h') {
    try {
      const status = ragEngine.getStatus();

      // Mock analytics data
      const analytics = {
        timeRange,
        documentsIndexed: status.metrics.documentsIndexed,
        queriesProcessed: status.metrics.queriesProcessed,
        averageRetrievalTime: status.metrics.averageRetrievalTime,
        modalityDistribution: {
          text: status.indices.text || 0,
          image: status.indices.image || 0,
          audio: status.indices.audio || 0,
          video: status.indices.video || 0,
          structured: status.indices.structured || 0,
        },
        topQueries: [
          { query: 'regulatory requirements', count: 15 },
          { query: 'FDA approval process', count: 12 },
          { query: 'medical device classification', count: 8 },
        ],
        performanceMetrics: {
          indexingSpeed: '1.2 docs/sec',
          queryLatency: '150ms avg',
          cacheHitRate: '85%',
        },
      };

      return {
        success: true,
        data: analytics,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getSimilarDocuments(event, documentId, options = {}) {
    try {
      // Mock similar documents - in reality would do vector similarity search
      const similarDocs = [
        {
          id: 'doc_2',
          title: 'Similar Document 1',
          similarity: 0.89,
          modality: 'text',
        },
        {
          id: 'doc_3',
          title: 'Similar Document 2',
          similarity: 0.76,
          modality: 'text',
        },
      ];

      return {
        success: true,
        documentId,
        similarDocuments: similarDocs,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getDocumentClusters(event, options = {}) {
    try {
      // Mock document clustering - in reality would use clustering algorithms
      const clusters = [
        {
          id: 'cluster_1',
          name: 'Regulatory Documents',
          documentCount: 25,
          centroid: 'FDA regulations and compliance',
          documents: ['doc_1', 'doc_2', 'doc_3'],
        },
        {
          id: 'cluster_2',
          name: 'Technical Specifications',
          documentCount: 18,
          centroid: 'Device specifications and testing',
          documents: ['doc_4', 'doc_5', 'doc_6'],
        },
      ];

      return {
        success: true,
        clusters,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async updateConfig(event, config) {
    try {
      // Update RAG engine configuration
      ragEngine.config = { ...ragEngine.config, ...config };

      return {
        success: true,
        message: 'RAG configuration updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getConfig(event) {
    try {
      return {
        success: true,
        config: ragEngine.config,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async selectFiles(event, options = {}) {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Select Files to Index',
        properties: ['openFile', 'multiSelections'],
        filters: [
          {
            name: 'All Supported',
            extensions: ['txt', 'pdf', 'docx', 'jpg', 'png', 'mp3', 'mp4', 'json', 'csv'],
          },
          { name: 'Text Files', extensions: ['txt', 'md', 'pdf', 'docx', 'rtf'] },
          { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'] },
          { name: 'Audio', extensions: ['mp3', 'wav', 'm4a', 'flac'] },
          { name: 'Video', extensions: ['mp4', 'avi', 'mov', 'wmv'] },
          { name: 'Structured Data', extensions: ['json', 'xml', 'csv', 'xlsx'] },
        ],
        ...options,
      });

      return {
        success: !result.canceled,
        files: result.filePaths || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async selectFolder(event, options = {}) {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Select Folder to Index',
        properties: ['openDirectory'],
        ...options,
      });

      return {
        success: !result.canceled,
        folder: result.filePaths?.[0] || null,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Helper methods
  async getAllFiles(dirPath, recursive = true, fileTypes = []) {
    const files = [];

    async function scanDirectory(currentPath) {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory() && recursive) {
          await scanDirectory(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          const modality = ragEngine.detectModality(ext);

          if (fileTypes.length === 0 || fileTypes.includes(modality)) {
            files.push(fullPath);
          }
        }
      }
    }

    await scanDirectory(dirPath);
    return files;
  }

  broadcastToRenderers(channel, data = {}) {
    // Send to all renderer processes
    BrowserWindow.getAllWindows().forEach(window => {
      window.webContents.send(channel, data);
    });
  }
}

// Export singleton instance
export const ragHandlers = new RAGHandlers();
