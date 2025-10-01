/**
 * Local AI Service - Clean implementation for Ollama models
 * Focuses on accessing models from E:\ drive through Ollama service
 */

class LocalAIService {
    constructor() {
        this.baseUrl = 'http://localhost:11434';
        this.isAvailable = false;
        this.timeout = 120000; // 2 minute timeout for first model load
    }

    // Check if Ollama service is running
    async checkAvailability() {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
            this.isAvailable = response.ok;
            return this.isAvailable;
        } catch (error) {
            console.warn('Ollama service not available:', error.message);
            this.isAvailable = false;
            return false;
        }
    }

    // Get available models from Ollama (including E:\ drive models)
    async getAvailableModels() {
        try {
            console.log('🔍 Fetching models from Ollama...');
            const response = await fetch(`${this.baseUrl}/api/tags`, {
                method: 'GET',
                signal: AbortSignal.timeout(10000)
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            const models = data.models || [];
            
            console.log(`📋 Found ${models.length} models:`, models.map(m => m.name));
            
            // Add memory estimates and sort by size (smallest first)
            return models.map(model => ({
                ...model,
                memoryEstimate: this.estimateModelMemory(model.name),
                sizeCategory: this.getModelSizeCategory(model.name)
            })).sort((a, b) => a.memoryEstimate - b.memoryEstimate);
            
        } catch (error) {
            console.error('❌ Failed to get available models:', error);
            return [];
        }
    }

    // Estimate memory requirements based on model name
    estimateModelMemory(modelName) {
        const name = modelName.toLowerCase();
        
        // Specific model estimates (most accurate first)
        if (name.includes('llama3.2:1b')) return 1.5;   // Known working model - fastest startup
        if (name.includes('gemma2:2b')) return 2;        // NEW: Fastest model - Google's efficient design
        if (name.includes('qwen2.5:3b')) return 3;       // NEW: Most recent training (mid-2024)
        if (name.includes('phi3:mini')) return 60;       // Known problematic - requires 59.5GB
        if (name.includes('llama3.2:3b')) return 4;
        if (name.includes('mistral:7b')) return 8;
        if (name.includes('qwen2:7b')) return 8;
        if (name.includes('llama3.1:8b')) return 10;
        
        // Extract size from model name (fallback)
        if (name.includes('1b')) return 2;   // ~2GB
        if (name.includes('2b')) return 2.5; // ~2.5GB
        if (name.includes('3b')) return 4;   // ~4GB  
        if (name.includes('7b')) return 8;   // ~8GB
        if (name.includes('8b')) return 10;  // ~10GB
        if (name.includes('13b')) return 16; // ~16GB
        if (name.includes('20b')) return 24; // ~24GB
        if (name.includes('70b')) return 80; // ~80GB
        
        // Conservative default for unknown models
        return 6;
    }

    // Get model size category for display
    getModelSizeCategory(modelName) {
        const memory = this.estimateModelMemory(modelName);
        const name = modelName.toLowerCase();
        
        if (memory <= 2) {
            if (name.includes('gemma2:2b')) return 'Fastest (Google)';
            return 'Small (Fast)';
        }
        if (memory <= 4) {
            if (name.includes('qwen2.5:3b')) return 'Recent (Mid-2024)';
            return 'Medium (Balanced)';
        }
        if (memory <= 12) return 'Large (Capable)';
        if (memory >= 50) return 'Problematic (High RAM)';
        return 'Extra Large (High RAM)';
    }

    // Validate model before use
    validateModel(modelName) {
        const memory = this.estimateModelMemory(modelName);
        const availableMemory = 42; // GB - from your system
        
        if (memory > availableMemory) {
            throw new Error(`Model ${modelName} requires ~${memory}GB RAM but only ${availableMemory}GB available. Use llama3.2:1b instead.`);
        }
        
        return true;
    }

    // Generate response using Ollama API
    async generateResponse(prompt, options = {}) {
        try {
            const model = options.model || 'llama3.2:1b';  // Use working model as default
            
            // Validate model before attempting to use it
            this.validateModel(model);
            
            console.log(`🤖 Generating response with model: ${model}`);
            console.log(`📝 Prompt length: ${prompt.length} characters`);
            
            // Prepare request body for Ollama API with optimizations
            const requestBody = {
                model: model,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: options.temperature || 0.7,
                    num_predict: options.max_tokens || 1000,  // Reduced for faster response
                    top_p: options.top_p || 0.9,
                    top_k: options.top_k || 40,
                    // Performance optimizations for smaller models
                    num_ctx: 2048,      // Context window
                    num_batch: 512,     // Batch size
                    num_gpu: 0,         // Use CPU only for stability
                    low_vram: true      // Optimize for lower memory usage
                }
            };

            console.log('📤 Sending request to Ollama...');
            
            // Make request to Ollama API
            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody),
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Ollama API error:', errorText);
                
                // Parse error details
                let errorDetails = errorText;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorDetails = errorJson.error || errorText;
                } catch (e) {
                    // Use raw error text if not JSON
                }
                
                throw new Error(`Ollama API error (${response.status}): ${errorDetails}`);
            }

            const data = await response.json();
            const responseText = data.response || data.content || '';
            
            console.log(`✅ Response received: ${responseText.length} characters`);
            
            if (!responseText) {
                throw new Error('Empty response from Ollama');
            }
            
            return responseText;
            
        } catch (error) {
            console.error('❌ LocalAI generation error:', error);
            
            // Provide specific error messages based on error type
            if (error.name === 'TimeoutError') {
                throw new Error(`Request timed out after ${this.timeout/1000} seconds. The model might be too large or Ollama might be overloaded.`);
            } else if (error.message.includes('Connection refused')) {
                throw new Error('Ollama service is not running. Please start it with: ollama serve');
            } else if (error.message.includes('model requires more system memory')) {
                throw new Error(`Model ${options.model} requires more RAM than available. Try a smaller model like llama3.2:1b or phi3:mini`);
            } else if (error.message.includes('model not found')) {
                throw new Error(`Model ${options.model} not found. Install it with: ollama pull ${options.model}`);
            } else {
                throw error;
            }
        }
    }

    // Get service status
    getStatus() {
        return {
            available: this.isAvailable,
            baseUrl: this.baseUrl,
            service: 'ollama',
            timeout: this.timeout
        };
    }

    // Test connection to Ollama
    async testConnection() {
        try {
            const isAvailable = await this.checkAvailability();
            if (!isAvailable) {
                return {
                    success: false,
                    error: 'Ollama service is not running',
                    suggestion: 'Start Ollama with: ollama serve'
                };
            }
            
            const models = await this.getAvailableModels();
            if (models.length === 0) {
                return {
                    success: false,
                    error: 'No models found',
                    suggestion: 'Install a model with: ollama pull phi3:mini'
                };
            }
            
            return {
                success: true,
                modelsCount: models.length,
                models: models.map(m => m.name)
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                suggestion: 'Check Ollama installation and service status'
            };
        }
    }
}

export default LocalAIService;