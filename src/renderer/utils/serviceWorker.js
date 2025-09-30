/**
 * Service Worker Registration and Management
 * Handles caching, offline functionality, and performance optimization
 */

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register(config) {
  // Skip service worker registration in Electron environment
  if (window.electronAPI || window.location.protocol === 'file:') {
    console.log('Service worker disabled in Electron environment');
    return;
  }

  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(window.PUBLIC_URL || '', window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${window.PUBLIC_URL || ''}/service-worker.js`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log('This web app is being served cache-first by a service worker.');
        });
      } else {
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('New content is available and will be used when all tabs are closed.');
              
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              console.log('Content is cached for offline use.');
              
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch(error => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then(response => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then(registration => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running in offline mode.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
}

// Cache management utilities
export class CacheManager {
  constructor() {
    this.cacheName = 'authentcare-cache-v1';
    this.staticAssets = [
      '/',
      './runtime.js',
      './react.js',
      './main.js',
      './index.html',
    ];
  }

  async install() {
    try {
      const cache = await caches.open(this.cacheName);
      await cache.addAll(this.staticAssets);
      console.log('Static assets cached successfully');
    } catch (error) {
      console.error('Failed to cache static assets:', error);
    }
  }

  async handleFetch(request) {
    try {
      // Try network first for API calls
      if (request.url.includes('/api/')) {
        return await this.networkFirst(request);
      }
      
      // Cache first for static assets
      return await this.cacheFirst(request);
    } catch (error) {
      console.error('Fetch handler error:', error);
      return new Response('Offline', { status: 503 });
    }
  }

  async networkFirst(request) {
    try {
      const networkResponse = await fetch(request);
      
      if (networkResponse.ok) {
        const cache = await caches.open(this.cacheName);
        cache.put(request, networkResponse.clone());
      }
      
      return networkResponse;
    } catch (error) {
      const cachedResponse = await caches.match(request);
      return cachedResponse || new Response('Offline', { status: 503 });
    }
  }

  async cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    try {
      const networkResponse = await fetch(request);
      
      if (networkResponse.ok) {
        const cache = await caches.open(this.cacheName);
        cache.put(request, networkResponse.clone());
      }
      
      return networkResponse;
    } catch (error) {
      return new Response('Offline', { status: 503 });
    }
  }

  async clearCache() {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('All caches cleared');
  }

  async getCacheSize() {
    const cache = await caches.open(this.cacheName);
    const requests = await cache.keys();
    
    let totalSize = 0;
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
    
    return totalSize;
  }
}

// Performance optimization utilities
export class PerformanceOptimizer {
  constructor() {
    this.preloadQueue = new Set();
    this.prefetchQueue = new Set();
  }

  preloadResource(url, as = 'fetch') {
    if (this.preloadQueue.has(url)) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = as;
    
    document.head.appendChild(link);
    this.preloadQueue.add(url);
  }

  prefetchResource(url) {
    if (this.prefetchQueue.has(url)) return;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    
    document.head.appendChild(link);
    this.prefetchQueue.add(url);
  }

  preloadCriticalResources() {
    // Preload critical JS files
    this.preloadResource('./runtime.js', 'script');
    this.preloadResource('./react.js', 'script');
    this.preloadResource('./main.js', 'script');
    
    // Note: CSS is inlined by webpack, fonts are embedded in CSS
  }

  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const prefetchUrl = element.dataset.prefetch;
          
          if (prefetchUrl) {
            this.prefetchResource(prefetchUrl);
            observer.unobserve(element);
          }
        }
      });
    }, {
      rootMargin: '50px',
    });

    // Observe elements with data-prefetch attribute
    document.querySelectorAll('[data-prefetch]').forEach(element => {
      observer.observe(element);
    });
  }

  optimizeImages() {
    if (!('IntersectionObserver' in window)) return;

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src;
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

// Initialize performance optimizations
export function initializePerformanceOptimizations() {
  const optimizer = new PerformanceOptimizer();
  
  // Preload critical resources
  optimizer.preloadCriticalResources();
  
  // Setup lazy loading
  optimizer.setupIntersectionObserver();
  optimizer.optimizeImages();
  
  // Setup resource hints based on user interactions
  document.addEventListener('mouseover', (event) => {
    const link = event.target.closest('a[href]');
    if (link && !link.dataset.prefetched) {
      optimizer.prefetchResource(link.href);
      link.dataset.prefetched = 'true';
    }
  });
  
  console.log('Performance optimizations initialized');
}

// Export singleton instances
export const cacheManager = new CacheManager();
export const performanceOptimizer = new PerformanceOptimizer();