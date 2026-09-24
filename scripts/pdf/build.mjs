// Build the learning hub PDF: markdown -> HTML (Mermaid diagrams, highlighted code) -> PDF via headless Chromium.
// Usage: cd scripts/pdf && npm install && node build.mjs
// Output: learn/ios27-in-7-days.pdf
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Marked } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import hljs from 'highlight.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const learn = path.join(root, 'learn');
const nm = path.join(here, 'node_modules');

// Chapter order. Missing files are skipped with a warning so partial builds still work.
const PARTS = [
  { title: 'Start here', files: ['README.md'] },
  { title: 'The seven days', files: [
    '00-mental-models.md',
    'day1-swift-and-concurrency.md',
    'day2-swiftui-liquid-glass-design.md',
    'day3-data-lifecycle-system.md',
    'day4-app-intents-siri-system-surfaces.md',
    'day5-apple-intelligence-and-ml.md',
    'day6-metal4-graphics-and-compute.md',
    'day7-ship-like-a-senior.md',
  ] },
  { title: 'Capstone', files: ['capstone-errand.md'] },
  { title: 'Cheat sheets', files: [
    'cheatsheets/swift-concurrency.md',
    'cheatsheets/swiftui-and-design.md',
    'cheatsheets/app-intents-and-siri.md',
    'cheatsheets/ai-and-ml.md',
    'cheatsheets/metal4.md',
  ] },
  { title: 'Reference', files: ['glossary.md'] },
];

const REPO_URL = 'https://github.com/ehzawad/ideation-of-ios-app/blob/main/';

function slugPrefix(file) { return file.replace(/[^a-z0-9]+/gi, '-').replace(/-md$/, '').toLowerCase(); }

function renderMarkdown(md, file) {
  const prefix = slugPrefix(file);
  const marked = new Marked(gfmHeadingId({ prefix: prefix + '--' }));
  marked.use({
    renderer: {
      code({ text, lang }) {
        if (lang === 'mermaid') return `<pre class="mermaid">${text.replace(/</g, '&lt;')}</pre>`;
        const language = lang && hljs.getLanguage(lang) ? lang : (lang === 'metal' || lang === 'msl' ? 'cpp' : 'plaintext');
        const html = hljs.highlight(text, { language }).value;
        return `<pre class="code"><code class="hljs language-${language}">${html}</code></pre>`;
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        let h = href || '';
        if (!/^(https?:|mailto:|#)/.test(h)) {
          // relative link inside the repo: point at the chapter anchor if it's in the book, else GitHub
          const target = path.normalize(path.join(path.dirname(file), h.split('#')[0]));
          const inBook = PARTS.some(p => p.files.includes(target));
          h = inBook ? '#chapter-' + slugPrefix(target) : REPO_URL + path.normalize(path.join('learn', path.dirname(file), h));
        }
        return `<a href="${h}"${title ? ` title="${title}"` : ''}>${text}</a>`;
      },
      image({ href, text }) {
        if (/^https?:/.test(href)) return `<img src="${href}" alt="${text}">`;
        const abs = path.resolve(learn, path.dirname(file), href);
        return existsSync(abs) ? `<img src="file://${abs}" alt="${text}">` : '';
      },
    },
  });
  // drop the "← Learning hub" breadcrumb lines
  md = md.replace(/^\[← [^\]]+\]\([^)]*\)\s*$/gm, '');
  return marked.parse(md);
}

const css = `
@font-face { font-family: Inter; font-weight: 400; src: url(file://${nm}/@fontsource/inter/files/inter-latin-400-normal.woff2); }
@font-face { font-family: Inter; font-weight: 600; src: url(file://${nm}/@fontsource/inter/files/inter-latin-600-normal.woff2); }
@font-face { font-family: Inter; font-weight: 700; src: url(file://${nm}/@fontsource/inter/files/inter-latin-700-normal.woff2); }
@font-face { font-family: JBMono; font-weight: 400; src: url(file://${nm}/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2); }
@font-face { font-family: JBMono; font-weight: 600; src: url(file://${nm}/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-600-normal.woff2); }
@page { size: A4; margin: 18mm 16mm 20mm 16mm; }
:root { --ink:#16161a; --ink2:#4a4a52; --muted:#8a8a93; --line:#e4e4e8; --accent:#2a78d6; --code-bg:#f6f7f9; }
html { font-family: Inter, -apple-system, sans-serif; font-size: 10pt; color: var(--ink); line-height: 1.55; }
body { margin: 0; }
h1, h2, h3, h4 { line-height: 1.25; break-after: avoid; }
h1 { font-size: 22pt; margin: 0 0 10pt; letter-spacing: -0.3pt; }
h2 { font-size: 14pt; margin: 20pt 0 6pt; padding-top: 6pt; border-top: 1px solid var(--line); }
h3 { font-size: 11.5pt; margin: 14pt 0 4pt; }
h4 { font-size: 10.5pt; margin: 10pt 0 3pt; color: var(--ink2); }
p, li { orphans: 3; widows: 3; }
a { color: var(--accent); text-decoration: none; }
blockquote { margin: 8pt 0; padding: 6pt 10pt; border-left: 3px solid var(--accent); background: #f3f7fd; color: var(--ink2); }
code { font-family: JBMono, monospace; font-size: 8.6pt; background: var(--code-bg); padding: 0.5pt 3pt; border-radius: 3px; }
pre.code { background: var(--code-bg); border: 1px solid var(--line); border-radius: 6px; padding: 8pt 10pt; overflow: hidden; white-space: pre-wrap; word-break: break-word; break-inside: avoid; }
pre.code code { background: none; padding: 0; font-size: 8.2pt; line-height: 1.45; }
pre.mermaid { text-align: center; break-inside: avoid; margin: 10pt 0; background: none; }
pre.mermaid svg { max-width: 100% !important; height: auto; }
table { border-collapse: collapse; width: 100%; margin: 8pt 0; font-size: 8.8pt; break-inside: auto; }
th, td { border: 1px solid var(--line); padding: 4pt 6pt; vertical-align: top; text-align: left; }
th { background: #f4f4f6; font-weight: 600; }
tr { break-inside: avoid; }
details { margin: 4pt 0 8pt; padding: 4pt 8pt; border: 1px solid var(--line); border-radius: 6px; background: #fbfbfc; }
details > summary { font-weight: 600; color: var(--ink2); }
img { max-width: 100%; }
.chapter { break-before: page; }
.part { break-before: page; display: flex; flex-direction: column; justify-content: center; height: 240mm; }
.part h1 { font-size: 30pt; color: var(--accent); border: none; }
.cover { height: 255mm; display: flex; flex-direction: column; justify-content: space-between; }
.cover .kicker { font-size: 10pt; letter-spacing: 3pt; color: var(--muted); font-weight: 600; margin-top: 30mm; }
.cover h1 { font-size: 40pt; letter-spacing: -1pt; margin: 6pt 0 10pt; }
.cover .sub { font-size: 14pt; color: var(--ink2); max-width: 150mm; }
.cover .meta { font-size: 9.5pt; color: var(--muted); }
.cover .bar { height: 6pt; width: 60mm; background: linear-gradient(90deg, #2a78d6, #eb6834, #1baf7a); border-radius: 3pt; margin: 14pt 0; }
.toc { break-before: page; }
.toc ol { list-style: none; padding: 0; }
.toc li { margin: 3pt 0; }
.toc .p { font-weight: 700; margin-top: 10pt; color: var(--accent); }
.toc a { color: var(--ink); }
`;

