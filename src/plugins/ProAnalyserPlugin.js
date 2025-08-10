import { PLUGIN_EVENTS } from './eventTypes.js';
import BasePlugin from './basePlugin.js';

export default class ProAnalyserPlugin extends BasePlugin {
  constructor(name, analyser) {
    super(name, '1.0.0');
    this.analyser = analyser;
    this.currentContext = null;
  }

  async initialize() {
    // Initialize any required resources
    await this.analyser.initialize();
    this.emit(PLUGIN_EVENTS.PLUGIN_INITIALIZED, { name: this.name });
  }

  async onEnable() {
    this.emit(PLUGIN_EVENTS.PLUGIN_ENABLED, { name: this.name });
  }

  async onDisable() {
    // Cleanup when plugin is disabled
    this.currentContext = null;
    this.emit(PLUGIN_EVENTS.PLUGIN_DISABLED, { name: this.name });
  }

  setContext(context) {
    this.currentContext = context;
    this.emit(PLUGIN_EVENTS.CONTEXT_CHANGED, context);
  }

  async analyze(options = {}) {
    if (!this.currentContext) {
      throw new Error('No context set for analysis');
    }

    try {
      this.emit(PLUGIN_EVENTS.ANALYSIS_STARTED, { context: this.currentContext });
      
      await this.analyser.initialize(this.currentContext, options);
      const result = await this.analyser.analyse();
      
      if (result) {
        const report = await this.analyser.generateReport();
        this.emit(PLUGIN_EVENTS.ANALYSIS_COMPLETED, { report });
        return report;
      }
      
      const error = new Error('Analysis failed');
      this.emit(PLUGIN_EVENTS.ANALYSIS_ERROR, { error });
      return { success: false, error: error.message };
    } catch (error) {
      this.emit(EVENT_TYPES.ANALYSIS_ERROR, { error });
      return { success: false, error: error.message };
    }
  }

  getStatus() {
    return {
      status: this.analyser.status,
      progress: this.analyser.progress,
      error: this.analyser.error
    };
  }
}
