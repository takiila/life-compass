import { expect, test } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = join(process.cwd(), 'dist');
const mime: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://127.0.0.1').pathname);
    const relative = normalize(pathname).replace(/^[/\\]+/, '');
    let target = join(root, relative);
    if (!target.startsWith(root)) throw new Error('invalid path');
    try { if ((await stat(target)).isDirectory()) target = join(target, 'index.html'); } catch { target = join(root, 'index.html'); }
    const data = await readFile(target);
    response.writeHead(200, { 'Content-Type': mime[extname(target)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(data);
  } catch { response.writeHead(404).end('Not found'); }
});

test.beforeAll(async () => new Promise<void>((resolve) => server.listen(4173, '127.0.0.1', resolve)));
test.afterAll(async () => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));

test('serves the Expo bundle with JavaScript MIME and hydrates controls', async ({ page, request }) => {
  const html = await (await request.get('/')).text();
  const bundlePath = html.match(/src="(\/_expo\/[^\"]+\.js)"/)?.[1];
  expect(bundlePath).toBeTruthy();
  const bundle = await request.get(bundlePath!);
  expect(bundle.status()).toBe(200);
  expect(bundle.headers()['content-type']).toMatch(/javascript/);

  await page.goto('/');
  await expect(page.getByText('最初の一手を軽くする', { exact: true })).toBeVisible();
  const blockedNotice = page.getByText('体重ペースの数値提案は停止します。Studyと運動・回復記録は利用できます。');
  await expect(blockedNotice).toBeVisible();
  const adult = page.getByRole('button', { name: '18歳以上' });
  await adult.click();
  await expect(blockedNotice).toBeHidden();
  await page.getByRole('button', { name: '今日のコンパスを見る' }).click();
  await expect(page.getByText('今日のコンパス', { exact: true })).toBeVisible();
  await page.waitForTimeout(1000);
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await page.context().setOffline(true);
  await page.reload();
  await expect(page.getByText('今日のコンパス', { exact: true })).toBeVisible();
  const trainingMode = page.getByRole('button', { name: 'Training' }).first();
  await trainingMode.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('無理のない一歩', { exact: true })).toBeVisible();
  await page.context().setOffline(false);
});

test('all important routes render without an application error', async ({ page }) => {
  for (const route of ['/study', '/training', '/journey', '/settings', '/weekly-review', '/backup', '/training/goal', '/training/recovery', '/training/form-guide', '/training/library', '/blue-team', '/dev/theme-lab']) {
    await page.goto(route);
    await expect(page.locator('body')).not.toContainText('Application error');
    await expect(page.locator('body')).not.toBeEmpty();
  }
});
