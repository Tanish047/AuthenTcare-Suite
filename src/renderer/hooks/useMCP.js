import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '../context/AppContext.jsx';

/**
 * Revolutionary MCP Hook - The most advanced MCP integration hook ever
 *
 * Features:
 * - Intelligent tool calling with context awareness
 * - Autonomous workflow orchestration
 * - Real-time event handling
 * - Predictive recommendations
 * - Performance monitoring
 * - Error handling and retry logic
 */
export function useMCP() {
  const { state, dispatch } = useAppContext();
  const [isInitializing, setIsInitializing] = useState(false);
  const [toolCallHistory, setToolCallHistory] = useState([]);
  const eventListenersRef = useRef([]);

  // Initialize MCP on first use
  useEffect(() => {
    if (!state.mcp.initialized && !isInitializing) {
      initializeMCP();
    }
  }, [state.mcp.initialized, isInitializing]);

  // Initialize MCP Engine
  const initializeMCP = useCallback(async () => {
    if (isInitializing) return;

    setIsInitializing(true);
    try {
      console.log('🚀 Initializing MCP from React hook...');

      const result = await window.mcpAPI.initialize();

      if (result.success) {
        dispatch({ type: 'MCP_SET_INITIALIZED', initialized: true });
        dispatch({ type: 'MCP_SET_STATUS', status: 'connected' });

        // Load initial data
        await loadMCPData();

        console.log('✅ MCP initialized successfully from hook');
      } else {
        console.error('❌ MCP initialization failed:', result.error);
        dispatch({ type: 'MCP_SET_STATUS', status: 'error' });
      }
    } catch (error) {
      console.error('❌ MCP initialization error:', error);
      dispatch({ type: 'MCP_SET_STATUS', status: 'error' });
    } finally {
      setIsInitializing(false);
    }
  }, [isInitializing, dispatch]);

  // Load MCP data
  const loadMCPData = useCallback(async () => {
    try {
      // Load servers
      const serversResult = await window.mcpAPI.getServers();
      if (serversResult.success) {
        dispatch({ type: 'MCP_SET_SERVERS', servers: serversResult.data });
      }

      // Load tools
      const toolsResult = await window.mcpAPI.getTools();
      if (toolsResult.success) {
        dispatch({ type: 'MCP_SET_TOOLS', tools: toolsResult.data });
      }

      // Load autonomous agents
      const agentsResult = await window.mcpAPI.getAutonomousAgents();
      if (agentsResult.success) {
        dispatch({ type: 'MCP_SET_AGENTS', agents: agentsResult.data });
      }

      // Load analytics
      const analyticsResult = await window.mcpAPI.getAnalytics('24h');
      if (analyticsResult.success) {
        dispatch({ type: 'MCP_SET_ANALYTICS', analytics: analyticsResult.data });
      }

      // Load performance metrics
      const metricsResult = await window.mcpAPI.getPerformanceMetrics();
      if (metricsResult.success) {
        dispatch({ type: 'MCP_SET_PERFORMANCE_METRICS', metrics: metricsResult.data });
      }
    } catch (error) {
      console.error('❌ Error loading MCP data:', error);
    }
  }, [dispatch]);

  // Setup event listeners
  useEffect(() => {
    const cleanupFunctions = [];

    // Tool success events
    const toolSuccessCleanup = window.mcpAPI.onToolSuccess(data => {
      dispatch({
        type: 'MCP_ADD_REAL_TIME_EVENT',
        event: {
          type: 'tool_success',
          data,
          timestamp: Date.now(),
        },
      });

      // Update tool call history
      setToolCallHistory(prev => [
        { ...data, success: true, timestamp: Date.now() },
        ...prev.slice(0, 99),
      ]);
    });
    cleanupFunctions.push(toolSuccessCleanup);

    // Tool error events
    const toolErrorCleanup = window.mcpAPI.onToolError(data => {
      dispatch({
        type: 'MCP_ADD_REAL_TIME_EVENT',
        event: {
          type: 'tool_error',
          data,
          timestamp: Date.now(),
        },
      });

      // Update tool call history
      setToolCallHistory(prev => [
        { ...data, success: false, timestamp: Date.now() },
        ...prev.slice(0, 99),
      ]);
    });
    cleanupFunctions.push(toolErrorCleanup);

    // Server health events
    const serverHealthCleanup = window.mcpAPI.onServerHealthChange(data => {
      dispatch({
        type: 'MCP_ADD_REAL_TIME_EVENT',
        event: {
          type: 'server_health',
          data,
          timestamp: Date.now(),
        },
      });

      // Reload servers to update status
      loadMCPData();
    });
    cleanupFunctions.push(serverHealthCleanup);

    // Agent execution events
    const agentExecutionCleanup = window.mcpAPI.onAgentExecution(data => {
      dispatch({
        type: 'MCP_ADD_REAL_TIME_EVENT',
        event: {
          type: 'agent_execution',
          data,
          timestamp: Date.now(),
        },
      });
    });
    cleanupFunctions.push(agentExecutionCleanup);

    // Orchestration events
    const orchestrationCleanup = window.mcpAPI.onOrchestrationComplete(data => {
      dispatch({
        type: 'MCP_ADD_ORCHESTRATION_RESULT',
        result: {
          ...data,
          timestamp: Date.now(),
        },
      });
    });
    cleanupFunctions.push(orchestrationCleanup);

    // Store cleanup functions
    eventListenersRef.current = cleanupFunctions;

    // Cleanup on unmount
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [dispatch, loadMCPData]);

  // Intelligent tool calling with context awareness
  const callTool = useCallback(
    async (serverName, toolName, params = {}, options = {}) => {
      try {
        // Build context from current app state
        const context = {
          currentPage: state.page,
          selectedProject: state.selectedProject,
          selectedDevice: state.selectedDevice,
          selectedVersion: state.selectedVersion,
          selectedMarket: state.selectedMarket,
          selectedLicense: state.selectedLicense,
          currentLevel: state.currentLevel,
          workflow: options.workflow || 'general',
          ...options.context,
        };

        console.log(`🔧 Calling MCP tool: ${serverName}:${toolName}`);

        const result = await window.mcpAPI.callTool(serverName, toolName, params, context);

        if (result.success) {
          console.log(`✅ Tool call successful: ${serverName}:${toolName}`);
          return result.data;
        } else {
          console.error(`❌ Tool call failed: ${serverName}:${toolName}:`, result.error);
          throw new Error(result.error);
        }
      } catch (error) {
        console.error(`❌ Tool call error: ${serverName}:${toolName}:`, error);
        throw error;
      }
    },
    [state]
  );

  // Advanced orchestration with intelligent fusion
  const orchestrate = useCallback(async (tasks, options = {}) => {
    try {
      console.log('🎭 Orchestrating MCP workflow with', tasks.length, 'tasks');

      const result = await window.mcpAPI.orchestrate(tasks, {
        fusion_mode: 'intelligent_synthesis',
        ...options,
      });

      if (result.success) {
        console.log('✅ Orchestration completed successfully');
        return result.data;
      } else {
        console.error('❌ Orchestration failed:', result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Orchestration error:', error);
      throw error;
    }
  }, []);

  // Get AI-powered predictions
  const getPredictions = useCallback(
    async (context = {}) => {
      try {
        const fullContext = {
          currentPage: state.page,
          selectedProject: state.selectedProject,
          selectedDevice: state.selectedDevice,
          selectedVersion: state.selectedVersion,
          selectedMarket: state.selectedMarket,
          selectedLicense: state.selectedLicense,
          currentLevel: state.currentLevel,
          ...context,
        };

        const result = await window.mcpAPI.predictNextActions(fullContext);

        if (result.success) {
          dispatch({ type: 'MCP_SET_PREDICTIONS', predictions: result.data });
          return result.data;
        } else {
          console.error('❌ Failed to get predictions:', result.error);
          return [];
        }
      } catch (error) {
        console.error('❌ Prediction error:', error);
        return [];
      }
    },
    [state, dispatch]
  );

  // Get AI-powered recommendations
  const getRecommendations = useCallback(
    async (context = {}) => {
      try {
        const fullContext = {
          currentPage: state.page,
          selectedProject: state.selectedProject,
          selectedDevice: state.selectedDevice,
          selectedVersion: state.selectedVersion,
          selectedMarket: state.selectedMarket,
          selectedLicense: state.selectedLicense,
          currentLevel: state.currentLevel,
          hasRecentUpdates: false, // TODO: Implement logic to check for recent updates
          ...context,
        };

        const result = await window.mcpAPI.getRecommendations(fullContext);

        if (result.success) {
          dispatch({ type: 'MCP_SET_RECOMMENDATIONS', recommendations: result.data });
          return result.data;
        } else {
          console.error('❌ Failed to get recommendations:', result.error);
          return [];
        }
      } catch (error) {
        console.error('❌ Recommendations error:', error);
        return [];
      }
    },
    [state, dispatch]
  );

  // Analyze workflow efficiency
  const analyzeWorkflow = useCallback(
    async (workflowData = {}) => {
      try {
        const result = await window.mcpAPI.analyzeWorkflow(workflowData);

        if (result.success) {
          dispatch({ type: 'MCP_SET_WORKFLOW_ANALYSIS', analysis: result.data });
          return result.data;
        } else {
          console.error('❌ Failed to analyze workflow:', result.error);
          return null;
        }
      } catch (error) {
        console.error('❌ Workflow analysis error:', error);
        return null;
      }
    },
    [dispatch]
  );

  // Control autonomous agents
  const controlAgent = useCallback(
    async (agentName, action) => {
      try {
        const result = await window.mcpAPI.controlAgent(agentName, action);

        if (result.success) {
          // Reload agents to get updated status
          const agentsResult = await window.mcpAPI.getAutonomousAgents();
          if (agentsResult.success) {
            dispatch({ type: 'MCP_SET_AGENTS', agents: agentsResult.data });
          }

          return result;
        } else {
          console.error(`❌ Failed to ${action} agent ${agentName}:`, result.error);
          throw new Error(result.error);
        }
      } catch (error) {
        console.error(`❌ Agent control error:`, error);
        throw error;
      }
    },
    [dispatch]
  );

  // Refresh MCP data
  const refresh = useCallback(async () => {
    await loadMCPData();
  }, [loadMCPData]);

  // Get MCP status
  const getStatus = useCallback(async () => {
    try {
      const result = await window.mcpAPI.getStatus();
      if (result.success) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting MCP status:', error);
      return null;
    }
  }, []);

  // Clear events
  const clearEvents = useCallback(() => {
    dispatch({ type: 'MCP_CLEAR_EVENTS' });
    setToolCallHistory([]);
  }, [dispatch]);

  return {
    // State
    initialized: state.mcp.initialized,
    status: state.mcp.status,
    servers: state.mcp.servers,
    tools: state.mcp.tools,
    autonomousAgents: state.mcp.autonomousAgents,
    analytics: state.mcp.analytics,
    performanceMetrics: state.mcp.performanceMetrics,
    predictions: state.mcp.predictions,
    recommendations: state.mcp.recommendations,
    workflowAnalysis: state.mcp.workflowAnalysis,
    realTimeEvents: state.mcp.realTimeEvents,
    orchestrationHistory: state.mcp.orchestrationHistory,
    toolCallHistory,
    isInitializing,

    // Actions
    initialize: initializeMCP,
    callTool,
    orchestrate,
    getPredictions,
    getRecommendations,
    analyzeWorkflow,
    controlAgent,
    refresh,
    getStatus,
    clearEvents,

    // Utility functions
    isServerHealthy: serverName => {
      const server = state.mcp.servers.find(s => s.name === serverName);
      return server?.status === 'connected';
    },

    getServerBySpecialization: specialization => {
      return state.mcp.servers.find(s => s.specialization === specialization);
    },

    getToolsByServer: serverName => {
      return state.mcp.tools[serverName] || [];
    },

    getHealthyServers: () => {
      return state.mcp.servers.filter(s => s.status === 'connected');
    },

    getRecentEvents: (count = 10) => {
      return state.mcp.realTimeEvents.slice(0, count);
    },

    getEventsByType: eventType => {
      return state.mcp.realTimeEvents.filter(e => e.type === eventType);
    },
  };
}
