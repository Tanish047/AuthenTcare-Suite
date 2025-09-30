import OpenAI from 'openai';
import { CohereClient } from 'cohere-ai';
import { PineconeClient } from 'pinecone-client';
import { telemetry } from '../telemetry.js';

/**
 * AI Service Manager - Centralized AI API management
 * Handles OpenAI, Cohere, and Pinecone integrations with fallbacks
 */
export class AIServiceManager {
    constructor() {
        this.openai = null;
        this.cohere = null;
        this.pinecone = null;
        this.initialized = false;
        this.config = {
            openai: {
                enabled: false,
                model: 'text-embedding-ada-002',
                maxTokens: 8000,
            },
            cohere: {
                enabled: false,
                model: 'embed-english-v3.0',
                inputType: 'search_document',
            },
            pinecone: {
                enabled: false,
                environment: 'us-west1-gcp',
                indexName: 'authentcare-embeddings',
            },
        };
    }

    async initialize(config = {}) {
        try {
            console.log('🤖 Initializing AI Service Manager...');

            this.config = { ...this.config, ...config };

            // Initialize OpenAI
            if (process.env.OPENAI_API_KEY && this.config.openai.enabled !== false) {
                try {
                    this.openai = new OpenAI({
                        apiKey: process.env.OPENAI_API_KEY,
                    });

                    // Test connection
                    await this.openai.models.list();
                    this.config.openai.enabled = true;
                    console.log('✅ OpenAI initialized successfully');
                } catch (error) {
                    console.warn('⚠️ OpenAI initialization failed:', error.message);
                    this.config.openai.enabled = false;
                }
            }

            // Initialize Cohere
            if (process.env.COHERE_API_KEY && this.config.cohere.enabled !== false) {
                try {
                    this.cohere = new CohereClient({
                        token: process.env.COHERE_API_KEY,
                    });

                    // Test connection
                    await this.cohere.check();
                    this.config.cohere.enabled = true;
                    console.log('✅ Cohere initialized successfully');
                } catch (error) {
                    console.warn('⚠️ Cohere initialization failed:', error.message);
                    this.config.cohere.enabled = false;
                }
            }

            // Initialize Pinecone
            if (process.env.PINECONE_API_KEY && this.config.pinecone.enabled !== false) {
                try {
                    this.pinecone = new PineconeClient({
                        apiKey: process.env.PINECONE_API_KEY,
                        environment: this.config.pinecone.environment,
                    });

                    await this.pinecone.init();
                    this.config.pinecone.enabled = true;
                    console.log('✅ Pinecone initialized successfully');
                } catch (error) {
                    console.warn('⚠️ Pinecone initialization failed:', error.message);
                    this.config.pinecone.enabled = false;
                }
            }

            this.initialized = true;

            await telemetry.logMaintenance('ai_service_manager_init', 'completed', {
                openai: this.config.openai.enabled,
                cohere: this.config.cohere.enabled,
                pinecone: this.config.pinecone.enabled,
            });

            return {
                success: true,
                services: {
                    openai: this.config.openai.enabled,
                    cohere: this.config.cohere.enabled,
                    pinecone: this.config.pinecone.enabled,
                },
            };
        } catch (error) {
            console.error('❌ AI Service Manager initialization failed:', error);
            await telemetry.logMaintenance('ai_service_manager_init', 'failed', {
                error: error.message,
            });
            throw error;
        }
    }

    async generateEmbeddings(text, options = {}) {
        if (!this.initialized) {
            throw new Error('AI Service Manager not initialized');
        }

        const { provider = 'auto', model, inputType } = options;

        try {
            // Auto-select provider based on availability
            if (provider === 'auto') {
                if (this.config.openai.enabled) {
                    return await this.generateOpenAIEmbeddings(text, model);
                } else if (this.config.cohere.enabled) {
                    return await this.generateCohereEmbeddings(text, inputType);
                } else {
                    throw new Error('No embedding providers available');
                }
            }

            // Use specific provider
            switch (provider) {
                case 'openai':
                    return await this.generateOpenAIEmbeddings(text, model);
                case 'cohere':
                    return await this.generateCohereEmbeddings(text, inputType);
                default:
                    throw new Error(`Unknown provider: ${provider}`);
            }
        } catch (error) {
            console.error('❌ Embedding generation failed:', error);

            // Fallback to mock embeddings if all providers fail
            console.warn('🔄 Falling back to mock embeddings');
            return this.generateMockEmbeddings(text);
        }
    }

    async generateOpenAIEmbeddings(text, model = null) {
        if (!this.config.openai.enabled) {
            throw new Error('OpenAI not available');
        }

        const response = await this.openai.embeddings.create({
            model: model || this.config.openai.model,
            input: text,
        });

        return {
            embeddings: response.data[0].embedding,
            provider: 'openai',
            model: model || this.config.openai.model,
            usage: response.usage,
        };
    }

    async generateCohereEmbeddings(text, inputType = null) {
        if (!this.config.cohere.enabled) {
            throw new Error('Cohere not available');
        }

        const response = await this.cohere.embed({
            texts: [text],
            model: this.config.cohere.model,
            inputType: inputType || this.config.cohere.inputType,
        });

        return {
            embeddings: response.embeddings[0],
            provider: 'cohere',
            model: this.config.cohere.model,
            usage: {
                totalTokens: response.meta?.billedUnits?.inputTokens || 0,
            },
        };
    }

    generateMockEmbeddings(text) {
        // Generate deterministic mock embeddings based on text content
        const hash = this.simpleHash(text);
        const embeddings = Array.from({ length: 1536 }, (_, i) => {
            return Math.sin((hash + i) * 0.1) * 0.5;
        });

        return {
            embeddings,
            provider: 'mock',
            model: 'mock-embedding-model',
            usage: { totalTokens: Math.ceil(text.length / 4) },
        };
    }

    async generateCompletion(prompt, options = {}) {
        if (!this.initialized) {
            throw new Error('AI Service Manager not initialized');
        }

        const {
            provider = 'auto',
            model = 'gpt-3.5-turbo',
            maxTokens = 1000,
            temperature = 0.7,
        } = options;

        try {
            if (provider === 'auto' || provider === 'openai') {
                if (this.config.openai.enabled) {
                    return await this.generateOpenAICompletion(prompt, {
                        model,
                        maxTokens,
                        temperature,
                    });
                }
            }

            if (provider === 'auto' || provider === 'cohere') {
                if (this.config.cohere.enabled) {
                    return await this.generateCohereCompletion(prompt, {
                        maxTokens,
                        temperature,
                    });
                }
            }

            throw new Error('No completion providers available');
        } catch (error) {
            console.error('❌ Completion generation failed:', error);

            // Fallback to mock completion
            console.warn('🔄 Falling back to mock completion');
            return this.generateMockCompletion(prompt);
        }
    }

    async generateOpenAICompletion(prompt, options = {}) {
        if (!this.config.openai.enabled) {
            throw new Error('OpenAI not available');
        }

        const response = await this.openai.chat.completions.create({
            model: options.model || 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: options.maxTokens || 1000,
            temperature: options.temperature || 0.7,
        });

        return {
            content: response.choices[0].message.content,
            provider: 'openai',
            model: options.model || 'gpt-3.5-turbo',
            usage: response.usage,
        };
    }

    async generateCohereCompletion(prompt, options = {}) {
        if (!this.config.cohere.enabled) {
            throw new Error('Cohere not available');
        }

        const response = await this.cohere.generate({
            prompt,
            maxTokens: options.maxTokens || 1000,
            temperature: options.temperature || 0.7,
        });

        return {
            content: response.generations[0].text,
            provider: 'cohere',
            model: 'command',
            usage: {
                totalTokens: response.meta?.billedUnits?.outputTokens || 0,
            },
        };
    }

