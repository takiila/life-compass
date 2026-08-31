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
    const candidates = relative
      ? [join(root, relative), join(root, `${relative}.html`), join(root, relative, 'index.html'), join(root, relative.replace(/[^/\\]+$/, '[id].html'))]
      : [join(root, 'index.html')];
    let target = join(root, 'index.html');
    for (const candidate of candidates) {
      if (!candidate.startsWith(root)) throw new Error('invalid path');
      try { if ((await stat(candidate)).isFile()) { target = candidate; break; } } catch { /* try the next static-route shape */ }
    }
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
  await expect(page.getByText('今日の現在地', { exact: true })).toBeVisible();
  await page.context().setOffline(false);
});

test('all important routes render without an application error', async ({ page }) => {
  for (const route of ['/study', '/training', '/journey', '/journey/tutorial', '/settings', '/weekly-review', '/backup', '/training/check-in', '/training/reflection', '/training/goal', '/training/recovery', '/training/form-guide', '/training/form-history', '/training/exercises', '/training/exercises/supported-squat', '/training/library', '/blue-team', '/dev/theme-lab', '/dev/rpg-lab']) {
    await page.goto(route);
    await expect(page.locator('body')).not.toContainText('Application error');
    await expect(page.locator('body')).not.toBeEmpty();
  }
});

test('creates a two-tier Daily Training plan and saves a short reflection', async ({ page }) => {
  await page.goto('/training');
  await expect(page.getByText('今日の現在地', { exact: true })).toBeVisible();
  await expect(page.getByText('今日の最低ライン', { exact: true }).last()).toBeVisible();
  await expect(page.getByText('今日の理想ライン', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: /今日のプランを作る/ }).click();
  await expect(page.getByText('今日の状態からプランを作る', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '今日のプランを保存' }).click();
  await expect(page.getByText('今日の最低ライン', { exact: true }).last()).toBeVisible();
  await page.getByRole('button', { name: /完了にする/ }).first().click();
  await page.goto('/training/reflection');
  await page.getByRole('button', { name: '振り返りを保存' }).click();
  await expect(page.getByText('今日の振り返りを保存しました。')).toBeVisible();
  await page.waitForTimeout(500);
  await page.reload();
  await expect(page.getByText('今日の振り返りを保存しました。')).toBeVisible();
});

test('keeps an urgent-symptom plan on safety hold', async ({ page }) => {
  await page.goto('/training/check-in');
  await page.getByRole('button', { name: 'ある' }).click();
  await expect(page.getByText(/本人調整で解除できません/)).toBeVisible();
  await page.getByRole('button', { name: '今日のプランを保存' }).click();
  await expect(page.getByText(/Safety hold中です/).last()).toBeVisible();
  await expect(page.getByRole('button', { name: 'この提案で始める' })).toHaveCount(0);
});

test('keeps the weekly proposal pending until the user decides', async ({ page }) => {
  await page.goto('/weekly-review');
  await page.getByRole('button', { name: '今週を集計して案を作る' }).click();
  await expect(page.getByText('本人が選ぶまで来週へ反映しません。')).toBeVisible();
  await page.getByRole('button', { name: 'このまま採用' }).click();
  await expect(page.getByText(/本人の決定:/)).toBeVisible();
  await page.waitForTimeout(500);
  await page.reload();
  await expect(page.getByText(/本人の決定:/)).toBeVisible();
});

test('keeps the RPG sandbox unavailable in the production export', async ({ page }) => {
  await page.goto('/dev/rpg-lab');
  await expect(page.getByText('RPG Sandboxは無効です', { exact: true })).toBeVisible();
  await expect(page.getByText('Stage Run', { exact: true })).toHaveCount(0);
  await expect(page.getByText(/productionの進行・通貨・collectionへは接続しません/)).toBeVisible();
  await page.goto('/journey/store?sandbox=1');
  await expect(page.getByText('RPG Sandboxは無効です', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Cで解放/ })).toHaveCount(0);
  await page.goto('/blue-team?sandbox=1');
  await expect(page.getByText('RPG Sandboxは無効です', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '今日は閉じる' })).toHaveCount(0);
});

test('records form history and allows the Journey tutorial to be replayed', async ({ page }) => {
  await page.goto('/training/form-guide');
  await page.getByRole('button', { name: 'フォームを確認した' }).click();
  await page.getByText('フォーム確認履歴', { exact: true }).click();
  await expect(page).toHaveURL(/\/training\/form-history/);
  await expect(page.getByText('まだ履歴はありません。フォームガイドの「フォームを確認した」から記録できます。')).toBeHidden();
  await expect(page.getByRole('link', { name: /ガイドをもう一度見る/ })).toBeVisible();

  await page.goto('/journey/tutorial');
  await page.getByRole('button', { name: '案内を確認した' }).click();
  await expect(page.getByText(/前回確認:/)).toBeVisible();
  await page.waitForTimeout(500);
  await page.reload();
  await expect(page.getByText(/前回確認:/)).toBeVisible();
  await page.goto('/settings');
  await expect(page.getByText('RPGチュートリアルを再表示', { exact: true })).toBeVisible();
});

test('completes the Training golden path from recommendation to reflection', async ({ page }) => {
  await page.goto('/training');
  await expect(page.getByText("TODAY'S RECOMMENDATION", { exact: true })).toBeVisible();
  await expect(page.getByText(/本人が変更・中止できます/)).toBeVisible();
  await page.getByRole('button', { name: 'この提案で始める' }).click();
  await expect(page.getByText('実行手順', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '7', exact: true }).click();
  await page.getByRole('button', { name: '実行結果を記録する' }).click();
  await expect(page.getByText(/次は痛みや疲労が残っていないか/)).toBeVisible();
  await expect(page.getByText('1', { exact: true }).first()).toBeVisible();
});
