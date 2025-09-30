import React, { useState, useEffect, useMemo, useCallback } from 'react';

const ModernRAGWorkspace = () => {
  console.log('🚀 ModernRAGWorkspace component is loading!');
  
  // Mock state for testing
  const [isInitialized, setIsInitialized] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);
  const [status, setStatus] = useState('connected');
  const [documents, setDocuments] = useState([]);
  const [analytics, setAnalytics] = useState({ documentsIndexed: 5, queriesProcessed: 12 });
  const [indexingProgress, setIndexingProgress] = useState(null);
  
  const [queryText, setQueryText] = useState('');
  const [searchType, setSearchType] = useState('hybrid');
  const [selectedModalities, setSelectedModalities] = useState(['text', 'image', 'audio', 'video', 'structured']);
  const [currentQuery, setCurrentQuery] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock functions
  const initializeRAG = () => console.log('Initialize RAG clicked');
  const handleQuery = () => console.log('Query clicked');
  const handleFileSelection = () => console.log('File selection clicked');

  const quickPrompts = [
    "What are FDA 510(k) requirements for Class II devices?",
    "Compare EMA vs FDA clinical trial requirements",
    "CDSCO medical device registration process",
    "ISO 13485 quality management requirements"
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Clean Professional Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), 
                             radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
                             radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)`
          }}></div>
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Clean Professional Header */}
        <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Regulatory AI Assistant
                  </h1>
                  <p className="text-sm text-white/70">
                    Advanced document analysis and compliance intelligence
                  </p>
                </div>
              </div>
            
              <div className="flex items-center space-x-6">
                {/* Clean Status */}
                <div className="flex items-center space-x-2 text-green-400 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Online</span>
                </div>

                {/* Simple Analytics */}
                {analytics && (
                  <div className="flex items-center space-x-6 text-white/80 text-sm">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <span>{analytics.documentsIndexed} docs</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                      </svg>
                      <span>{analytics.queriesProcessed} queries</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Chat Interface */}
            <div className="lg:col-span-2 space-y-6">
              {/* Chat Messages Area */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                <div className="h-96 overflow-y-auto p-6">
                  {chatHistory.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-3">
                        Welcome to Regulatory AI
                      </h3>
                      <p className="text-white/60 max-w-lg mx-auto leading-relaxed">
                        Ask me anything about FDA, EMA, CDSCO regulations, device classifications, or compliance requirements.
                      </p>
                    </div>
                  ) : (
                    chatHistory.map((message) => (
                      <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {/* Chat message content would go here */}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Input Area */}
              <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 transform hover:scale-[1.01] transition-all duration-500">
                {/* Quick Prompts */}
                {chatHistory.length === 0 && (
                  <div className="mb-6">
                    <p className="text-lg font-semibold text-white mb-4">Try these examples:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {quickPrompts.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => setQueryText(prompt)}
                          className="group text-left p-4 bg-white/20 hover:bg-white/30 backdrop-blur-xl rounded-2xl border border-white/30 text-sm text-white hover:text-white transition-all duration-300 hover:shadow-2xl hover:scale-105 transform"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mt-2 group-hover:animate-pulse"></div>
                            <span className="font-medium leading-relaxed">{prompt}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Field */}
                <div className="relative">
                  <textarea
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    placeholder="Ask about regulatory requirements, compliance standards, device classifications..."
                    disabled={isQuerying}
                    className="w-full h-24 px-6 py-4 pr-20 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl text-white placeholder-white/60 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 resize-none text-base leading-relaxed transition-all duration-300 shadow-xl focus:shadow-2xl focus:scale-[1.02] transform"
                  />
                  
                  <button
                    onClick={handleQuery}
                    disabled={!queryText.trim() || isQuerying}
                    className="absolute bottom-4 right-4 w-12 h-12 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:from-cyan-300 hover:via-blue-400 hover:to-purple-500 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-2xl shadow-2xl hover:shadow-cyan-500/25 disabled:shadow-none transform hover:scale-110 disabled:scale-100 transition-all duration-300 flex items-center justify-center disabled:cursor-not-allowed group"
                  >
                    {isQuerying ? (
                      <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between mt-4 text-sm text-white/70">
                  <span className="flex items-center space-x-2">
                    <kbd className="px-2 py-1 bg-white/20 rounded-lg text-xs font-mono">Enter</kbd>
                    <span>to send</span>
                    <kbd className="px-2 py-1 bg-white/20 rounded-lg text-xs font-mono">Shift+Enter</kbd>
                    <span>for new line</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
                    <span>{selectedModalities.length} content types selected</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Document Management */}
              <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 transform hover:scale-[1.02] transition-all duration-500">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 rounded-2xl blur opacity-75 animate-pulse"></div>
                      <svg className="w-6 h-6 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white">Knowledge Base</h3>
                </div>
                
                <div className="space-y-4">
                  <button
                    onClick={handleFileSelection}
                    disabled={isIndexing}
                    className="w-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 hover:from-emerald-300 hover:via-teal-400 hover:to-cyan-400 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100 group"
                  >
                    {isIndexing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Add Documents</span>
                      </div>
                    )}
                  </button>
                  
                  <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Documents</span>
                      <span className="font-semibold text-white">{documents?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 transform hover:scale-[1.02] transition-all duration-500">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-xl">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 rounded-2xl blur opacity-75 animate-pulse"></div>
                      <svg className="w-6 h-6 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white">Recent Activity</h3>
                </div>
                
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-white/60 font-medium">No recent activity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernRAGWorkspace;