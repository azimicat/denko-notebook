// 画面の部品を端末に保存し、電波のない場所でも一問一答を開けるようにする。
// オンラインのときは毎回サーバーから取り直すため、公開内容を更新すれば次に開いたときに反映される。
const CACHE = 'denko-notebook-v2';
const FILES = ['./','index.html','style.css','data.js','backup.js','app.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install', e => {
 e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
 e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
 if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
 e.respondWith(fetch(e.request).then(res => {
  if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
  return res;
 }).catch(() => caches.match(e.request, {ignoreSearch:true}).then(hit => hit || (e.request.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
});
