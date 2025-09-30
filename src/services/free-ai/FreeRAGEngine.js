/**
 * Free RAG Engine - Complete RAG implementation using local AI and ChromaDB
 * Provides document-enhanced AI responses without external API costs
 */

import LocalAIService from './LocalAIService.js';
import ChromaVectorDB from './ChromaVectorDB.js';
import DocumentProcessor from './DocumentProcessor.js';

class FreeRAGEngine {
  constructor() {
    this.aiService = new LocalAIService();
    this.vectorDB = new ChromaVectorDB();
    this.documentProcessor = new DocumentProcessor(this.aiService, this.vectorDB);
    this.isInitialized = false;
    
    this.initialize();
  }

  async initialize() {
    try {
      console.log('Initializing Free RAG Engine...');
      
      // Wait for services to initialize
      await Promise.all([
        this.aiService.initialize(),
        this.vectorDB.initialize()
      ]);

      this.isInitialized = true;
      console.log('Free RAG Engine initialized successfully');
      
      return {
        success: true,
        message: 'RAG Engine initialized with local AI and ChromaDB',
        services: {
          ai: this.aiService.getStatus(),
          vectorDB: this.vectorDB.getStatus()
        }
      };
    } catch (error) {
      console.error('RAG Engine initialization error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async query(question, options = {}) {
    try {
      const maxResults = options.maxResults || 5;
      const threshold = options.threshold || 0.7;
      const includeMetadata = options.includeMetadata !== false;

      // Step 1: Search for relevant documents
      const searchResult = await this.documentProcessor.searchDocuments(question, {
        maxResults,
        threshold
      });

      let context = '';
      let sources = [];

      if (searchResult.success && searchResult.results.length > 0) {
        // Step 2: Build context from search results
        context = searchResult.results
          .map(result => result.content)
          .join('\n\n');

        sources = searchResult.results.map(result => ({
          filename: result.filename,
          confidence: result.confidence,
          similarity: result.similarity,
          metadata: includeMetadata ? result.metadata : undefined
        }));
      }

      // Step 3: Generate AI response with context
      const messages = [
        {
          role: 'system',
          content: `You are an expert AI assistant specializing in medical device regulatory compliance. 
          Use the following context from regulatory documents to provide accurate, detailed responses.
          If the context doesn't contain relevant information, use your general knowledge but mention this limitation.
          
          Context from documents:
          ${context || 'No relevant documents found in the knowledge base.'}`
        },
        {
          role: 'user',
          content: question
        }
      ];

      const aiResponse = await this.aiService.chat(messages, {
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000
      });

      if (aiResponse.success) {
        return {
          success: true,
          content: aiResponse.content,
          model: aiResponse.model,
          provider: aiResponse.provider,
          confidence: aiResponse.confidence,
          sources: sources,
          contextUsed: context.length > 0,
          usage: aiResponse.usage,
          processingTime: Date.now() // You can implement proper timing
        };
      } else {
        throw new Error('AI response generation failed');
      }

    } catch (error) {
      console.error('RAG query error:', error);
      return {
        success: false,
        error: error.message,
        content: 'I apologize, but I encountered an error processing your query. Please try again or check the system configuration.'
      };
    }
  }

  async addDocument(file) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return await this.documentProcessor.processDocument(file);
  }

  async searchDocuments(query, options = {}) {
    return await this.documentProcessor.searchDocuments(query, options);
  }

  async analyzeDocument(documentId, analysisType = 'full') {
    return await this.documentProcessor.analyzeDocument(documentId, analysisType);
  }

  async removeDocument(documentId) {
    return await this.documentProcessor.deleteDocument(documentId);
  }

  async getStatus() {
    const stats = await this.documentProcessor.getDocumentStats();
    
    return {
      success: true,
      initialized: this.isInitialized,
      services: {
        ai: this.aiService.getStatus(),
        vectorDB: this.vectorDB.getStatus()
      },
      stats: stats,
      aiServicesAvailable: {
        openai: false, // We're using local AI
        cohere: false, // We're using local AI
        local: this.aiService.getStatus().available
      }
    };
  }

  async getAnalytics(options = {}) {
    const stats = await this.documentProcessor.getDocumentStats();
    
    return {
      success: true,
      data: {
        totalDocuments: stats.totalDocuments,
        totalChunks: stats.totalChunks,
        mostReferencedDocs: [], // Would implement based on search logs
        documentTypes: {
          pdf: 0, // Would count by type
          docx: 0,
          txt: 0,
          json: 0
        },
        knowledgeCoverage: {
          regulatoryTopics: ['FDA', 'ISO 13485', '510(k)', 'Clinical Trials'],
          coverageScore: 0.75
        }
      }
    };
  }

  // Enhanced query with conversation context
  async conversationalQuery(messages, options = {}) {
    try {
      // Extract the latest user message for document search
      const latestMessage = messages[messages.length - 1];
      if (latestMessage.role !== 'user') {
        throw new Error('Latest message must be from user');
      }

      // Search for relevant documents
      const searchResult = await this.documentProcessor.searchDocuments(
        latestMessage.content, 
        options
      );

      let context = '';
      let sources = [];

      if (searchResult.success && searchResult.results.length > 0) {
        context = searchResult.results
          .map(result => result.content)
          .join('\n\n');

        sources = searchResult.results.map(result => ({
          filename: result.filename,
          confidence: result.confidence,
          similarity: result.similarity
        }));
      }

      // Build conversation with context
      const conversationMessages = [
        {
          role: 'system',
          content: `You are an expert AI assistant specializing in medical device regulatory compliance.
          Use the following context from regulatory documents to provide accurate responses.
          Maintain conversation continuity while incorporating relevant document information.
          
          Context from documents:
          ${context || 'No relevant documents found in the knowledge base.'}`
        },
        ...messages
      ];

      const aiResponse = await this.aiService.chat(conversationMessages, options);

      if (aiResponse.success) {
        return {
          success: true,
          content: aiResponse.content,
          model: aiResponse.model,
          provider: aiResponse.provider,
          confidence: aiResponse.confidence,
          sources: sources,
          contextUsed: context.length > 0,
          usage: aiResponse.usage
        };
      } else {
        throw new Error('AI response generation failed');
      }

    } catch (error) {
      console.error('Conversational query error:', error);
      return {
        success: false,
        error: error.message,
        content: 'I apologize, but I encountered an error processing your query. Please try again.'
      };
    }
  }

  // Batch document processing
  async processMultipleDocuments(files, onProgress = null) {
    const results = [];
    const total = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: total,
          filename: file.name,
          percentage: Math.round(((i + 1) / total) * 100)
        });
      }

      const result = await this.addDocument(file);
      results.push({
        filename: file.name,
        success: result.success,
        chunks: result.chunks,
        error: result.error
      });
    }

    return {
      success: true,
      results: results,
      totalProcessed: results.filter(r => r.success).length,
      totalFailed: results.filter(r => !r.success).length
    };
  }
}

export default FreeRAGEngine;