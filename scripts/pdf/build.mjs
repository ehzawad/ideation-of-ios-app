// Build the repo's books: markdown -> HTML (Mermaid diagrams, highlighted code) -> PDF via headless Chromium.
// Usage: cd scripts/pdf && npm install && node build.mjs [learn|atlas|agentos|all]   (default: all)
// Outputs are listed in BOOKS below. Missing chapter files are skipped with a warning so partial builds work.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Marked } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import hljs from 'highlight.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const nm = path.join(here, 'node_modules');
const REPO_URL = 'https://github.com/ehzawad/ideation-of-ios-app/blob/main/';
const ls = (dir) => existsSync(path.join(root, dir)) ? readdirSync(path.join(root, dir)).filter(f => f.endsWith('.md') && f !== 'README.md').sort().map(f => `${dir}/${f}`) : [];

const BOOKS = {
  learn: {
    out: 'learn/ios27-in-7-days.pdf',
    title: 'iOS 27 in 7 Days',
    kicker: 'A SEVEN-DAY MENTAL-MODEL BOOTCAMP',
    sub: 'The mental model a five-year iOS developer carries: Swift 6.4, SwiftUI and Liquid Glass, App Intents and Siri AI, Foundation Models and on-device ML, Metal 4, and shipping. iOS 27 only.',
    meta: 'APIs verified against developer.apple.com.',
    parts: [
      { title: 'Start here', files: ['learn/README.md'], partPage: false },
      { title: 'The seven days', files: ['learn/00-mental-models.md', 'learn/day1-swift-and-concurrency.md', 'learn/day2-swiftui-liquid-glass-design.md', 'learn/day3-data-lifecycle-system.md', 'learn/day4-app-intents-siri-system-surfaces.md', 'learn/day5-apple-intelligence-and-ml.md', 'learn/day6-metal4-graphics-and-compute.md', 'learn/day7-ship-like-a-senior.md'] },
      { title: 'Capstone', files: ['learn/capstone-errand.md'] },
      { title: 'Cheat sheets', files: ['learn/cheatsheets/swift-concurrency.md', 'learn/cheatsheets/swiftui-and-design.md', 'learn/cheatsheets/app-intents-and-siri.md', 'learn/cheatsheets/ai-and-ml.md', 'learn/cheatsheets/metal4.md'] },
      { title: 'Reference', files: ['learn/glossary.md'] },
    ],
  },
  atlas: {
    out: 'books/agentic-ios-idea-atlas.pdf',
    title: 'Agentic iOS',
    kicker: 'AN IDEA ATLAS · SEPTEMBER 2026',
    sub: '85 iPhone apps that plan and act for you: what is being built now, what almost nobody is building yet, and the moonshots that are still genuinely hard. With the walls iOS puts in the way and how to build inside them.',
    meta: 'Snapshot of iOS 27, a week after Siri AI’s beta launch.',
    parts: [
      { title: 'Start here', files: ['books/atlas/introduction.md'], partPage: false },
      { title: 'The terrain', blurb: 'Who is building what, the walls iOS puts in the way, how to build inside them, and the assumptions that sink agent products.', files: ['docs/landscape-2026.md', 'docs/the-walls.md', 'docs/reference-architecture.md', 'docs/assumptions.md', 'docs/ui-patterns.md'] },
      { title: 'Being built now', blurb: 'Shipping or in active development in 2025–2026. Proven demand; the race is on execution.', files: ls('ideas/building-now') },
      { title: 'Whitespace', blurb: 'Feasible on today’s iPhone, but almost nobody is building it. The unclaimed ground.', files: ls('ideas/whitespace') },
      { title: 'Moonshots', blurb: 'Worth wanting, genuinely hard. Each card names the wall and what would have to change.', files: ls('ideas/moonshot') },
      { title: 'Appendix', files: ['ideas/README.md', 'docs/method.md'] },
    ],
  },
  agentos: {
    out: 'books/the-agentic-phone.pdf',
    title: 'The Agentic Phone',
    kicker: 'A DESIGN FOR WHAT COMES AFTER APPS',
    sub: 'A ground-up mobile operating system where the home screen is a conversation. You speak or type; an agent plans, calls typed capabilities, asks before it acts, and shows small generated interfaces. How it would work, and how to try it today.',
    meta: 'A design study. Apple has not announced anything like it.',
    parts: [
      { title: 'Start here', files: ['agentic-os/README.md'], partPage: false },
      { title: 'The book', files: ls('agentic-os/chapters') },
      { title: 'The prototype', files: ['agentic-os/prototype/README.md'] },
    ],
  },
};

