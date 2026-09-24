// Render every ```mermaid block in the repo's markdown with Mermaid 11 in headless Chromium and report failures.
// Usage: (cd scripts/pdf && npm install) && node scripts/check_mermaid.mjs [paths...]
import { readFileSync, readdirSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skip = new Set(['node_modules', '.git', 'out']);
function walk(dir, acc = []) {
  for (const f of readdirSync(dir)) {
    if (skip.has(f)) continue;
    const p = path.join(dir, f);
    if (statSync(p).isDirectory()) walk(p, acc); else if (f.endsWith('.md')) acc.push(p);
  }
  return acc;
}
const files = process.argv.length > 2 ? process.argv.slice(2).map(p => path.resolve(p)) : walk(root);
const blocks = [];
for (const f of files) {
  const md = readFileSync(f, 'utf8');
  const re = /```mermaid\n([\s\S]*?)```/g; let m;
  while ((m = re.exec(md))) blocks.push({ file: path.relative(root, f), line: md.slice(0, m.index).split('\n').length, code: m[1] });
}
const { chromium } = await import('/opt/node22/lib/node_modules/playwright/index.mjs').catch(() => import('playwright'));
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<html><body></body></html>');
await page.addScriptTag({ path: path.join(root, 'scripts/pdf/node_modules/mermaid/dist/mermaid.min.js') });
await page.evaluate(() => mermaid.initialize({ startOnLoad: false }));
let bad = 0;
for (const [i, b] of blocks.entries()) {
  const err = await page.evaluate(async ([code, id]) => {
    try { await mermaid.parse(code); await mermaid.render(id, code); return null; } catch (e) { return String(e.message || e).split('\n').slice(0, 3).join(' | '); }
  }, [b.code, 'm' + i]);
  if (err) { bad++; console.log(`FAIL ${b.file}:${b.line}  ${err}`); }
}
await browser.close();
console.log(`${blocks.length} diagrams in ${files.length} files, ${bad} failed`);
process.exit(bad ? 1 : 0);
