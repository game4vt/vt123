// Service Worker版本号
const CACHE_VERSION = ‘v1.0.0’;
const CACHE_NAME = `vision-training-${CACHE_VERSION}`;

// 需要缓存的文件列表
const urlsToCache = [
‘/’,
‘/index.html’,
‘/manifest.json’,
‘https://unpkg.com/react@18/umd/react.production.min.js’,
‘https://unpkg.com/react-dom@18/umd/react-dom.production.min.js’,
‘https://unpkg.com/@babel/standalone/babel.min.js’,
‘https://cdn.tailwindcss.com’
];

// 安装Service Worker
self.addEventListener(‘install’, (event) => {
console.log(’[Service Worker] 正在安装…’);

event.waitUntil(
caches.open(CACHE_NAME)
.then((cache) => {
console.log(’[Service Worker] 缓存文件’);
return cache.addAll(urlsToCache);
})
.then(() => {
console.log(’[Service Worker] 安装完成’);
return self.skipWaiting();
})
.catch((error) => {
console.log(’[Service Worker] 安装失败:’, error);
})
);
});

// 激活Service Worker
self.addEventListener(‘activate’, (event) => {
console.log(’[Service Worker] 正在激活…’);

event.waitUntil(
caches.keys().then((cacheNames) => {
return Promise.all(
cacheNames.map((cacheName) => {
if (cacheName !== CACHE_NAME) {
console.log(’[Service Worker] 删除旧缓存:’, cacheName);
return caches.delete(cacheName);
}
})
);
}).then(() => {
console.log(’[Service Worker] 激活完成’);
return self.clients.claim();
})
);
});

// 拦截网络请求
self.addEventListener(‘fetch’, (event) => {
event.respondWith(
caches.match(event.request)
.then((response) => {
// 缓存命中 - 返回缓存
if (response) {
return response;
}

```
    // 没有缓存 - 发起网络请求
    return fetch(event.request).then((response) => {
      // 检查是否是有效响应
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }

      // 克隆响应
      const responseToCache = response.clone();

      // 将新请求的资源添加到缓存
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, responseToCache);
      });

      return response;
    }).catch((error) => {
      console.log('[Service Worker] 请求失败:', error);
      // 返回离线页面(可选)
      return new Response('离线模式 - 无法加载资源', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
          'Content-Type': 'text/plain'
        })
      });
    });
  })
```

);
});