function slugPrefix(file) { return file.replace(/[^a-z0-9]+/gi, '-').replace(/-md$/, '').toLowerCase(); }

function renderMarkdown(md, file, inBook) {
  const dir = path.dirname(file);
  const marked = new Marked(gfmHeadingId({ prefix: slugPrefix(file) + '--' }));
  marked.use({
    renderer: {
      code({ text, lang }) {
        if (lang === 'mermaid') return `<pre class="mermaid">${text.replace(/</g, '&lt;')}</pre>`;
        const language = lang && hljs.getLanguage(lang) ? lang : (lang === 'metal' || lang === 'msl' ? 'cpp' : 'plaintext');
        return `<pre class="code"><code class="hljs language-${language}">${hljs.highlight(text, { language }).value}</code></pre>`;
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        let h = href || '';
        if (!/^(https?:|mailto:|#)/.test(h)) {
          const target = path.normalize(path.join(dir, h.split('#')[0]));
          h = inBook.has(target) ? '#chapter-' + slugPrefix(target) : REPO_URL + target;
        }
        return `<a href="${h}"${title ? ` title="${title}"` : ''}>${text}</a>`;
      },
      image({ href, text }) {
        if (/^https?:/.test(href)) return `<img src="${href}" alt="${text}">`;
        const abs = path.resolve(root, dir, href);
        return existsSync(abs) ? `<img src="file://${abs}" alt="${text}">` : '';
      },
      html({ text }) {
        // inline <img src="relative"> used in the atlas: make paths absolute
        return text.replace(/src="(?!https?:|file:)([^"]+)"/g, (m, src) => {
          const abs = path.resolve(root, dir, src);
          return existsSync(abs) ? `src="file://${abs}"` : m;
        });
      },
    },
  });
  md = md.replace(/^\[← [^\]]+\]\([^)]*\).*$/gm, '');
  md = md.replace(/<details>\s*<summary>\s*Verified APIs[^<]*<\/summary>[\s\S]*?<\/details>/gi,
    `<p class="verified-note">Every API in this chapter was checked against Apple's documentation. The full list with iOS versions is at the end of the online chapter: <a href="${REPO_URL}${file}">${file}</a>.</p>`);
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
p[align="center"] img { max-height: 200mm; }
.verified-note { font-size: 8.5pt; color: var(--muted); border-top: 1px solid var(--line); padding-top: 6pt; margin-top: 14pt; }
.chapter { break-before: page; }
.part { break-before: page; display: flex; flex-direction: column; justify-content: center; height: 240mm; }
.part h1 { font-size: 30pt; color: var(--accent); border: none; }
.part p { font-size: 13pt; color: var(--ink2); max-width: 140mm; }
.cover { height: 255mm; display: flex; flex-direction: column; justify-content: space-between; }
.cover .kicker { font-size: 10pt; letter-spacing: 3pt; color: var(--muted); font-weight: 600; margin-top: 30mm; }
.cover h1 { font-size: 40pt; letter-spacing: -1pt; margin: 6pt 0 10pt; }
.cover .sub { font-size: 14pt; color: var(--ink2); max-width: 150mm; }
.cover .meta { font-size: 9.5pt; color: var(--muted); }
.cover .bar { height: 6pt; width: 60mm; background: linear-gradient(90deg, #2a78d6, #eb6834, #1baf7a); border-radius: 3pt; margin: 14pt 0; }
.toc { break-before: page; }
.toc ol { list-style: none; padding: 0; columns: 1; }
.toc li { margin: 2.5pt 0; }
.toc .p { font-weight: 700; margin-top: 10pt; color: var(--accent); }
.toc a { color: var(--ink); }
`;

async function build(key) {
  const book = BOOKS[key];
  const date = new Date().toISOString().slice(0, 10);
  const parts = book.parts.map(p => ({ ...p, present: p.files.filter(f => existsSync(path.join(root, f))) }));
  for (const p of parts) for (const f of p.files) if (!p.present.includes(f)) console.warn(`[${key}] skip (missing): ${f}`);
  const inBook = new Set(parts.flatMap(p => p.present));
  let toc = '<section class="toc"><h1>Contents</h1><ol>';
  let chapters = '';
  for (const part of parts) {
    if (!part.present.length) continue;
    toc += `<li class="p">${part.title}</li>`;
    if (part.partPage !== false) chapters += `<section class="part"><h1>${part.title}</h1>${part.blurb ? `<p>${part.blurb}</p>` : ''}</section>`;
    for (const f of part.present) {
      const md = readFileSync(path.join(root, f), 'utf8');
      const title = (md.match(/^#\s+(.+)$/m) || [, f])[1].replace(/`/g, '');
      const id = 'chapter-' + slugPrefix(f);
      toc += `<li><a href="#${id}">${title}</a></li>`;
      chapters += `<section class="chapter" id="${id}">${renderMarkdown(md, f, inBook)}</section>`;
    }
  }
  toc += '</ol></section>';
  const cover = `<section class="cover"><div><div class="kicker">${book.kicker}</div><h1>${book.title}</h1><div class="bar"></div><div class="sub">${book.sub}</div></div>
    <div class="meta">Built ${date} from github.com/ehzawad/ideation-of-ios-app. ${book.meta}<br>Text licensed CC BY 4.0.</div></section>`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${book.title}</title>
