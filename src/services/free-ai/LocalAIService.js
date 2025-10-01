/**
 * Local AI Service - Free AI implementation using Ollama
 * Provides OpenAI-compatible API for local models
 */

class LocalAIService {
  constructor() {
    this.baseURL = 'http://localhost:11434';
    this.isAvailable = false;
    this.currentModel = 'phi3:mini'; // Fast, working model
    this.fallbackModels = ['llama3.1:8b', 'phi3:mini', 'qwen2:7b'];
    this.timeout = 20000; // 20 second timeout

    this.initialize();
  }

  async initialize() {
    try {
      // Check if Ollama is running
      const response = await fetch(`${this.baseURL}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        this.isAvailable = true;

        // Check available models
        const models = data.models || [];
        const availableModels = models.map(m => m.name);

        // Use best available model
        if (availableModels.includes(this.currentModel)) {
          // Use preferred model (phi3:mini - fast and efficient)
          console.log(`✅ Using your installed model: ${this.currentModel}`);
        } else {
          // Try fallback models
          const fallback = this.fallbackModels.find(model => availableModels.includes(model));
          if (fallback) {
            this.currentModel = fallback;
            console.log(`Using fallback model: ${this.currentModel}`);
          } else if (availableModels.length > 0) {
            this.currentModel = availableModels[0];
            console.log(`Using available model: ${this.currentModel}`);
          } else {
            console.warn('No Ollama models found. Please install: ollama pull phi3:mini');
          }
        }

        console.log(`Local AI Service initialized with model: ${this.currentModel}`);
      }
    } catch (error) {
      console.log('Ollama not available, using mock responses');
      this.isAvailable = false;
    }
  }

  async chat(messages, options = {}) {
    if (!this.isAvailable) {
      return this.getMockResponse(messages);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.currentModel,
          messages: messages,
          stream: false,
          options: {
            temperature: options.temperature || 0.7,
            top_p: options.top_p || 0.9,
            num_predict: options.max_tokens || 500, // Limit response length
            num_ctx: 2048, // Reduce context window for speed
          },
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        content: data.message?.content || 'No response generated',
        model: this.currentModel,
        provider: 'ollama',
        confidence: 0.9,
        sources: [],
        usage: {
          prompt_tokens: this.estimateTokens(messages),
          completion_tokens: this.estimateTokens([{ content: data.message?.content || '' }]),
          total_tokens: 0,
        },
      };
    } catch (error) {
      console.error('Local AI Service error:', error);
      return this.getMockResponse(messages);
    }
  }

  async generateEmbeddings(texts) {
    if (!this.isAvailable) {
      // Return mock embeddings for development
      return texts.map(() =>
        Array(384)
          .fill(0)
          .map(() => Math.random() - 0.5)
      );
    }

    try {
      const embeddings = [];

      for (const text of texts) {
        const response = await fetch(`${this.baseURL}/api/embeddings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'nomic-embed-text', // Specialized embedding model
            prompt: text,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          embeddings.push(data.embedding);
        } else {
          // Fallback to mock embedding
          embeddings.push(
            Array(384)
              .fill(0)
              .map(() => Math.random() - 0.5)
          );
        }
      }

      return embeddings;
    } catch (error) {
      console.error('Embedding generation error:', error);
      // Return mock embeddings
      return texts.map(() =>
        Array(384)
          .fill(0)
          .map(() => Math.random() - 0.5)
      );
    }
  }

  getMockResponse(messages) {
    const lastMessage = messages[messages.length - 1]?.content || '';

    // Generate contextual mock responses for regulatory queries
    const mockResponses = {
      fda: 'The FDA (Food and Drug Administration) regulates medical devices through a risk-based classification system. Class I devices have the lowest risk, Class II devices require 510(k) clearance, and Class III devices need PMA approval.',
      'class ii':
        'FDA Class II medical devices are moderate-risk devices that typically require 510(k) premarket clearance. Examples include powered wheelchairs, infusion pumps, and surgical drapes. They must comply with special controls and general controls.',
      '510(k)':
        'A 510(k) is a premarket submission to FDA to demonstrate that a device is substantially equivalent to a legally marketed predicate device. The process typically takes 90 days for review, though it can be longer with additional information requests.',
      'iso 13485':
        'ISO 13485 is an international standard for quality management systems specific to medical devices. It specifies requirements for a comprehensive quality management system for the design and manufacture of medical devices.',
      'clinical trials':
        'Clinical trials for medical devices are studies conducted to evaluate the safety and effectiveness of devices in humans. The requirements vary based on device classification and risk level, with IDE (Investigational Device Exemption) needed for significant risk studies.',
      default:
        'I can help you with FDA regulations, medical device classifications, 510(k) submissions, ISO standards, clinical trials, and other regulatory compliance topics. What specific regulatory question do you have?',
    };

    // Find relevant response based on keywords
    const lowerMessage = lastMessage.toLowerCase();
    let response = mockResponses.default;

    for (const [keyword, mockResponse] of Object.entries(mockResponses)) {
      if (lowerMessage.includes(keyword)) {
        response = mockResponse;
        break;
      }
    }

    return {
      success: true,
      content: response,
      model: 'mock-regulatory-ai',
      provider: 'local-mock',
      confidence: 0.8,
      sources: [],
      usage: {
        prompt_tokens: this.estimateTokens(messages),
        completion_tokens: this.estimateTokens([{ content: response }]),
        total_tokens: 0,
      },
    };
  }

  estimateTokens(messages) {
    const text = messages.map(m => m.content || '').join(' ');
    return Math.ceil(text.length / 4); // Rough token estimation
  }

  async getAvailableModels() {
    if (!this.isAvailable) {
      return ['mock-regulatory-ai'];
    }

    try {
      const response = await fetch(`${this.baseURL}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        return data.models?.map(m => m.name) || [];
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    }

    return ['mock-regulatory-ai'];
  }

  async switchModel(modelName) {
    this.currentModel = modelName;
    console.log(`Switched to model: ${modelName}`);
  }

  getStatus() {
    return {
      available: this.isAvailable,
      currentModel: this.currentModel,
      endpoint: this.baseURL,
      provider: this.isAvailable ? 'ollama' : 'mock',
    };
  }
}

export default LocalAIService;
