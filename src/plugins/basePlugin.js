class BasePlugin {
  constructor(name, version) {
    this.name = name;
    this.version = version;
    this.enabled = false;
  }

  async initialize() {
    throw new Error('Initialize method must be implemented by plugin');
  }

  async enable() {
    if (!this.enabled) {
      await this.onEnable();
      this.enabled = true;
    }
  }

  async disable() {
    if (this.enabled) {
      await this.onDisable();
      this.enabled = false;
    }
  }

  async onEnable() {
    // Override in plugin implementation
  }

  async onDisable() {
    // Override in plugin implementation
  }

  // Plugin lifecycle hooks
  async beforeDatabaseMigration() {}
  async afterDatabaseMigration() {}
  async beforeAppStart() {}
  async afterAppStart() {}
  async beforeAppClose() {}

  // Event handling
  handleEvent(eventName, data) {
    // Default implementation logs the event
    if (process.env.NODE_ENV === 'development') {
      // Only log in development

      console.debug(`Plugin ${this.name} received event:`, eventName, data);
    }
  }

  emit(eventName, data = {}) {
    if (!this.enabled) {
      return;
    }

    try {
      this.handleEvent(eventName, {
        ...data,
        plugin: this.name,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // Prevent event handling errors from breaking the plugin
      this.setError(error);
    }
  }

  setError(error) {
    const eventData = {
      plugin: this.name,
      error: error instanceof Error ? error : new Error(error),
      timestamp: new Date().toISOString(),
    };

    this.handleEvent('plugin:error', eventData);
  }
}

export default BasePlugin;
