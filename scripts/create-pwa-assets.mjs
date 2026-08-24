import { readdir, stat, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const root = join(process.cwd(), 'dist');
const files = [];
async function walk(directory) {
  for (const name of await readdir(directory)) {
    const path = join(directory, name);
    const info = await stat(path);
    if (info.isDirectory()) await walk(path);
    else if (info.size < 5_000_000 && !name.endsWith('.map') && name !== 'sw.js') files.push('/' + relative(root, path).split(sep).join('/'));
  }
}
await walk(root);
await writeFile(join(root, '.nojekyll'), '');
const cache = `life-compass-${Date.now()}`;
const worker = `const CACHE=${JSON.stringify(cache)};const PRECACHE=${JSON.stringify(files)};self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE)).then(()=>self.skipWaiting())));self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(x=>x.put(e.request,copy));return r}).catch(()=>e.request.mode==='navigate'?caches.match('/index.html'):c)))})`;
await writeFile(join(root, 'sw.js'), worker);
