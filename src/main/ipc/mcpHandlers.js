import { ipcMain, BrowserWindow } from 'electron';
import { mcpEngine } from '../../services/mcpEngine.js';
import { telemetry } from '../../services/telemetry.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * MCP IPC Handlers - Bridge between renderer and MCP engine
 */
export class MCPHandlers {
  constructor() {
    this.setupHandlers();
  }

  setupHandlers() {
    // Core MCP operations
    ipcMain.handle('mcp-initialize', this.initializeMCP.bind(this));
    ipcMain.handle('mcp-call-tool', this.callTool.bind(this));
    ipcMain.handle('mcp-orchestrate', this.orchestrate.bind(this));
    ipcMain.handle('mcp-get-status', this.getStatus.bind(this));
    ipcMain.handle('mcp-get-servers', this.getServers.bind(this));
    ipcMain.handle('mcp-get-tools', this.getTools.bind(this));

    // Advanced features
    ipcMain.handle('mcp-predict-next-actions', this.predictNextActions.bind(this));
    ipcMain.handle('mcp-get-recommendations', this.getRecommendations.bind(this));
    ipcMain.handle('mcp-analyze-workflow', this.analyzeWorkflow.bind(this));

    // Autonomous agents
    ipcMain.handle('mcp-get-agents', this.getAutonomousAgents.bind(this));
    ipcMain.handle('mcp-control-agent', this.controlAgent.bind(this));

    // Configuration management
    ipcMain.handle('mcp-update-config', this.updateConfig.bind(this));
    ipcMain.handle('mcp-reload-config', this.reloadConfig.bind(this));

    // Monitoring and analytics
    ipcMain.handle('mcp-get-analytics', this.getAnalytics.bind(this));
    ipcMain.handle('mcp-get-performance-metrics', this.getPerformanceMetrics.bind(this));

    // Setup event forwarding from MCP engine to renderer
    this.setupEventForwarding();
  }

  async initializeMCP(event) {
    try {
      console.log('🚀 Initializing MCP from IPC...');

      // Load MCP configuration
      const config = await this.loadMCPConfig();

      // Initialize the MCP engine
      await mcpEngine.initialize(config);

      await telemetry.logMaintenance('mcp_initialized', 'completed');

      return {
        success: true,
        message: 'MCP Engine initialized successfully',
        status: mcpEngine.getStatus(),
      };
    } catch (error) {
      console.error('❌ MCP initialization failed:', error);
      await telemetry.logMaintenance('mcp_initialized', 'failed', { error: error.message });

      return {
        success: false,
        error: error.message,
      };
    }
  }

  async loadMCPConfig() {
    try {
      // Try workspace config first
      const workspaceConfigPath = path.join(process.cwd(), '.kiro/settings/mcp.json');

      try {
        const workspaceConfig = await fs.readFile(workspaceConfigPath, 'utf8');
        console.log('📁 Loaded workspace MCP config');
        return JSON.parse(workspaceConfig);
      } catch (workspaceError) {
        console.log('⚠️ No workspace MCP config found, trying user config...');
      }

      // Fallback to user config
      const userConfigPath = path.join(
        process.env.HOME || process.env.USERPROFILE,
        '.kiro/settings/mcp.json'
      );

      try {
        const userConfig = await fs.readFile(userConfigPath, 'utf8');
        console.log('👤 Loaded user MCP config');
        return JSON.parse(userConfig);
      } catch (userError) {
        console.log('⚠️ No user MCP config found, using default config');
      }

      // Return minimal default config
      return {
        mcpServers: {},
        orchestration: { enabled: false },
        ai_enhancement: { enabled: false },
        monitoring: { enabled: true },
      };
    } catch (error) {
      console.error('❌ Failed to load MCP config:', error);
      throw new Error(`Failed to load MCP configuration: ${error.message}`);
    }
  }

