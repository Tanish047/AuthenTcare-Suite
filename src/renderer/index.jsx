import './styles.css';
import './modern-rag.css';
import './styles/components/search-bar-scrollable-fix.css';
import './styles/components/professional-message-input.css';
import './styles/components/input-fix-override.css';
import './styles/components/simple-query-input.css';
import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.jsx';
import { performanceMonitor } from './utils/performanceMonitor.js';
import { register as registerSW, initializePerformanceOptimizations } from './utils/serviceWorker.js';

// Initialize performance monitoring
performanceMonitor.markMilestone('app_start');

// Initialize performance optimizations
initializePerformanceOptimizations();

// Register service worker in production (disabled for Electron)
const isProduction = window.location.protocol !== 'file:' && !window.electronAPI;
if (isProduction) {
  registerSW({
    onSuccess: (registration) => {
      console.log('Service worker registered successfully');
      performanceMonitor.markMilestone('sw_registered');
    },
    onUpdate: (registration) => {
      console.log('New service worker available');
      // Optionally show update notification to user
    },
  });
} else {
  console.log('Service worker registration skipped (Electron environment)');
}

const container = document.getElementById('root');
const root = createRoot(container);

// Measure initial render performance
const renderTimer = performanceMonitor.startTimer('initial_render');

root.render(<App />);

// Mark render completion
requestAnimationFrame(() => {
  renderTimer.end();
  performanceMonitor.markMilestone('app_rendered');
});