    generateMockCompletion(prompt) {
        // Generate a realistic mock completion based on prompt
        const responses = [
            'Based on the regulatory requirements, I recommend conducting a thorough compliance assessment.',
            'The FDA guidelines suggest implementing a risk-based approach to device classification.',
            'For medical device approval, ensure all documentation meets ISO 13485 standards.',
            'Consider the European MDR requirements when planning your market entry strategy.',
            'The clinical evaluation should follow the latest FDA guidance documents.',
        ];

        const selectedResponse = responses[this.simpleHash(prompt) % responses.length];

        return {
            content: selectedResponse,
            provider: 'mock',
            model: 'mock-completion-model',
            usage: { totalTokens: selectedResponse.length / 4 },
        };
    }

    async storeEmbeddings(id, embeddings, metadata = {}) {
        if (!this.config.pinecone.enabled) {
            console.warn('⚠️ Pinecone not available, storing embeddings locally');
            return this.storeEmbeddingsLocally(id, embeddings, metadata);
        }

        try {
            const index = this.pinecone.Index(this.config.pinecone.indexName);

            await index.upsert({
                upsertRequest: {
                    vectors: [{
                        id,
                        values: embeddings,
                        metadata,
                    }],
                },
            });

            return { success: true, provider: 'pinecone' };
        } catch (error) {
            console.error('❌ Pinecone storage failed:', error);
            console.warn('🔄 Falling back to local storage');
            return this.storeEmbeddingsLocally(id, embeddings, metadata);
        }
    }

    storeEmbeddingsLocally(id, embeddings, metadata = {}) {
        // Store in memory for now - in production, use SQLite or file system
        if (!this.localEmbeddings) {
            this.localEmbeddings = new Map();
        }

        this.localEmbeddings.set(id, {
            embeddings,
            metadata,
            timestamp: Date.now(),
        });

        return { success: true, provider: 'local' };
    }

    async searchSimilar(queryEmbeddings, options = {}) {
        const { topK = 10, threshold = 0.7 } = options;

        if (this.config.pinecone.enabled) {
            try {
                return await this.searchPinecone(queryEmbeddings, { topK, threshold });
            } catch (error) {
                console.error('❌ Pinecone search failed:', error);
            }
        }

        // Fallback to local search
        return this.searchLocal(queryEmbeddings, { topK, threshold });
    }

    async searchPinecone(queryEmbeddings, options = {}) {
        const index = this.pinecone.Index(this.config.pinecone.indexName);

        const response = await index.query({
            queryRequest: {
                vector: queryEmbeddings,
                topK: options.topK || 10,
                includeMetadata: true,
            },
        });

        return response.matches
            .filter(match => match.score >= (options.threshold || 0.7))
            .map(match => ({
                id: match.id,
                score: match.score,
                metadata: match.metadata,
            }));
    }

    searchLocal(queryEmbeddings, options = {}) {
        if (!this.localEmbeddings) {
            return [];
        }

        const results = [];

        for (const [id, data] of this.localEmbeddings.entries()) {
            const similarity = this.cosineSimilarity(queryEmbeddings, data.embeddings);

            if (similarity >= (options.threshold || 0.7)) {
                results.push({
                    id,
                    score: similarity,
                    metadata: data.metadata,
                });
            }
        }

        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, options.topK || 10);
    }

    cosineSimilarity(a, b) {
        if (a.length !== b.length) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    getStatus() {
        return {
            initialized: this.initialized,
            services: {
                openai: this.config.openai.enabled,
                cohere: this.config.cohere.enabled,
                pinecone: this.config.pinecone.enabled,
            },
            localEmbeddings: this.localEmbeddings?.size || 0,
        };
    }
}

// Singleton instance
export const aiServiceManager = new AIServiceManager();