  async callTool(event, serverName, toolName, params = {}, context = {}) {
    try {
      console.log(`🔧 IPC Tool call: ${serverName}:${toolName}`);

      const startTime = Date.now();
      const result = await mcpEngine.callTool(serverName, toolName, params, context);
      const duration = Date.now() - startTime;

      await telemetry.logMaintenance('mcp_tool_call', 'completed', {
        server: serverName,
        tool: toolName,
        duration,
      });

      return {
        success: true,
        data: result,
        metadata: {
          server: serverName,
          tool: toolName,
          duration,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error(`❌ Tool call failed: ${serverName}:${toolName}:`, error);

      await telemetry.logMaintenance('mcp_tool_call', 'failed', {
        server: serverName,
        tool: toolName,
        error: error.message,
      });

      return {
        success: false,
        error: error.message,
        server: serverName,
        tool: toolName,
      };
    }
  }

  async orchestrate(event, tasks, options = {}) {
    try {
      console.log('🎭 IPC Orchestration request:', tasks.length, 'tasks');

      const startTime = Date.now();
      const results = await mcpEngine.orchestrate(tasks, options);
      const duration = Date.now() - startTime;

      await telemetry.logMaintenance('mcp_orchestration', 'completed', {
        taskCount: tasks.length,
        duration,
        fusionMode: options.fusion_mode,
      });

      return {
        success: true,
        data: results,
        metadata: {
          taskCount: tasks.length,
          duration,
          fusionMode: options.fusion_mode,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('❌ Orchestration failed:', error);

      await telemetry.logMaintenance('mcp_orchestration', 'failed', {
        taskCount: tasks.length,
        error: error.message,
      });

      return {
        success: false,
        error: error.message,
        taskCount: tasks.length,
      };
    }
  }

  async getStatus(event) {
    try {
      const status = mcpEngine.getStatus();
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

  async getServers(event) {
    try {
      const servers = Array.from(mcpEngine.servers.entries()).map(([name, server]) => ({
        name,
        status: server.status,
        capabilities: server.capabilities,
        specialization: server.specialization,
        priority: server.priority,
        performance: server.performance,
        lastUsed: server.lastUsed,
      }));

      return {
        success: true,
        data: servers,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getTools(event, serverName = null) {
    try {
      const tools = {};

      if (serverName) {
        const server = mcpEngine.servers.get(serverName);
        if (server) {
          tools[serverName] = server.config.autoApprove || [];
        }
      } else {
        for (const [name, server] of mcpEngine.servers) {
          tools[name] = server.config.autoApprove || [];
        }
      }

      return {
        success: true,
        data: tools,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async predictNextActions(event, context) {
    try {
      console.log('🔮 Predicting next actions for context:', context);

      const predictions = [];

      // Analyze current context and predict likely next actions
      if (context.currentPage === 'research-workspace') {
        if (context.selectedProject && !context.selectedDevice) {
          predictions.push({
            action: 'analyze-project-requirements',
            server: 'regulatory-brain',
            tool: 'analyze-global-requirements',
            confidence: 0.85,
            reason: 'User has selected a project and likely needs requirement analysis',
          });
        }

        if (context.selectedDevice && !context.selectedVersion) {
          predictions.push({
            action: 'assess-device-compliance',
            server: 'compliance-oracle',
            tool: 'predict-compliance-issues',
            confidence: 0.78,
            reason: 'Device selected, compliance assessment typically follows',
          });
        }

        if (context.selectedMarket) {
          predictions.push({
            action: 'get-market-updates',
            server: `${context.selectedMarket.regulatory_body.toLowerCase()}-expert`,
            tool: `get-${context.selectedMarket.regulatory_body.toLowerCase()}-updates`,
            confidence: 0.92,
            reason: 'Market selected, regulatory updates are commonly needed',
          });
        }
      }

      if (context.currentPage === 'sop-generator') {
        predictions.push({
          action: 'generate-sop',
          server: 'document-genius',
          tool: 'generate-sop-documents',
          confidence: 0.95,
          reason: 'User is on SOP generator page',
        });
      }

      return {
        success: true,
        data: predictions,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getRecommendations(event, context) {
    try {
      console.log('💡 Getting AI recommendations for context:', context);

      const recommendations = [];

      // Generate intelligent recommendations based on current state
      if (
        context.selectedProject &&
        context.selectedDevice &&
        context.selectedVersion &&
        context.selectedMarket
      ) {
        // Complete pathway - recommend optimization
        recommendations.push({
          type: 'optimization',
          title: 'Optimize Compliance Pathway',
          description:
            'Your pathway is complete. Let me analyze it for optimization opportunities.',
          action: {
            server: 'workflow-optimizer',
            tool: 'optimize-compliance-workflow',
            params: context,
          },
          priority: 'high',
          estimatedBenefit: 'Save 15-30% time and costs',
        });

        recommendations.push({
          type: 'risk-assessment',
          title: 'Comprehensive Risk Assessment',
          description: 'Perform a detailed risk assessment for your complete pathway.',
          action: {
            server: 'risk-assessor',
            tool: 'assess-compliance-risks',
            params: context,
          },
          priority: 'medium',
          estimatedBenefit: 'Identify and mitigate potential risks early',
        });
      }

      if (context.selectedMarket && !context.hasRecentUpdates) {
        recommendations.push({
          type: 'intelligence',
          title: 'Get Latest Regulatory Updates',
          description: `Check for recent updates from ${context.selectedMarket.regulatory_body}`,
          action: {
            server: `${context.selectedMarket.regulatory_body.toLowerCase()}-expert`,
            tool: `get-${context.selectedMarket.regulatory_body.toLowerCase()}-updates`,
            params: { market: context.selectedMarket },
          },
          priority: 'high',
          estimatedBenefit: 'Stay current with regulatory changes',
        });
      }

      // Always recommend market intelligence
      recommendations.push({
        type: 'intelligence',
        title: 'Market Trend Analysis',
        description: 'Get insights on current market trends and opportunities.',
        action: {
          server: 'market-prophet',
          tool: 'forecast-market-trends',
          params: { context },
        },
        priority: 'low',
        estimatedBenefit: 'Strategic market insights',
      });

      return {
        success: true,
        data: recommendations,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async analyzeWorkflow(event, workflowData) {
    try {
      console.log('📊 Analyzing workflow efficiency...');

      // Simulate workflow analysis
      const analysis = {
        efficiency_score: 78,
        bottlenecks: [
          {
            stage: 'requirement_analysis',
            delay_factor: 1.3,
            suggestion: 'Use AI-powered requirement analysis to reduce time by 30%',
          },
          {
            stage: 'document_generation',
            delay_factor: 1.5,
            suggestion: 'Implement automated SOP generation',
          },
        ],
        optimization_opportunities: [
          {
            area: 'Parallel Processing',
            potential_savings: '25% time reduction',
            implementation: 'Run compliance checks and document generation in parallel',
          },
          {
            area: 'Predictive Caching',
            potential_savings: '40% faster responses',
            implementation: 'Pre-load commonly needed regulatory data',
          },
        ],
        recommendations: [
          'Enable autonomous compliance monitoring',
          'Use cross-server intelligence fusion',
          'Implement predictive workflow optimization',
        ],
      };

      return {
        success: true,
        data: analysis,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getAutonomousAgents(event) {
    try {
      const agents = Array.from(mcpEngine.autonomousAgents.entries()).map(([name, agent]) => ({
        name,
        isActive: agent.isActive,
        triggers: agent.triggers,
        actions: agent.actions,
        lastExecution: agent.lastExecution,
        schedule: agent.schedule,
      }));

      return {
        success: true,
        data: agents,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async controlAgent(event, agentName, action) {
    try {
      const agent = mcpEngine.autonomousAgents.get(agentName);
      if (!agent) {
        throw new Error(`Agent ${agentName} not found`);
      }

      switch (action) {
        case 'start':
          agent.isActive = true;
          break;
        case 'stop':
          agent.isActive = false;
          break;
        case 'execute':
          await mcpEngine.executeAutonomousAgent(agent);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      return {
        success: true,
        message: `Agent ${agentName} ${action} completed`,
        agent: {
          name: agentName,
          isActive: agent.isActive,
          lastExecution: agent.lastExecution,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async updateConfig(event, newConfig) {
    try {
      // Save updated config to workspace
      const configPath = path.join(process.cwd(), '.kiro/settings/mcp.json');
      await fs.writeFile(configPath, JSON.stringify(newConfig, null, 2));

      // Reinitialize MCP engine with new config
      await mcpEngine.initialize(newConfig);

      return {
        success: true,
        message: 'MCP configuration updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async reloadConfig(event) {
    try {
      const config = await this.loadMCPConfig();
      await mcpEngine.initialize(config);

      return {
        success: true,
        message: 'MCP configuration reloaded successfully',
        config,
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
      // Generate analytics based on MCP usage
      const analytics = {
        timeRange,
        totalCalls: 0,
        successRate: 0,
        averageResponseTime: 0,
        mostUsedServers: [],
        mostUsedTools: [],
        performanceTrends: [],
        costAnalysis: {
          totalCost: 0,
          costByServer: {},
          costTrends: [],
        },
      };

      // Calculate analytics from monitoring data
      for (const [serverName, metrics] of mcpEngine.monitoring.performance) {
        analytics.totalCalls += metrics.calls.length;

        const successfulCalls = metrics.calls.filter(call => call.success);
        analytics.successRate += successfulCalls.length;

        const avgResponseTime =
          metrics.calls.reduce((sum, call) => sum + call.responseTime, 0) / metrics.calls.length;
        analytics.averageResponseTime += avgResponseTime;

        analytics.mostUsedServers.push({
          server: serverName,
          calls: metrics.calls.length,
          avgResponseTime,
        });
      }

      // Calculate overall averages
      const serverCount = mcpEngine.monitoring.performance.size;
      if (serverCount > 0) {
        analytics.successRate = (analytics.successRate / analytics.totalCalls) * 100;
        analytics.averageResponseTime = analytics.averageResponseTime / serverCount;
      }

      // Sort most used servers
      analytics.mostUsedServers.sort((a, b) => b.calls - a.calls);

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

  async getPerformanceMetrics(event) {
    try {
      const metrics = {
        servers: {},
        overall: {
          totalServers: mcpEngine.servers.size,
          healthyServers: 0,
          totalCalls: 0,
          cacheHitRate: 0,
          averageResponseTime: 0,
        },
      };

      // Collect server metrics
      for (const [serverName, server] of mcpEngine.servers) {
        if (server.status === 'connected') {
          metrics.overall.healthyServers++;
        }

        metrics.servers[serverName] = {
          status: server.status,
          performance: server.performance,
          capabilities: server.capabilities,
          specialization: server.specialization,
          lastUsed: server.lastUsed,
        };

        metrics.overall.totalCalls += server.performance.totalCalls;
        metrics.overall.averageResponseTime += server.performance.avgResponseTime;
      }

      // Calculate overall averages
      if (mcpEngine.servers.size > 0) {
        metrics.overall.averageResponseTime =
          metrics.overall.averageResponseTime / mcpEngine.servers.size;
      }

      // Calculate cache hit rate
      const cacheSize = mcpEngine.cache.size;
      metrics.overall.cacheHitRate =
        cacheSize > 0 ? (cacheSize / (cacheSize + metrics.overall.totalCalls)) * 100 : 0;

      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  setupEventForwarding() {
    // Forward MCP engine events to renderer process
    mcpEngine.on('initialized', () => {
      this.broadcastToRenderers('mcp-initialized');
    });

    mcpEngine.on('tool_call_success', data => {
      this.broadcastToRenderers('mcp-tool-success', data);
    });

    mcpEngine.on('tool_call_error', data => {
      this.broadcastToRenderers('mcp-tool-error', data);
    });

    mcpEngine.on('server_unhealthy', data => {
      this.broadcastToRenderers('mcp-server-unhealthy', data);
    });

    mcpEngine.on('server_recovered', data => {
      this.broadcastToRenderers('mcp-server-recovered', data);
    });

    mcpEngine.on('agent_executed', data => {
      this.broadcastToRenderers('mcp-agent-executed', data);
    });

    mcpEngine.on('orchestration_complete', data => {
      this.broadcastToRenderers('mcp-orchestration-complete', data);
    });
  }

  broadcastToRenderers(channel, data = {}) {
    // Send to all renderer processes
    BrowserWindow.getAllWindows().forEach(window => {
      window.webContents.send(channel, data);
    });
  }
}

// Export singleton instance
export const mcpHandlers = new MCPHandlers();
