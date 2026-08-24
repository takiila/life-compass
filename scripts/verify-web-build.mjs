import { access, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const dist = join(process.cwd(), 'dist');
await access(join(dist, '.nojekyll'));
await access(join(dist, 'manifest.webmanifest'));
await access(join(dist, 'sw.js'));
const jsDir = join(dist, '_expo', 'static', 'js', 'web');
const js = (await readdir(jsDir)).filter((name) => name.endsWith('.js'));
if (!js.length) throw new Error('No Expo web JavaScript bundle found');
const html = await readFile(join(dist, 'index.html'), 'utf8');
for (const bundle of js) if (!html.includes(`/_expo/static/js/web/${bundle}`)) throw new Error(`index.html does not reference ${bundle}`);
if (!html.includes('/pwa-register.js')) throw new Error('PWA registration script is missing');
console.log(`Verified ${js.length} Expo bundle(s), .nojekyll, manifest and service worker.`);
