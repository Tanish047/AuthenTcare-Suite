import { PLUGIN_EVENTS } from './eventTypes.js';
import BasePlugin from './basePlugin.js';

export default class ProAnalyzerPlugin extends BasePlugin {
  constructor(name, analyzer) {
    super(name, '1.0.0');
    this.analyzer = analyzer;
    this.currentContext = null;
  }

  async initialize() {
    await this.analyzer.initialize();
    this.emit(PLUGIN_EVENTS.PLUGIN_INITIALIZED, { name: this.name });
  }

  async onEnable() {
    this.emit(PLUGIN_EVENTS.PLUGIN_ENABLED, { name: this.name });
  }

  async onDisable() {
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
      await this.analyzer.initialize(this.currentContext, options);
      const ok = await this.analyzer.analyse();
      if (ok) {
        const report = await this.analyzer.generateReport();
        this.emit(PLUGIN_EVENTS.ANALYSIS_COMPLETED, { report });
        return { success: true, report };
      }
      const error = new Error('Analysis failed');
      this.emit(PLUGIN_EVENTS.ANALYSIS_ERROR, { error });
      return { success: false, error: error.message };
    } catch (error) {
      this.emit(PLUGIN_EVENTS.ANALYSIS_ERROR, { error });
      return { success: false, error: error.message };
    }
  }

  getStatus() {
    return {
      status: this.analyzer.status,
      progress: this.analyzer.progress,
      error: this.analyzer.error,
    };
  }
}