const date = new Date().toISOString().slice(0, 10);
let body = `<section class="cover"><div>
  <div class="kicker">A SEVEN-DAY MENTAL-MODEL BOOTCAMP</div>
  <h1>iOS 27 in 7 Days</h1>
  <div class="bar"></div>
  <div class="sub">The mental model a five-year iOS developer carries: Swift 6.4, SwiftUI and Liquid Glass, App Intents and Siri AI, Foundation Models and on-device ML, Metal 4, and shipping. iOS 27 only.</div>
  </div>
  <div class="meta">Built ${date} from the learning hub in github.com/ehzawad/ideation-of-ios-app. APIs verified against developer.apple.com.<br>Text licensed CC BY 4.0.</div>
</section>`;

let toc = '<section class="toc"><h1>Contents</h1><ol>';
let chapters = '';
for (const part of PARTS) {
  const present = part.files.filter(f => existsSync(path.join(learn, f)));
  for (const f of part.files) if (!present.includes(f)) console.warn('skip (missing):', f);
  if (!present.length) continue;
  toc += `<li class="p">${part.title}</li>`;
  if (part.title !== 'Start here') chapters += `<section class="part"><h1>${part.title}</h1></section>`;
  for (const f of present) {
    const md = readFileSync(path.join(learn, f), 'utf8');
    const title = (md.match(/^#\s+(.+)$/m) || [, f])[1];
    const id = 'chapter-' + slugPrefix(f);
    toc += `<li><a href="#${id}">${title}</a></li>`;
    chapters += `<section class="chapter" id="${id}">${renderMarkdown(md, f)}</section>`;
  }
}
toc += '</ol></section>';

const html = `<!doctype html><html><head><meta charset="utf-8"><title>iOS 27 in 7 Days</title>
<link rel="stylesheet" href="file://${nm}/highlight.js/styles/github.css"><style>${css}</style></head>
<body>${body}${toc}${chapters}
<script src="file://${nm}/mermaid/dist/mermaid.min.js"></script>
<script>
  document.querySelectorAll('details').forEach(d => d.open = true);
  mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose', fontFamily: 'Inter', flowchart: { htmlLabels: true, useMaxWidth: true }, sequence: { useMaxWidth: true } });
  window.__mermaidDone = mermaid.run({ querySelector: 'pre.mermaid', suppressErrors: true }).then(() => 'ok', e => 'err:' + e);
</script></body></html>`;

const outDir = path.join(root, 'scripts', 'pdf', 'out');
mkdirSync(outDir, { recursive: true });
const htmlPath = path.join(outDir, 'book.html');
writeFileSync(htmlPath, html);

const { chromium } = await import('/opt/node22/lib/node_modules/playwright/index.mjs').catch(() => import('playwright'));
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('file://' + htmlPath, { waitUntil: 'load' });
const status = await page.evaluate(() => window.__mermaidDone);
const failed = await page.evaluate(() => [...document.querySelectorAll('pre.mermaid')].filter(p => !p.querySelector('svg') || p.textContent.includes('Syntax error')).length);
await page.evaluate(() => document.fonts.ready);
const footer = `<div style="font-family:Inter,sans-serif;font-size:7.5pt;color:#8a8a93;width:100%;padding:0 16mm;display:flex;justify-content:space-between"><span>iOS 27 in 7 Days</span><span class="pageNumber"></span></div>`;
const out = path.join(learn, 'ios27-in-7-days.pdf');
await page.pdf({ path: out, format: 'A4', printBackground: true, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: footer, margin: { top: '16mm', bottom: '18mm', left: '16mm', right: '16mm' } });
await browser.close();
console.log(`mermaid: ${status}, failed diagrams: ${failed}`);
console.log('wrote', path.relative(root, out));
