import PluginRegistry from './pluginRegistry.js';
import ProAnalyserPlugin from './ProAnalyserPlugin.js';
import { PLUGIN_EVENTS } from './eventTypes.js';

const defaultPlugins = {
  pptGenerator: () => import('../proAnalyser/PPTGenerator.js').then(
    module => new ProAnalyserPlugin('pptGenerator', new module.default())
  ),
  gapAnalyser: () => import('../proAnalyser/GapAnalyser.js').then(
    module => new ProAnalyserPlugin('gapAnalyser', new module.default())
  ),
  competitorAnalyser: () => import('../proAnalyser/CompetitorAnalyser.js').then(
    module => new ProAnalyserPlugin('competitorAnalyser', new module.default())
  ),
  timelinePro: () => import('../proAnalyser/TimelinePro.js').then(
    module => new ProAnalyserPlugin('timelinePro', new module.default())
  ),
  costEstimationTool: () => import('../proAnalyser/CostEstimationTool.js').then(
    module => new ProAnalyserPlugin('costEstimationTool', new module.default())
  ),
  pathwayToMarket: () => import('../proAnalyser/PathwayToMarket.js').then(
    module => new ProAnalyserPlugin('pathwayToMarket', new module.default())
  ),
  strategyMaker: () => import('../proAnalyser/StrategyMaker.js').then(
    module => new ProAnalyserPlugin('strategyMaker', new module.default())
  ),
  regulatoryAdvisor: () => import('../proAnalyser/RegulatoryAdvisor.js').then(
    module => new ProAnalyserPlugin('regulatoryAdvisor', new module.default())
  ),
  predicateFinder: () => import('../proAnalyser/PredicateFinder.js').then(
    module => new ProAnalyserPlugin('predicateFinder', new module.default())
  ),
  masterFileMaker: () => import('../proAnalyser/MasterFileMaker.js').then(
    module => new ProAnalyserPlugin('masterFileMaker', new module.default())
  ),
  qmsAdvisorPro: () => import('../proAnalyser/QMSAdvisorPro.js').then(
    module => new ProAnalyserPlugin('qmsAdvisorPro', new module.default())
  ),
  pmsAdvisorPro: () => import('../proAnalyser/PMSAdvisorPro.js').then(
    module => new ProAnalyserPlugin('pmsAdvisorPro', new module.default())
  )
};

async function loadPlugins(config = {}) {
  const pluginsToLoad = {
    ...defaultPlugins,
    ...config.plugins
  };

  for (const [name, loader] of Object.entries(pluginsToLoad)) {
    if (config.disabled?.includes(name)) {
      continue;
    }

    try {
      const PluginClass = (await loader()).default;
      const plugin = new PluginClass();
      pluginRegistry.registerPlugin(plugin);
      await pluginRegistry.initializePlugin(name);
      
      if (!config.disabled?.includes(name)) {
        await pluginRegistry.enablePlugin(name);
      }
    } catch (error) {
      PluginRegistry.emit(PLUGIN_EVENTS.PLUGIN_ERROR, {
        pluginName: name,
        error: error.message,
        details: error
      });
    }
  }
}

export { loadPlugins as default, defaultPlugins };
