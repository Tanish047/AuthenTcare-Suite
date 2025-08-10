class PluginRegistry {
  constructor() {
    this.plugins = new Map();
    this.eventSubscriptions = new Map();
  }

  registerPlugin(plugin) {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} is already registered`);
    }
    this.plugins.set(plugin.name, plugin);
  }

  async initializePlugin(name) {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
    }
    await plugin.initialize();
  }

  async enablePlugin(name) {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
    }
    await plugin.enable();
  }

  async disablePlugin(name) {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
    }
    await plugin.disable();
  }

  subscribe(pluginName, eventName, handler) {
    if (!this.eventSubscriptions.has(eventName)) {
      this.eventSubscriptions.set(eventName, new Map());
    }
    const eventHandlers = this.eventSubscriptions.get(eventName);
    eventHandlers.set(pluginName, handler);
  }

  unsubscribe(pluginName, eventName) {
    if (this.eventSubscriptions.has(eventName)) {
      const eventHandlers = this.eventSubscriptions.get(eventName);
      eventHandlers.delete(pluginName);
      if (eventHandlers.size === 0) {
        this.eventSubscriptions.delete(eventName);
      }
    }
  }

  async emit(eventName, data) {
    if (this.eventSubscriptions.has(eventName)) {
      const eventHandlers = this.eventSubscriptions.get(eventName);
      const promises = [];
      for (const [pluginName, handler] of eventHandlers) {
        const plugin = this.plugins.get(pluginName);
        if (plugin && plugin.enabled) {
          promises.push(handler(data));
        }
      }
      await Promise.all(promises);
    }
  }

  async runHook(hookName, ...args) {
    const promises = [];
    for (const plugin of this.plugins.values()) {
      if (plugin.enabled && typeof plugin[hookName] === 'function') {
        promises.push(plugin[hookName](...args));
      }
    }
    await Promise.all(promises);
  }
}

export default new PluginRegistry();
