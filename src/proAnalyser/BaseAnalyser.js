export const ANALYSER_STATUS = {
  IDLE: 'idle',
  INITIALIZING: 'initializing',
  ANALYZING: 'analyzing',
  GENERATING: 'generating',
  COMPLETED: 'completed',
  ERROR: 'error'
};

// Separate progress tracking functionality
class ProgressTracker {
  constructor() {
    this.progress = 0;
  }

  updateProgress(value) {
    this.progress = Math.min(100, Math.max(0, value));
  }

  getProgress() {
    return this.progress;
  }

  reset() {
    this.progress = 0;
  }
}

// Separate status management
class StatusManager {
  constructor() {
    this.status = ANALYSER_STATUS.IDLE;
    this.error = null;
  }

  setStatus(status) {
    this.status = status;
  }

  getStatus() {
    return this.status;
  }

  setError(error) {
    this.error = error;
    this.status = ANALYSER_STATUS.ERROR;
  }

  getError() {
    return this.error;
  }

  reset() {
    this.status = ANALYSER_STATUS.IDLE;
    this.error = null;
  }
}

// Main BaseAnalyser class using composition
export default class BaseAnalyser {
  constructor() {
    this.progressTracker = new ProgressTracker();
    this.statusManager = new StatusManager();
    this.validators = new Map(); // For validation strategies
    this.reporters = new Map();  // For report generation strategies
  }

  // Progress delegation
  updateProgress(value) {
    this.progressTracker.updateProgress(value);
  }

  getProgress() {
    return this.progressTracker.getProgress();
  }

  // Status delegation
  setStatus(status) {
    this.statusManager.setStatus(status);
  }

  getStatus() {
    return this.statusManager.getStatus();
  }

  setError(error) {
    this.statusManager.setError(error);
  }

  getError() {
    return this.statusManager.getError();
  }

  // Reset all states
  reset() {
    this.progressTracker.reset();
    this.statusManager.reset();
  }

  // Add validation strategy
  addValidator(name, validatorFn) {
    this.validators.set(name, validatorFn);
  }

  // Add report generation strategy
  addReporter(name, reporterFn) {
    this.reporters.set(name, reporterFn);
  }

  // Validate using registered validators
  async validate(validatorName, data) {
    const validator = this.validators.get(validatorName);
    if (!validator) {
      throw new Error(`Validator ${validatorName} not found`);
    }
    return validator(data);
  }

  // Generate report using registered reporter
  async generateCustomReport(reporterName, data) {
    const reporter = this.reporters.get(reporterName);
    if (!reporter) {
      throw new Error(`Reporter ${reporterName} not found`);
    }
    return reporter(data);
  }

  // Abstract methods that must be implemented
  async initialize() {
    throw new Error('initialize() must be implemented by subclass');
  }

  async analyse() {
    throw new Error('analyse() must be implemented by subclass');
  }

  async generateReport() {
    throw new Error('generateReport() must be implemented by subclass');
  }
}