<link rel="stylesheet" href="file://${nm}/highlight.js/styles/github.css"><style>${css}</style></head>
<body>${cover}${toc}${chapters}
<script src="file://${nm}/mermaid/dist/mermaid.min.js"></script>
<script>
  document.querySelectorAll('details').forEach(d => d.open = true);
  mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose', fontFamily: 'Inter', flowchart: { htmlLabels: true, useMaxWidth: true }, sequence: { useMaxWidth: true } });
  window.__mermaidDone = mermaid.run({ querySelector: 'pre.mermaid', suppressErrors: true }).then(() => 'ok', e => 'err:' + e);
</script></body></html>`;
  const outDir = path.join(here, 'out');
  mkdirSync(outDir, { recursive: true });
  const htmlPath = path.join(outDir, `${key}.html`);
  writeFileSync(htmlPath, html);
  const { chromium } = await import('/opt/node22/lib/node_modules/playwright/index.mjs').catch(() => import('playwright'));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + htmlPath, { waitUntil: 'load', timeout: 180000 });
  const status = await page.evaluate(() => window.__mermaidDone);
  const failed = await page.evaluate(() => [...document.querySelectorAll('pre.mermaid')].filter(p => !p.querySelector('svg')).length);
  await page.evaluate(() => document.fonts.ready);
  const footer = `<div style="font-family:Inter,sans-serif;font-size:7.5pt;color:#8a8a93;width:100%;padding:0 16mm;display:flex;justify-content:space-between"><span>${book.title}</span><span class="pageNumber"></span></div>`;
  const out = path.join(root, book.out);
  mkdirSync(path.dirname(out), { recursive: true });
  await page.pdf({ path: out, format: 'A4', printBackground: true, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: footer, margin: { top: '16mm', bottom: '18mm', left: '16mm', right: '16mm' }, timeout: 300000 });
  await browser.close();
  console.log(`[${key}] mermaid: ${status}, failed diagrams: ${failed}; wrote ${book.out}`);
}

const which = process.argv[2] || 'all';
for (const key of which === 'all' ? Object.keys(BOOKS) : [which]) {
  if (!BOOKS[key]) { console.error('unknown book', key); process.exit(1); }
  await build(key);
}
