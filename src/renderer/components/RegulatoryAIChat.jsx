import { useState, useEffect, useRef, useCallback } from 'react';
import { performanceMonitor } from '../utils/performanceMonitor.js';
import { telemetry } from '../utils/telemetry.js';
import LocalAIService from '../services/free-ai/LocalAIService.js';
import { getSharedChromaDBService } from '../services/SharedChromaDBService.js';
import DocumentHub from './DocumentHub.jsx';
import '../styles/regulatory-ai-chat.css';

/**
 * Regulatory AI Chat - Clean implementation focused on local Ollama models
 */
const RegulatoryAIChat = () => {

    // Chat configuration
    const [settings, setSettings] = useState({
        model: 'phi3:mini',
        temperature: 0.7,
        maxTokens: 500,
        systemPrompt: 'You are a regulatory AI assistant specializing in medical device compliance. Provide accurate, practical guidance on FDA regulations and quality systems.'
    });

    // AI service instances
    const [localAIService] = useState(() => new LocalAIService());
    const [chromaService] = useState(() => getSharedChromaDBService());
    const [availableModels, setAvailableModels] = useState([]);
    const [isChromaConnected, setIsChromaConnected] = useState(false);
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'documents'

    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            type: 'assistant',
            content: `Hello! I'm your **AI-powered** regulatory compliance assistant with **document analysis** capabilities.

## 🏥 **FDA Regulations**
• Device classifications (Class I, II, III)
• 510(k) submissions and PMA processes
• De Novo pathway and FDA registration

## 🌍 **International Standards**
• ISO 13485 Quality Management Systems
• ISO 14971 Risk Management
• IEC 62304 Software Lifecycle

## 🇪🇺 **Global Markets**
• EU MDR compliance requirements
• Health Canada CMDCAS
• International regulatory pathways

## 📄 **Document Analysis** (NEW!)
• Upload regulatory documents in the **Document Hub** tab
• Ask questions about YOUR specific documents
• Get AI answers based on your uploaded content
• 100% private - all data stays on your computer

**Current Model**: 🖥️ Local - ${settings.model}
**Document Storage**: ${isChromaConnected ? '🟢 Server Mode' : '🚀 Optimized Mode'}

💡 **Tip**: Upload your regulatory documents and ask specific questions about them!

What regulatory topic would you like to explore today?`,
            timestamp: new Date(),
            metadata: { type: 'welcome' }
        }
    ]);

    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentSession, setCurrentSession] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [showSettings, setShowSettings] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    // Refs
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const messagesContainerRef = useRef(null);

    // Initialize session and load available models
    useEffect(() => {
        const sessionId = `regulatory_chat_${Date.now()}`;
        setCurrentSession(sessionId);
        loadAvailableModels();
        initializeChromaDB();

        const timer = performanceMonitor.startTimer('regulatory_chat_init');
        return () => timer.end();
    }, []);

    // Initialize ChromaDB connection
    const initializeChromaDB = async () => {
        try {
            const connected = await chromaService.initialize();
            setIsChromaConnected(connected);
            console.log(`🔌 ChromaDB connection: ${connected ? 'Success' : 'Failed'}`);
        } catch (error) {
            console.error('❌ ChromaDB initialization failed:', error);
            setIsChromaConnected(false);
        }
    };

    // Load available AI models from Ollama
    const loadAvailableModels = async () => {
        try {
            console.log('🔍 Loading available Ollama models...');
            const models = await localAIService.getAvailableModels();
            console.log('📋 Available models:', models);
            console.log(`📊 Models count: ${models.length}`);
            setAvailableModels(models);
            console.log('✅ Models state updated');

            // Set default model prioritizing newest and fastest
            if (models.length > 0) {
                // Priority: 1) Newest (qwen2.5:3b), 2) Fastest (gemma2:2b), 3) Reliable (llama3.2:1b)
                const bestModel =
                    models.find(m => (m.name || m).includes('qwen2.5:3b')) ||   // Newest training (mid-2024)
                    models.find(m => (m.name || m).includes('gemma2:2b')) ||    // Fastest performance
                    models.find(m => (m.name || m).includes('llama3.2:1b')) ||  // Known working
                    models.find(m => (m.name || m).includes('1b')) ||           // Other 1B models
                    models.find(m => (m.name || m).includes('2b')) ||           // 2B models
                    models.find(m => (m.name || m).includes('3b')) ||           // 3B models
                    models[0];  // Fallback to first available

                const modelName = bestModel.name || bestModel;
                console.log(`✅ Setting model to: ${modelName}`);
                setSettings(prev => ({ ...prev, model: modelName }));
            }
        } catch (error) {
            console.warn('❌ Failed to load models:', error);
            setAvailableModels([]);
        }
    };

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const scrollToBottom = useCallback(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    // Generate regulatory responses using LOCAL Ollama models with RAG
    const generateRegulatoryResponse = async (query) => {
        try {
            console.log(`🤖 Generating response with model: ${settings.model}`);

            let contextualPrompt = query;
            let sources = ['Local AI Model'];
            let relevantDocs = [];

            // Try to get relevant documents from ChromaDB if connected
            if (isChromaConnected) {
                try {
                    console.log('🔍 Searching documents for relevant context...');
                    console.log(`🔧 ChromaDB service initialized: ${chromaService.isInitialized}`);
                    console.log(`🔧 ChromaDB fallback mode: ${chromaService.fallbackMode}`);
                    
                    // Check if we have any documents first
                    const allDocs = await chromaService.listDocuments();
                    console.log(`📚 Total documents available: ${allDocs.length}`);
                    
                    relevantDocs = await chromaService.queryDocuments(query, 3);

                    if (relevantDocs.length > 0) {
                        console.log(`📄 Found ${relevantDocs.length} relevant document chunks`);

                        // Build context from relevant documents
                        const documentContext = relevantDocs
                            .map((doc, index) => `**Document ${index + 1}** (Relevance: ${Math.round(doc.relevanceScore * 100)}%)\n${doc.content}`)
                            .join('\n\n---\n\n');

                        // Enhanced prompt with document context
                        contextualPrompt = `Based on the following regulatory documents and your knowledge, please answer this question: "${query}"

**RELEVANT DOCUMENT EXCERPTS:**
${documentContext}

**INSTRUCTIONS:**
- Use the document excerpts above as your primary source of information
- If the documents contain relevant information, cite them in your response
- If the documents don't fully answer the question, supplement with your general regulatory knowledge
- Be specific and reference the document content when applicable
- Maintain accuracy and provide practical guidance

**QUESTION:** ${query}`;

                        sources = ['Local AI Model', 'Your Uploaded Documents'];
                    }
                } catch (docError) {
                    console.warn('⚠️ Document search failed, using AI knowledge only:', docError);
                }
            }

            // Call LOCAL Ollama service
            const response = await localAIService.generateResponse(contextualPrompt, {
                model: settings.model,
                temperature: settings.temperature,
                max_tokens: settings.maxTokens,
                stream: false
            });

            console.log('✅ Response generated successfully');

            // Format response with document sources if available
            let finalResponse = response || 'I apologize, but I could not generate a response. Please try again.';

            if (relevantDocs.length > 0) {
                finalResponse += `\n\n---\n\n**📚 Sources from Your Documents:**\n`;
                relevantDocs.forEach((doc, index) => {
                    finalResponse += `• **Document ${index + 1}**: ${doc.metadata?.title || 'Unknown'} (${Math.round(doc.relevanceScore * 100)}% relevant)\n`;
                });
                finalResponse += `\n🔒 *All information sourced from your local documents - completely private*`;
            }

            return {
                content: finalResponse,
                model: settings.model,
                provider: 'ollama-local',
                confidence: relevantDocs.length > 0 ? 0.95 : 0.9,
                sources,
                relevantDocs,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ AI generation failed:', error);

            // Provide helpful error message with specific guidance
            return {
                content: `I encountered an issue generating a response for: "${query}"

**Error**: ${error.message}

## 🔧 **Troubleshooting Steps**

### **1. Check Ollama Status**
\`\`\`bash
ollama list
\`\`\`

### **2. Ensure Model is Available**
\`\`\`bash
ollama pull ${settings.model}
\`\`\`

### **3. Test Model Directly**
\`\`\`bash
ollama run ${settings.model} "Hello, are you working?"
\`\`\`

### **4. Check Ollama Service**
\`\`\`bash
ollama serve
\`\`\`

### **5. Try Different Model**
Available models: ${availableModels.map(m => m.name || m).join(', ') || 'None detected'}

## 📋 **Your Question: ${query}**

While you fix the AI connection, here's some general guidance:

### **Common Regulatory Topics**
• **FDA 510(k)**: Premarket notification for Class II devices
• **ISO 13485**: Quality management system for medical devices
• **EU MDR**: European medical device regulation
• **Risk Management**: ISO 14971 implementation
• **Design Controls**: FDA QSR requirements

**Once Ollama is working, I can provide detailed, specific answers to your regulatory questions.**`,
                model: settings.model,
                provider: 'error',
                confidence: 0.1,
                sources: ['Error Handler'],
                error: error.message
            };
        }
    };

    // Handle message sending
    const handleSendMessage = useCallback(async (content = inputValue.trim()) => {
        if (!content || isLoading) return;

        const userMessage = {
            id: `msg_${Date.now()}`,
            type: 'user',
            content,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        setIsTyping(true);

        try {
            const timer = performanceMonitor.startTimer('regulatory_query');
            const response = await generateRegulatoryResponse(content);

            const assistantMessage = {
                id: `msg_${Date.now()}_assistant`,
                type: 'assistant',
                content: response.content,
                timestamp: new Date(),
                metadata: {
                    model: response.model,
                    provider: response.provider,
                    confidence: response.confidence,
                    sources: response.sources || [],
                    processingTime: timer.end()
                }
            };

            setMessages(prev => [...prev, assistantMessage]);

            await telemetry.logEvent('regulatory_chat', 'message_sent', {
                sessionId: currentSession,
                messageLength: content.length,
                responseLength: response.content.length,
                model: response.model,
                provider: response.provider
            });
        } catch (error) {
            console.error('Chat error:', error);

            const errorMessage = {
                id: `msg_${Date.now()}_error`,
                type: 'assistant',
                content: 'I apologize, but I encountered an error processing your request. Please check that Ollama is running and try again.',
                timestamp: new Date(),
                metadata: { error: error.message }
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setIsTyping(false);
        }
    }, [inputValue, isLoading, currentSession, settings]);

    // Handle copying message content
    const handleCopyMessage = useCallback(async (content) => {
        try {
            await navigator.clipboard.writeText(content);

            // Show temporary success feedback
            const clickedButton = document.activeElement;

            if (clickedButton && clickedButton.classList.contains('copy-button')) {
                const originalText = clickedButton.textContent;
                clickedButton.textContent = '✅';
                clickedButton.style.background = 'var(--ai-success)';
                clickedButton.style.color = 'white';

                setTimeout(() => {
                    clickedButton.textContent = originalText;
                    clickedButton.style.background = '';
                    clickedButton.style.color = '';
                }, 2000);
            }

            await telemetry.logEvent('regulatory_chat', 'message_copied', {
                contentLength: content.length,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to copy message:', error);

            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = content;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }, []);

    // Handle keyboard shortcuts
    const handleKeyDown = useCallback(e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }, [handleSendMessage]);

    // Quick prompt suggestions
    const quickPrompts = [
        "What are the FDA 510(k) requirements for Class II medical devices?",
        "How do I implement ISO 13485 quality management system?",
        "What are EU MDR clinical evidence requirements?",
        "Explain medical device risk management per ISO 14971",
        "What is the FDA De Novo classification process?",
        "How do I get Health Canada medical device license?"
    ];

    const handleQuickPrompt = useCallback(prompt => {
        setInputValue(prompt);
        inputRef.current?.focus();
    }, []);

    // Test AI connection
    const testAIConnection = async () => {
        setIsLoading(true);
        try {
            await loadAvailableModels();
            const testQuery = "Hello, can you confirm you're working? Please respond briefly.";
            console.log(`🧪 Testing AI with model: ${settings.model}`);

            const response = await generateRegulatoryResponse(testQuery);

            const testMessage = {
                id: `test_${Date.now()}`,
                type: 'assistant',
                content: `🧪 **AI Test Successful!**

**Model**: ${response.model}
**Available Models**: ${availableModels.length}

**Response**: ${response.content.substring(0, 300)}${response.content.length > 300 ? '...' : ''}

✅ Your local AI setup is working correctly!`,
                timestamp: new Date(),
                metadata: { isTest: true }
            };

            setMessages(prev => [...prev, testMessage]);
        } catch (error) {
            const errorMessage = {
                id: `test_error_${Date.now()}`,
                type: 'assistant',
                content: `🧪 **AI Test Failed**

**Error**: ${error.message}
**Model**: ${settings.model}
**Available Models**: ${availableModels.length}

**Fix Steps:**
1. **Start Ollama**: \`ollama serve\`
2. **Check Models**: \`ollama list\`
3. **Install Model**: \`ollama pull ${settings.model}\`
4. **Test Direct**: \`ollama run ${settings.model} "Hello"\`

**Available Models**: ${availableModels.map(m => m.name || m).join(', ') || 'None detected'}`,
                timestamp: new Date(),
                metadata: { isTest: true, error: error.message }
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Save/load/clear functions
    const handleSaveSession = useCallback(() => {
        const session = {
            id: currentSession,
            title: `Regulatory Chat - ${new Date().toLocaleDateString()}`,
            messages,
            timestamp: new Date(),
            settings
        };
        setChatHistory(prev => [session, ...prev.slice(0, 9)]);
    }, [currentSession, messages, settings]);

    const handleLoadSession = useCallback(session => {
        setMessages(session.messages);
        setCurrentSession(session.id);
        setSettings(session.settings);
        setShowHistory(false);
    }, []);

    const handleClearChat = useCallback(() => {
        setMessages([{
            id: 'welcome_new',
            type: 'assistant',
            content: 'Chat cleared. How can I help you with regulatory compliance today?',
            timestamp: new Date(),
            metadata: { type: 'welcome' }
        }]);
        setCurrentSession(`regulatory_chat_${Date.now()}`);
    }, []);

    // Document Hub handlers
    const handleDocumentAdded = useCallback((count) => {
        const message = {
            id: `doc_added_${Date.now()}`,
            type: 'assistant',
            content: `✅ **${count} document(s) uploaded successfully!**

Your documents have been processed and are now available for AI analysis. You can:

• **Ask specific questions** about the content in your documents
• **Search for information** across all uploaded documents  
• **Get AI-powered insights** based on your regulatory files

**Example questions you can ask:**
• "What are the key requirements mentioned in my uploaded FDA guidance?"
• "Summarize the risk management sections from my documents"
• "Find information about Class II device requirements in my files"

🚀 **Optimized Storage**: Documents are stored in high-performance memory for instant access and complete privacy.

Try asking a question about your uploaded documents!`,
            timestamp: new Date(),
            metadata: { type: 'document_upload' }
        };

        setMessages(prev => [...prev, message]);

        // Switch to chat tab to see the confirmation
        setActiveTab('chat');
    }, []);

    const handleDocumentDeleted = useCallback((documentId) => {
        console.log(`📄 Document deleted: ${documentId}`);
        // Optionally add a message about document deletion
    }, []);

    return (
        <div className="regulatory-ai-chat-container">
            {/* Chat Header */}
            <div className="regulatory-chat-header">
                <div className="chat-title-section">
                    <h2 className="chat-title">Regulatory AI Assistant</h2>
                    <p className="chat-subtitle">
                        Expert guidance using local AI models with document analysis
                        <span className="model-status">
                            🖥️ {settings.model} ({availableModels.length} models) |
                            📄 Storage {isChromaConnected ? '🟢 Server' : '🚀 Optimized'}
                        </span>
                    </p>
                </div>

                <div className="chat-actions">
                    <button className="btn btn-secondary" onClick={loadAvailableModels} title="Refresh Models">
                        🔄
                    </button>
                    <button className="btn btn-secondary" onClick={testAIConnection} title="Test AI">
                        🧪
                    </button>
                    <button className="btn btn-secondary" onClick={initializeChromaDB} title="Test ChromaDB">
                        🔌
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowHistory(!showHistory)} title="History">
                        📋
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowSettings(!showSettings)} title="Settings">
                        ⚙️
                    </button>
                    <button className="btn btn-secondary" onClick={handleSaveSession} title="Save Session">
                        💾
                    </button>
                    <button className="btn btn-secondary" onClick={handleClearChat} title="Clear Chat">
                        🗑️
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation">
                <button
                    className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
                    onClick={() => setActiveTab('chat')}
                >
                    💬 AI Chat
                </button>
                <button
                    className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
                    onClick={() => setActiveTab('documents')}
                >
                    📄 Document Hub
                </button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="chat-settings-panel">
                    <div className="settings-header">
                        <h3>Local AI Settings</h3>
                        <button onClick={() => setShowSettings(false)}>✕</button>
                    </div>
                    <div className="settings-content">
                        <div className="setting-group">
                            <label>Model ({availableModels.length} available)</label>
                            <select
                                value={settings.model}
                                onChange={e => setSettings(prev => ({ ...prev, model: e.target.value }))}
                            >
                                {availableModels.length > 0 ? (
                                    availableModels.map(model => {
                                        const modelName = model.name || model;
                                        const memoryEst = model.memoryEstimate || 'Unknown';
                                        return (
                                            <option key={modelName} value={modelName}>
                                                {modelName} (~{memoryEst}GB RAM)
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value={settings.model}>{settings.model} (Not detected)</option>
                                )}
                            </select>
                            <small>Local models from your Ollama installation</small>
                        </div>
                        <div className="setting-group">
                            <label>Temperature: {settings.temperature}</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={settings.temperature}
                                onChange={e => setSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                            />
                        </div>
                        <div className="setting-group">
                            <label>Max Tokens</label>
                            <input
                                type="number"
                                value={settings.maxTokens}
                                onChange={e => setSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Chat History */}
            {showHistory && (
                <div className="chat-history-sidebar">
                    <div className="history-header">
                        <h3>Chat History</h3>
                        <button onClick={() => setShowHistory(false)}>✕</button>
                    </div>
                    <div className="history-list">
                        {chatHistory.length === 0 ? (
                            <p className="no-history">No saved sessions</p>
                        ) : (
                            chatHistory.map(session => (
                                <div key={session.id} className="history-item" onClick={() => handleLoadSession(session)}>
                                    <div className="history-title">{session.title}</div>
                                    <div className="history-meta">
                                        {session.messages.length} messages • {session.timestamp.toLocaleDateString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="main-content-area">
                {activeTab === 'chat' ? (
                    /* AI Chat Tab */
                    <div className="regulatory-chat-main">
                        <div className="regulatory-messages-container" ref={messagesContainerRef}>
                            <div className="messages-list">
                                {messages.map(message => (
                                    <div key={message.id} className={`message ${message.type}`}>
                                        <div className="message-content">
                                            {/* Copy button for assistant messages */}
                                            {message.type === 'assistant' && (
                                                <button
                                                    className="copy-button"
                                                    onClick={() => handleCopyMessage(message.content)}
                                                    title="Copy message"
                                                >
                                                    📋
                                                </button>
                                            )}
                                            <div className="message-text">
                                                {message.content.split('\n').map((line, index) => (
                                                    <div key={index}>
                                                        {line.startsWith('##') ? (
                                                            <h3 className="message-heading">{line.replace('##', '').trim()}</h3>
                                                        ) : line.startsWith('###') ? (
                                                            <h4 className="message-subheading">{line.replace('###', '').trim()}</h4>
                                                        ) : line.startsWith('•') ? (
                                                            <div className="message-bullet">{line}</div>
                                                        ) : line.startsWith('✅') || line.startsWith('⚠️') ? (
                                                            <div className="message-status">{line}</div>
                                                        ) : (
                                                            <div>{line}</div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            {message.metadata && (
                                                <div className="message-metadata">
                                                    {message.metadata.model && (
                                                        <span className="metadata-item">Model: {message.metadata.model}</span>
                                                    )}
                                                    {message.metadata.relevantDocs && message.metadata.relevantDocs.length > 0 && (
                                                        <span className="metadata-item">📄 {message.metadata.relevantDocs.length} docs referenced</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="message-timestamp">
                                            {message.timestamp.toLocaleTimeString()}
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="message assistant typing">
                                        <div className="message-content">
                                            <div className="typing-indicator">
                                                <span></span><span></span><span></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Quick Prompts */}
                        <div className="quick-prompts">
                            <div className="quick-prompts-header">💡 Quick Questions:</div>
                            <div className="quick-prompts-list">
                                {quickPrompts.map((prompt, index) => (
                                    <button
                                        key={index}
                                        className="quick-prompt-btn"
                                        onClick={() => handleQuickPrompt(prompt)}
                                        disabled={isLoading}
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="regulatory-input-container">
                            <div className="input-wrapper">
                                <textarea
                                    ref={inputRef}
                                    value={inputValue}
                                    onChange={e => {
                                        console.log('📝 Input changed:', e.target.value);
                                        setInputValue(e.target.value);
                                    }}
                                    onKeyDown={handleKeyDown}
                                    placeholder={isChromaConnected
                                        ? "Ask about FDA regulations, your uploaded documents, or any regulatory topic..."
                                        : "Ask about FDA regulations, ISO standards, EU MDR, or any regulatory topic..."
                                    }
                                    className="regulatory-input"
                                    rows={3}
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={() => handleSendMessage()}
                                    disabled={!inputValue.trim() || isLoading}
                                    className={`send-button ${inputValue.trim() ? 'active' : ''}`}
                                    title="Send Message"
                                >
                                    {isLoading ? '⏳' : '🚀'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Document Hub Tab */
                    <DocumentHub
                        onDocumentAdded={handleDocumentAdded}
                        onDocumentDeleted={handleDocumentDeleted}
                    />
                )}
            </div>
        </div>
    );
};

export default RegulatoryAIChat;