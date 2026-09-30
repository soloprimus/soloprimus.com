#!/usr/bin/env node
// Renders 1200×630 social preview images into assets/og/ with headless Chrome,
// plus assets/apple-touch-icon.png. Run after adding an essay, then run build.mjs.
// Usage: node scripts/og.mjs [zh-default.png ...] (set CHROME_PATH if Chrome is not found)
//        node scripts/og.mjs --preview (serve cards for browser inspection, no capture)

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { SITE, T } from '../content/site.mjs';
import { escapeHtml as esc, parseFrontMatter } from './markdown.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets', 'og');
const NAME = SITE.penName;
const PREVIEW = process.argv.includes('--preview');

const CHROME = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find((p) => p && existsSync(p));
if (!CHROME && !PREVIEW) throw new Error('Chrome not found. Set CHROME_PATH to a Chrome or Edge executable.');

const MARK = 'M50 6 63.8 24C63 28.5 52 32 43 39C34 46 37 51.5 45 59C55 69 51 74 36 74H4Z M66.5 27.5 96 74H81C76 64 66 57.5 56 51C45 44 46 40 53 35.5C59 32 63.5 31 66.5 27.5Z';
const TYPES = { '.css': 'text/css', '.woff2': 'font/woff2', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.png': 'image/png' };

function card({ lang, kicker, title, sub, lines }) {
  const zh = lang === 'zh';
  const slogan = zh && lines;
  const titleFont = slogan ? '"Noto Serif SC","Songti SC",serif' : zh ? '"PingFang SC","Microsoft YaHei","Noto Sans CJK SC",sans-serif' : '"Figtree",sans-serif';
  const size = title.length > (zh ? 14 : 34) ? (zh ? 60 : 62) : zh ? 72 : 76;
  // Break long Chinese titles at the first comma instead of inside a word.
  const comma = zh ? title.indexOf('，') : -1;
  const titleHtml = slogan ? lines.map((line) => `<span>${esc(line)}</span>`).join('') : comma > 0 && title.length > 12 ? `${esc(title.slice(0, comma + 1))}<br>${esc(title.slice(comma + 1))}` : esc(title);
  return `<!doctype html><html lang="${zh ? 'zh-CN' : 'en'}"><head><meta charset="utf-8">
<link rel="stylesheet" href="/assets/css/fonts.css">
<style>
*{box-sizing:border-box}html,body{margin:0;width:1200px;height:630px;overflow:hidden}
body{background:#fdfcf9;color:#171715;font-family:"Figtree",sans-serif;position:relative}
.rule{position:absolute;left:0;top:0;width:1200px;height:10px;background:#a4461d}
.copy{position:absolute;left:84px;top:92px;width:700px;height:460px;display:flex;flex-direction:column}
.kicker{font:700 22px/1.2 "Figtree",${titleFont};letter-spacing:${zh ? '.1em' : '.16em'};text-transform:uppercase;color:#8c3915;margin:0 0 26px}
h1{margin:0;font:700 ${size}px/${zh ? 1.3 : 1.06} ${titleFont};letter-spacing:${zh ? '.01em' : '-.025em'};text-wrap:balance}
${slogan ? 'h1{font-weight:400;font-size:68px;line-height:1.4;letter-spacing:.1em}h1 span{display:block}h1 span:last-child{color:#8c3915}' : ''}
.sub{margin:24px 0 0;font:400 28px/1.45 ${zh ? '"Noto Serif SC","Songti SC",serif' : '"Crimson Pro",serif'};color:#3a3935;max-width:640px}
.brand{margin-top:auto;display:flex;align-items:center;gap:16px;font:700 22px/1 "Figtree",sans-serif;letter-spacing:.24em}
.brand svg{width:44px;height:36px;color:#a4461d}
.brand span.cn{padding-left:16px;border-left:2px solid #d4cec3;letter-spacing:.12em;font-family:"PingFang SC","Microsoft YaHei",sans-serif;font-weight:600}
.url{position:absolute;right:72px;bottom:64px;font:500 20px/1 "Figtree",sans-serif;color:#6b6962;letter-spacing:.02em}
.art{position:absolute;right:${slogan ? '0' : '-40px'};top:${slogan ? '116px' : '70px'};width:${slogan ? '590px' : '520px'}}
.art img{width:100%;display:block}
</style></head><body><div class="rule"></div>
<div class="copy"><p class="kicker">${esc(kicker)}</p><h1>${titleHtml}</h1>${sub ? `<p class="sub">${esc(sub)}</p>` : ''}
<div class="brand"><svg viewBox="0 0 100 80"><path fill="currentColor" d="${MARK}"/></svg><span>${NAME.caps}</span><span class="cn">${NAME.zh}</span></div></div>
<div class="art"><img src="/assets/images/mountain-sculpture.webp" alt=""></div>
<div class="url">soloprimus.com</div></body></html>`;
}

function touchIcon() {
  return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;width:180px;height:180px;background:#fdfcf9}
body{display:grid;place-items:center}svg{width:120px;height:96px;color:#a4461d}</style></head>
<body><svg viewBox="0 0 100 80"><path fill="currentColor" d="${MARK}"/></svg></body></html>`;
}

function jobs() {
  const list = [];
  for (const lang of ['en', 'zh']) {
    const h = T[lang].home;
    list.push({ file: `${lang}-default.png`, html: card({ lang, kicker: h.eyebrow, title: h.h1.join(lang === 'zh' ? '' : ' '), sub: '', lines: lang === 'zh' ? h.h1 : undefined }) });
  }
  const dir = join(ROOT, 'content', 'essays');
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.md'))) {
    const [, slug, lang] = f.match(/^(.+)\.(en|zh)\.md$/);
    const { data } = parseFrontMatter(readFileSync(join(dir, f), 'utf8'));
    const t = T[lang];
    list.push({ file: `${lang}-${slug}.png`, html: card({ lang, kicker: t.topics[data.topic], title: data.title, sub: '' }) });
  }
  list.push({ file: '../apple-touch-icon.png', html: touchIcon(), size: '180,180' });
  return list;
}

const pages = new Map();
const server = createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (pages.has(url)) { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(pages.get(url)); }
  const file = normalize(join(ROOT, url));
  if (!file.startsWith(ROOT) || !existsSync(file)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
});

function shoot(url, out, size) {
  return new Promise((resolve, reject) => {
    const args = ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--force-device-scale-factor=1',
      `--user-data-dir=${join(tmpdir(), 'soloprimus-og-chrome')}`, `--window-size=${size}`, '--virtual-time-budget=4000',
      `--screenshot=${out}`, url];
    const p = spawn(CHROME, args, { stdio: 'ignore' });
    p.on('error', reject);
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`Chrome exited with ${code} for ${out}`))));
  });
}

mkdirSync(OUT, { recursive: true });
const requested = process.argv.slice(2);
const allJobs = jobs();
for (const file of requested) {
  if (!allJobs.some((job) => job.file === file)) throw new Error(`Unknown share image: ${file}`);
}
const selectedJobs = requested.length ? allJobs.filter((job) => requested.includes(job.file)) : allJobs;
server.listen(0, '127.0.0.1', async () => {
  const { port } = server.address();
  if (PREVIEW) {
    for (const job of jobs()) {
      const path = `/__og__/${job.file.replace(/[^\w.-]/g, '_')}.html`;
      pages.set(path, job.html);
      console.log(`http://127.0.0.1:${port}${path}`);
    }
    return;
  }
  try {
    for (const job of selectedJobs) {
      const path = `/__og__/${job.file.replace(/[^\w.-]/g, '_')}.html`;
      pages.set(path, job.html);
      const out = join(OUT, job.file);
      await shoot(`http://127.0.0.1:${port}${path}`, out, job.size || '1200,630');
      console.log(`wrote ${normalize(out).replace(ROOT, '').replace(/\\/g, '/')}`);
    }
  } finally {
    server.close();
  }
});
