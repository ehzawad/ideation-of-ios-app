// Render the mockups in mockups.html to PNGs.
// Usage: (cd scripts/pdf && npm install) && node scripts/mockups/render.mjs
// Output: assets/mockups/<ID>.png (one phone, 2x) and assets/mockups/gallery.png (all eight with captions)
import path from 'path';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const out = path.join(root, 'assets', 'mockups');
mkdirSync(out, { recursive: true });
const { chromium } = await import('/opt/node22/lib/node_modules/playwright/index.mjs').catch(() => import('playwright'));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 2028, height: 2400 }, deviceScaleFactor: 2 });
await page.goto('file://' + path.join(here, 'mockups.html'));
await page.waitForFunction(() => window.__ready === true);
const ids = await page.$$eval('.phone', els => els.map(e => e.dataset.id));
for (const id of ids) {
  await page.locator(`.phone[data-id="${id}"]`).screenshot({ path: path.join(out, `${id}.png`), omitBackground: true });
}
await page.locator('#root').screenshot({ path: path.join(out, 'gallery.png') });
await browser.close();
console.log('rendered', ids.join(', '), '+ gallery');
