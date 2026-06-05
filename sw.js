/* ============================================
   Service Worker — 山东睡眠疗愈交流会
   基本离线缓存
   ============================================ */

const CACHE_NAME = 'sleep-healing-v1';

const PRECACHE_URLS = [
  './',
  './index.html',
  './css/style.css',
  './js/main.js',
  './manifest.json',
  './assets/cover.png',
  './assets/payment-qr.png',
];

// 安装：预缓存核心文件
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// 请求：缓存优先，网络回退
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        // 只缓存同源资源
        if (event.request.url.startsWith(self.location.origin)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
