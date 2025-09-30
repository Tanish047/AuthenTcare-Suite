/**
 * Free AI Manager - Orchestrates all free AI services
 * Main interface for the AI Knowledge Base to use free local AI
 */

import FreeRAGEngine from './FreeRAGEngine.js';
import FreeMCPEngine from './FreeMCPEngine.js';

class FreeAIManager {
  constructor() {
    this.ragEngine = null;
    this.mcpEngine = null;
    this.isInitialized = false;
    this.initializationPromise = null;
  }

  async initialize() {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._doInitialize();
    return this.initializationPromise;
  }

  async _doInitialize() {
    try {
      console.log('Initializing Free AI Manager...');

      // Initialize RAG Engine
      this.ragEngine = new FreeRAGEngine();
      const ragResult = await this.ragEngine.initialize();

      // Initialize MCP Engine with RAG
      this.mcpEngine = new FreeMCPEngine(this.ragEngine);
      const mcpResult = await this.mcpEngine.initialize();

      this.isInitialized = true;

      console.log('Free AI Manager initialized successfully');
      return {
        success: true,
        message: 'Free AI services initialized',
        services: {
          rag: ragResult,
          mcp: mcpResult
        }
      };

    } catch (error) {
      console.error('Free AI Manager initialization failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // RAG API Methods
  async ragQuery(query, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return await this.ragEngine.query(query, options);
  }

  async ragAddDocument(file) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return await this.ragEngine.addDocument(file);
  }

  async ragSearchDocuments(query, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return await this.ragEngine.searchDocuments(query, options);
  }

  async ragAnalyzeDocument(documentId, analysisType = 'full') {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return await this.ragEngine.analyzeDocument(documentId, analysisType);
  }

  async ragRemoveDocument(documentId) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return await this.ragEngine.removeDocument(documentId);
  }

  async ragGetStatus() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return await this.ragEngine.getStatus();
  }

  async ragGetAnalytics(options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return await this.ragEngine.getAnalytics(options);
  }

  // MCP API Methods
  async mcpCallTool(toolName, functionName, parameters = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return await this.mcpEngine.callTool(toolName, functionName, parameters);
  }

  async mcpGetAvailableTools() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return await this.mcpEngine.getAvailableTools();
  }

  async mcpGetToolInfo(toolName) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return await this.mcpEngine.getToolInfo(toolName);
  }

  async mcpGetStatus() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.mcpEngine.getStatus();
  }

  // Combined AI Methods
  async conversationalQuery(messages, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return await this.ragEngine.conversationalQuery(messages, options);
  }

  async processMultipleDocuments(files, onProgress = null) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return await this.ragEngine.processMultipleDocuments(files, onProgress);
  }

  // Enhanced regulatory analysis combining RAG + MCP
  async analyzeRegulatoryQuery(query, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // First, get RAG-enhanced response
      const ragResponse = await this.ragEngine.query(query, options);

      // Then, use MCP for additional analysis
      const mcpResponse = await this.mcpEngine.callTool(
        'regulatory-brain',
        'analyze-query',
        {
          query: query,
          context: ragResponse.content,
          model: ragResponse.model,
          temperature: options.temperature || 0.7,
          maxTokens: options.maxTokens || 2000
        }
      );

      // Combine results
      return {
        success: true,
        content: ragResponse.content,
        enhancedAnalysis: mcpResponse.success ? mcpResponse.data : null,
        sources: ragResponse.sources,
        model: ragResponse.model,
        provider: 'free-ai-combined',
        confidence: ragResponse.confidence,
        contextUsed: ragResponse.contextUsed,
        mcpToolsUsed: mcpResponse.success,
        usage: ragResponse.usage
      };

    } catch (error) {
      console.error('Enhanced regulatory analysis error:', error);
      return {
        success: false,
        error: error.message,
        content: 'I apologize, but I encountered an error during the enhanced analysis. Please try again.'
      };
    }
  }

  // System status and health check
  async getSystemStatus() {
    const status = {
      initialized: this.isInitialized,
      timestamp: new Date().toISOString()
    };

    if (this.isInitialized) {
      try {
        const [ragStatus, mcpStatus] = await Promise.all([
          this.ragEngine.getStatus(),
          this.mcpEngine.getStatus()
        ]);

        status.services = {
          rag: ragStatus,
          mcp: mcpStatus
        };

        status.health = {
          overall: 'healthy',
          rag: ragStatus.success ? 'healthy' : 'degraded',
          mcp: mcpStatus.initialized ? 'healthy' : 'degraded'
        };

      } catch (error) {
        status.health = {
          overall: 'degraded',
          error: error.message
        };
      }
    } else {
      status.health = {
        overall: 'initializing'
      };
    }

    return status;
  }

  // Cleanup and shutdown
  async shutdown() {
    console.log('Shutting down Free AI Manager...');
    this.isInitialized = false;
    this.initializationPromise = null;
    
    // Cleanup resources if needed
    if (this.ragEngine) {
      // Add cleanup logic if needed
    }
    
    if (this.mcpEngine) {
      // Add cleanup logic if needed
    }
    
    console.log('Free AI Manager shutdown complete');
  }
}

// Create singleton instance
const freeAIManager = new FreeAIManager();

export default freeAIManager;