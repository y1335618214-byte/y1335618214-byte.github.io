'use strict';

// Bump VERSION whenever the application or any bundled word list changes.
// A release is cached as one snapshot: runtime requests never mutate it.
const VERSION = '2026-11-04-netlify-1';
const BASE = new URL('./', self.location.href);
const CACHE_PREFIX = 'wordmem-offline-' + encodeURIComponent(BASE.pathname) + '-';
const CACHE_NAME = CACHE_PREFIX + VERSION;
const ASSETS = [
  'index.html', 'manifest.webmanifest', 'mobile.js', 'mobile.css', 'backup.js',
  'icons/icon.svg', 'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png',
  ...Array.from({ length: 6 }, (_, i) => 'photo-' + String(i + 1).padStart(3, '0') + '.json'),
  ...Array.from({ length: 6 }, (_, i) => 'photo-' + String(i + 1).padStart(3, '0') + '-review.md'),
];
const URLS = ASSETS.map(path => new URL(path, BASE).href);
const ASSET_URLS = new Set(URLS);
const APP_SHELL = new URL('index.html', BASE).href;
let repairTask = null;

async function fetchWithTimeout(request, milliseconds = 5000) {
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), milliseconds);
  try { return await fetch(new Request(request, { cache: 'no-store', signal: abort.signal })); }
  finally { clearTimeout(timer); }
}

async function offlineStatus() {
  if (!(await caches.has(CACHE_NAME))) {
    return { type: 'OFFLINE_STATUS', ready: false, version: VERSION, cached: 0, assets: ASSETS.length, missing: ASSETS.slice() };
  }
  const present = await Promise.all(URLS.map(async url => {
    const response = await caches.match(url, { cacheName: CACHE_NAME });
    return Boolean(response && response.ok);
  }));
  return {
    type: 'OFFLINE_STATUS', ready: present.every(Boolean), version: VERSION,
    cached: present.filter(Boolean).length, assets: ASSETS.length,
    missing: ASSETS.filter((_, i) => !present[i]),
  };
}

async function repairOfflinePackage() {
  if (repairTask) return repairTask;
  repairTask = (async () => {
    try {
      const response = await fetchWithTimeout(new URL('sw.js', BASE).href);
      if (!response.ok) throw new Error('Release metadata unavailable');
      const source = await response.text();
      const release = source.match(/const VERSION = ['"]([^'"]+)['"]/);
      if (!release || release[1] !== VERSION) {
        return { ...(await offlineStatus()), repairError: 'VERSION_MISMATCH' };
      }
      const cache = await caches.open(CACHE_NAME);
      // One atomic addAll batch replaces all entries, or leaves existing entries untouched.
      await cache.addAll(URLS.map(url => new Request(url, { cache: 'reload', credentials: 'same-origin' })));
      return await offlineStatus();
    } catch (error) {
      return { ...(await offlineStatus()), repairError: 'REPAIR_FAILED' };
    } finally { repairTask = null; }
  })();
  return repairTask;
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const alreadyExisted = await caches.has(CACHE_NAME);
    const cache = await caches.open(CACHE_NAME);
    try {
      // addAll rejects HTTP errors and commits the response batch atomically.
      await cache.addAll(URLS.map(url => new Request(url, { cache: 'reload', credentials: 'same-origin' })));
      const status = await offlineStatus();
      if (!status.ready) throw new Error('Incomplete offline package');
    } catch (error) {
      // Do not remove an active release if VERSION was accidentally reused.
      if (!alreadyExisted) await caches.delete(CACHE_NAME);
      throw error;
    }
    // Updates wait until the old windows close, unless the user explicitly applies one.
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    if (!(await offlineStatus()).ready) throw new Error('Offline package is not ready');
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
    const status = await offlineStatus();
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    windows.forEach(client => client.postMessage({ ...status, type: 'OFFLINE_READY' }));
  })());
});

async function fetchPage(request) {
  // HTML and its JS/CSS are a single release, including while an update waits.
  const stored = await caches.match(APP_SHELL, { cacheName: CACHE_NAME });
  if (stored && stored.ok) return stored;
  try {
    const response = await fetchWithTimeout(request, 3000);
    if (response.ok && (response.headers.get('content-type') || '').includes('text/html')) return response;
    throw new Error('App page unavailable');
  } catch (error) {
    return new Response('离线文件尚未准备好。请连接首次安装时的 Wi-Fi，并打开电脑上的单词应用服务后重试。', {
      status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== BASE.origin || !url.pathname.startsWith(BASE.pathname)) return;
  const canonical = new URL(url.href);
  canonical.search = '';
  canonical.hash = '';
  const isAppPage = canonical.href === BASE.href || canonical.href === APP_SHELL;
  if (request.mode === 'navigate' && isAppPage) {
    event.respondWith(fetchPage(request));
    return;
  }
  if (!ASSET_URLS.has(canonical.href)) return;
  event.respondWith((async () => {
    const response = await caches.match(canonical.href, { cacheName: CACHE_NAME });
    if (response && response.ok) return response;
    // Missing cached files are fetched online, but never make an incomplete snapshot look ready.
    return fetch(request);
  })());
});

self.addEventListener('message', event => {
  if (!event.data || typeof event.data !== 'object') return;
  if (event.data.type === 'GET_OFFLINE_STATUS' || event.data.type === 'REPAIR_OFFLINE_PACKAGE') {
    event.waitUntil((async () => {
      const status = event.data.type === 'REPAIR_OFFLINE_PACKAGE' ? await repairOfflinePackage() : await offlineStatus();
      if (event.ports && event.ports[0]) event.ports[0].postMessage(status);
      else if (event.source) event.source.postMessage(status);
    })());
  } else if (event.data.type === 'SKIP_WAITING') {
    event.waitUntil(self.skipWaiting());
  }
});
