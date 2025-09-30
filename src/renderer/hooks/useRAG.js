import { useState, useCallback, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext.jsx';

/**
 * Multi-Modal RAG Hook - Advanced RAG integration for React components
 *
 * Features:
 * - Document indexing and management
 * - Multi-modal querying (text, image, audio, video)
 * - Real-time search and retrieval
 * - Analytics and insights
 * - Cross-modal search capabilities
 */
export function useRAG() {
  const { state, dispatch } = useAppContext();
  const [isInitializing, setIsInitializing] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);
  const eventListenersRef = useRef([]);

  // Initialize RAG on first use
  useEffect(() => {
    if (!state.rag?.initialized && !isInitializing) {
      initializeRAG();
    }
  }, [state.rag?.initialized, isInitializing]);

  // Setup event listeners
  useEffect(() => {
    const cleanupFunctions = [];

    // RAG initialization events
    const initCleanup = window.ragAPI.onInitialized(data => {
      dispatch({ type: 'RAG_SET_INITIALIZED', initialized: true });
      dispatch({ type: 'RAG_SET_STATUS', status: 'connected' });
    });
    cleanupFunctions.push(initCleanup);

    // Document indexing events
    const indexCleanup = window.ragAPI.onDocumentIndexed(data => {
      dispatch({
        type: 'RAG_ADD_REAL_TIME_EVENT',
        event: {
          type: 'document_indexed',
          timestamp: Date.now(),
          data: {
            filePath: data.filePath,
            modality: data.modality,
            chunks: data.chunks,
          },
        },
      });

      // Update document count
      dispatch({ type: 'RAG_INCREMENT_DOCUMENT_COUNT' });
    });
    cleanupFunctions.push(indexCleanup);

    // Query processing events
    const queryCleanup = window.ragAPI.onQueryProcessed(data => {
      dispatch({
        type: 'RAG_ADD_QUERY_RESULT',
        result: {
          query: data.query,
          timestamp: Date.now(),
          resultsCount: data.resultsCount,
          processingTime: data.processingTime,
        },
      });
    });
    cleanupFunctions.push(queryCleanup);

    // Indexing progress events
    const progressCleanup = window.ragAPI.onIndexingProgress(data => {
      dispatch({
        type: 'RAG_SET_INDEXING_PROGRESS',
        progress: {
          processed: data.processed,
          total: data.total,
          currentFile: data.currentFile,
          percentage: Math.round((data.processed / data.total) * 100),
        },
      });
    });
    cleanupFunctions.push(progressCleanup);

    // Metrics update events
    const metricsCleanup = window.ragAPI.onMetricsUpdated(data => {
      dispatch({ type: 'RAG_SET_METRICS', metrics: data });
    });
    cleanupFunctions.push(metricsCleanup);

    // Error events
    const errorCleanup = window.ragAPI.onError(data => {
      dispatch({
        type: 'RAG_ADD_REAL_TIME_EVENT',
        event: {
          type: 'error',
          timestamp: Date.now(),
          data: {
            error: data.error,
            context: data.context,
          },
        },
      });
    });
    cleanupFunctions.push(errorCleanup);

    eventListenersRef.current = cleanupFunctions;

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [dispatch]);

  // Initialize RAG Engine
  const initializeRAG = useCallback(async () => {
    if (isInitializing) return;

    setIsInitializing(true);
    try {
      console.log('🚀 Initializing RAG from React hook...');

      const result = await window.ragAPI.initialize();

      if (result.success) {
        dispatch({ type: 'RAG_SET_INITIALIZED', initialized: true });
        dispatch({ type: 'RAG_SET_STATUS', status: 'connected' });

        // Load initial data
        await loadRAGData();

        console.log('✅ RAG initialized successfully from hook');
      } else {
        console.error('❌ RAG initialization failed:', result.error);
        dispatch({ type: 'RAG_SET_STATUS', status: 'error' });
      }
    } catch (error) {
      console.error('❌ RAG initialization error:', error);
      dispatch({ type: 'RAG_SET_STATUS', status: 'error' });
    } finally {
      setIsInitializing(false);
    }
  }, [isInitializing, dispatch]);

  // Load RAG data
  const loadRAGData = useCallback(async () => {
    try {
      // Load status
      const statusResult = await window.ragAPI.getStatus();
      if (statusResult.success) {
        dispatch({ type: 'RAG_SET_STATUS_DATA', statusData: statusResult.data });
      }

      // Load documents
      const documentsResult = await window.ragAPI.listDocuments();
      if (documentsResult.success) {
        dispatch({ type: 'RAG_SET_DOCUMENTS', documents: documentsResult.documents });
      }

      // Load analytics
      const analyticsResult = await window.ragAPI.getAnalytics('24h');
      if (analyticsResult.success) {
        dispatch({ type: 'RAG_SET_ANALYTICS', analytics: analyticsResult.data });
      }
    } catch (error) {
      console.error('❌ Error loading RAG data:', error);
    }
  }, [dispatch]);

  // Document indexing
  const indexDocument = useCallback(
    async (filePath, metadata = {}) => {
      try {
        console.log(`📄 Indexing document: ${filePath}`);

        const result = await window.ragAPI.indexDocument(filePath, metadata);

        if (result.success) {
          console.log(`✅ Document indexed: ${result.chunksIndexed} chunks`);

          // Refresh document list
          await loadRAGData();

          return result;
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error(`❌ Document indexing failed:`, error);
        throw error;
      }
    },
    [loadRAGData]
  );

  const indexFolder = useCallback(
    async (folderPath, options = {}) => {
      setIsIndexing(true);
      try {
        console.log(`📁 Indexing folder: ${folderPath}`);

        const result = await window.ragAPI.indexFolder(folderPath, options);

        if (result.success) {
          console.log(`✅ Folder indexed: ${result.filesProcessed} files`);

          // Refresh document list
          await loadRAGData();

          return result;
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error(`❌ Folder indexing failed:`, error);
        throw error;
      } finally {
        setIsIndexing(false);
        dispatch({ type: 'RAG_CLEAR_INDEXING_PROGRESS' });
      }
    },
    [loadRAGData, dispatch]
  );

  const indexMultipleFiles = useCallback(
    async (filePaths, metadata = {}) => {
      setIsIndexing(true);
      try {
        const results = [];
        const errors = [];

        for (let i = 0; i < filePaths.length; i++) {
          const filePath = filePaths[i];

          try {
            const result = await indexDocument(filePath, metadata);
            results.push(result);

            // Update progress
            dispatch({
              type: 'RAG_SET_INDEXING_PROGRESS',
              progress: {
                processed: i + 1,
                total: filePaths.length,
                currentFile: filePath.split('/').pop(),
                percentage: Math.round(((i + 1) / filePaths.length) * 100),
              },
            });
          } catch (error) {
            errors.push({ filePath, error: error.message });
          }
        }

        return {
          success: true,
          filesProcessed: results.length,
          errors: errors.length,
          results,
          errorDetails: errors,
        };
      } catch (error) {
        console.error('❌ Multiple file indexing failed:', error);
        throw error;
      } finally {
        setIsIndexing(false);
        dispatch({ type: 'RAG_CLEAR_INDEXING_PROGRESS' });
      }
    },
    [indexDocument, dispatch]
  );

  // Querying and search
  const query = useCallback(
    async (queryText, options = {}) => {
      setIsQuerying(true);
      try {
        console.log(`🔍 Processing RAG query: "${queryText}"`);

        const result = await window.ragAPI.query(queryText, options);

        if (result.success) {
          console.log(`✅ Query processed: ${result.sources.length} sources found`);

          // Add to query history
          dispatch({
            type: 'RAG_ADD_QUERY_RESULT',
            result: {
              query: queryText,
              response: result.response,
              sources: result.sources,
              timestamp: Date.now(),
              processingTime: result.processingTime,
              confidence: result.confidence,
            },
          });

          return result;
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error(`❌ RAG query failed:`, error);
        throw error;
      } finally {
        setIsQuerying(false);
      }
    },
    [dispatch]
  );

  const semanticSearch = useCallback(async (queryText, options = {}) => {
    try {
      const result = await window.ragAPI.semanticSearch(queryText, options);
      return result;
    } catch (error) {
      console.error('❌ Semantic search failed:', error);
      throw error;
    }
  }, []);

  const hybridSearch = useCallback(async (queryText, options = {}) => {
    try {
      const result = await window.ragAPI.hybridSearch(queryText, options);
      return result;
    } catch (error) {
      console.error('❌ Hybrid search failed:', error);
      throw error;
    }
  }, []);

  const crossModalSearch = useCallback(async (queryText, options = {}) => {
    try {
      const result = await window.ragAPI.crossModalSearch(queryText, options);
      return result;
    } catch (error) {
      console.error('❌ Cross-modal search failed:', error);
      throw error;
    }
  }, []);

  // Document management
  const listDocuments = useCallback(
    async (options = {}) => {
      try {
        const result = await window.ragAPI.listDocuments(options);

        if (result.success) {
          dispatch({ type: 'RAG_SET_DOCUMENTS', documents: result.documents });
          return result.documents;
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('❌ Failed to list documents:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const removeDocument = useCallback(
    async documentId => {
      try {
        const result = await window.ragAPI.removeDocument(documentId);

        if (result.success) {
          // Refresh document list
          await loadRAGData();
          return result;
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('❌ Failed to remove document:', error);
        throw error;
      }
    },
    [loadRAGData]
  );

  const getSimilarDocuments = useCallback(async (documentId, options = {}) => {
    try {
      const result = await window.ragAPI.getSimilarDocuments(documentId, options);
      return result;
    } catch (error) {
      console.error('❌ Failed to get similar documents:', error);
      throw error;
    }
  }, []);

  // Analytics and insights
  const getAnalytics = useCallback(
    async (timeRange = '24h') => {
      try {
        const result = await window.ragAPI.getAnalytics(timeRange);

        if (result.success) {
          dispatch({ type: 'RAG_SET_ANALYTICS', analytics: result.data });
          return result.data;
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('❌ Failed to get analytics:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const getDocumentClusters = useCallback(async (options = {}) => {
    try {
      const result = await window.ragAPI.getDocumentClusters(options);
      return result;
    } catch (error) {
      console.error('❌ Failed to get document clusters:', error);
      throw error;
    }
  }, []);

  // File selection helpers
  const selectFiles = useCallback(async (options = {}) => {
    try {
      const result = await window.ragAPI.selectFiles(options);
      return result;
    } catch (error) {
      console.error('❌ File selection failed:', error);
      throw error;
    }
  }, []);

  const selectFolder = useCallback(async (options = {}) => {
    try {
      const result = await window.ragAPI.selectFolder(options);
      return result;
    } catch (error) {
      console.error('❌ Folder selection failed:', error);
      throw error;
    }
  }, []);

  // Configuration
  const updateConfig = useCallback(
    async config => {
      try {
        const result = await window.ragAPI.updateConfig(config);

        if (result.success) {
          dispatch({ type: 'RAG_UPDATE_CONFIG', config });
          return result;
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('❌ Failed to update config:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // Status and utilities
  const getStatus = useCallback(async () => {
    try {
      const result = await window.ragAPI.getStatus();

      if (result.success) {
        dispatch({ type: 'RAG_SET_STATUS_DATA', statusData: result.data });
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Failed to get status:', error);
      throw error;
    }
  }, [dispatch]);

  const refreshData = useCallback(async () => {
    await loadRAGData();
  }, [loadRAGData]);

  // Return hook interface
  return {
    // State
    isInitialized: state.rag?.initialized || false,
    isInitializing,
    isIndexing,
    isQuerying,
    status: state.rag?.status || 'disconnected',
    documents: state.rag?.documents || [],
    analytics: state.rag?.analytics || null,
    queryHistory: state.rag?.queryHistory || [],
    indexingProgress: state.rag?.indexingProgress || null,
    realTimeEvents: state.rag?.realTimeEvents || [],

    // Core operations
    initializeRAG,
    query,
    semanticSearch,
    hybridSearch,
    crossModalSearch,

    // Document management
    indexDocument,
    indexFolder,
    indexMultipleFiles,
    listDocuments,
    removeDocument,
    getSimilarDocuments,

    // Analytics
    getAnalytics,
    getDocumentClusters,

    // File operations
    selectFiles,
    selectFolder,

    // Configuration
    updateConfig,

    // Utilities
    getStatus,
    refreshData,
    loadRAGData,
  };
}

// Export default
export default useRAG;
