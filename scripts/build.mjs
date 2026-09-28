#!/usr/bin/env node
// Builds the static site from content/ into the repository root.
// Usage: node scripts/build.mjs   (Node 18+, no dependencies)

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, T } from '../content/site.mjs';
import { escapeAttr as escAttr, escapeHtml as esc, markdown, parseFrontMatter, readingMinutes } from './markdown.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LANGS = ['en', 'zh'];
const MANIFEST = join(ROOT, 'scripts', 'generated-files.json');
const NAME = SITE.penName;

// ---------------------------------------------------------------- paths & helpers
const pre = (lang) => SITE.langs[lang].prefix;
const P = {
  home: (lang) => `${pre(lang)}/`,
  essays: (lang) => `${pre(lang)}/essays/`,
  essay: (lang, slug) => `${pre(lang)}/essays/${slug}/`,
  about: (lang) => `${pre(lang)}/about/`,
  feed: (lang) => `${pre(lang)}/feed.xml`,
};
const abs = (path) => SITE.url + path;
const iso = (d) => d.toISOString().slice(0, 10);
const other = (lang) => (lang === 'en' ? 'zh' : 'en');
const fileHash = (file) => createHash('sha1').update(readFileSync(join(ROOT, file))).digest('hex').slice(0, 10);
const V = { css: fileHash('assets/css/site.css'), fonts: fileHash('assets/css/fonts.css'), js: fileHash('assets/js/site.js') };

const ogImage = (name) => {
  const file = `/assets/og/${name}.png`;
  return existsSync(join(ROOT, file)) ? `${abs(file)}?v=${fileHash(file.slice(1))}` : null;
};

// ---------------------------------------------------------------- icons
const MARK_PATH = 'M50 6 63.8 24C63 28.5 52 32 43 39C34 46 37 51.5 45 59C55 69 51 74 36 74H4Z M66.5 27.5 96 74H81C76 64 66 57.5 56 51C45 44 46 40 53 35.5C59 32 63.5 31 66.5 27.5Z';
const mark = (cls = 'brand-mark') => `<svg class="${cls}" viewBox="0 0 100 80" aria-hidden="true" focusable="false"><path fill="currentColor" d="${MARK_PATH}"/></svg>`;
const ICON = {
  sun: '<svg class="i-sun" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  moon: '<svg class="i-moon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.2 14.6A8.3 8.3 0 0 1 9.4 3.8a8.3 8.3 0 1 0 10.8 10.8Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  rss: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M2 2.5a11.5 11.5 0 0 1 11.5 11.5h-2A9.5 9.5 0 0 0 2 4.5v-2Zm0 4.4A7.1 7.1 0 0 1 9.1 14h-2A5.1 5.1 0 0 0 2 8.9v-2Zm1.6 4.3a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8Z"/></svg>',
};
// Local brand assets: no third-party requests or icon font required.
const SOCIAL_ICONS = JSON.parse(readFileSync(join(ROOT, 'assets/icons/social.json'), 'utf8'));
let iconInstance = 0;
function socialIcon(key) {
  const icon = SOCIAL_ICONS[key];
  if (!icon) throw new Error(`Missing social icon: ${key}`);
  // Some upstream logos use masks. Give each instance unique SVG IDs.
  const prefix = `social-${++iconInstance}-`;
  const body = icon.body.replace(/\bid="([^"]+)"/g, (_, id) => `id="${prefix}${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${prefix}${id})`);
  return `<svg viewBox="0 0 ${icon.width} ${icon.height}" aria-hidden="true" focusable="false">${body}</svg>`;
}

// ---------------------------------------------------------------- content
function loadEssays() {
  const dir = join(ROOT, 'content', 'essays');
  const essays = { en: [], zh: [] };
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.md')).sort()) {
    const m = file.match(/^([a-z0-9-]+)\.(en|zh)\.md$/);
    if (!m) throw new Error(`Essay files must be named <slug>.en.md or <slug>.zh.md: ${file}`);
    const [, slug, lang] = m;
    const { data, body } = parseFrontMatter(readFileSync(join(dir, file), 'utf8'));
    for (const key of ['title', 'summary', 'topic', 'date']) if (!data[key]) throw new Error(`${file}: missing "${key}" in front matter`);
    if (!SITE.topics.includes(data.topic)) throw new Error(`${file}: topic must be one of ${SITE.topics.join(', ')}`);
    const date = new Date(`${data.date}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) throw new Error(`${file}: date must look like 2026-09-28`);
    const { html, headings } = markdown(body);
    essays[lang].push({ ...data, slug, lang, date, html, headings, minutes: readingMinutes(body), featured: Number(data.featured || 99) });
  }
  for (const lang of LANGS) essays[lang].sort((a, b) => b.date - a.date || a.slug.localeCompare(b.slug));
  for (const e of essays.en) e.alt = essays.zh.find((z) => z.slug === e.slug) || null;
  for (const z of essays.zh) z.alt = essays.en.find((e) => e.slug === z.slug) || null;
  return essays;
}

// ---------------------------------------------------------------- structured data
const PERSON = {
  '@type': 'Person',
  '@id': `${SITE.url}/#person`,
  name: NAME.en,
  alternateName: [NAME.caps, NAME.zh],
  url: abs(P.about('en')),
  jobTitle: 'Professor',
  description: 'Professor with a PhD in economics and a seasoned investor, writing about investing, AI, and self-improvement.',
  knowsAbout: ['Economics', 'Investing', 'Artificial intelligence', 'Self-improvement'],
  sameAs: [SITE.links.x, SITE.links.substack],
};
const WEBSITE = { '@type': 'WebSite', '@id': `${SITE.url}/#website`, url: abs('/'), name: NAME.en, alternateName: `${NAME.zh} ${NAME.caps}`, inLanguage: ['en', 'zh-CN'], publisher: { '@id': PERSON['@id'] } };

// ---------------------------------------------------------------- layout
function layout({ lang, path, altPath, title, description, image, type = 'website', jsonld = [], current = '', main, noindex = false }) {
  const t = T[lang];
  const L = SITE.langs[lang];
  const o = other(lang);
  const canonical = abs(path);
  const alternates = [[L.hreflang, canonical]];
  if (altPath) alternates.push([SITE.langs[o].hreflang, abs(altPath)]);
  const xDefault = lang === 'en' ? canonical : altPath ? abs(altPath) : null;
  const img = image || ogImage(`${lang}-default`);
  const langHref = altPath || P.home(o);
  const nav = [
    ['essays', P.essays(lang), t.nav.essays],
    ['topics', `${P.home(lang)}#topics`, t.nav.topics],
    ['about', P.about(lang), t.nav.about],
    ['subscribe', '#follow', t.nav.subscribe],
  ];
  const graph = jsonld.length ? `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': jsonld })}</script>\n` : '';
  const preloads = ['figtree/figtree-latin', ...(lang === 'en' ? ['crimson-pro/crimson-pro-latin'] : [])]
    .map((f) => `<link rel="preload" href="/assets/fonts/${f}.woff2" as="font" type="font/woff2" crossorigin>`).join('\n');

  return `<!doctype html>
<html lang="${L.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${escAttr(description)}">
${noindex ? '<meta name="robots" content="noindex">\n' : `<link rel="canonical" href="${canonical}">\n${alternates.map(([hl, href]) => `<link rel="alternate" hreflang="${hl}" href="${href}">`).join('\n')}\n${xDefault ? `<link rel="alternate" hreflang="x-default" href="${xDefault}">\n` : ''}`}<link rel="alternate" type="application/rss+xml" title="${escAttr(lang === 'en' ? NAME.en : `${NAME.zh} ${NAME.caps}`)}" href="${P.feed(lang)}">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#fdfcf9" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#151615" media="(prefers-color-scheme: dark)">
<meta property="og:site_name" content="${escAttr(lang === 'en' ? NAME.en : `${NAME.zh} ${NAME.caps}`)}">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${escAttr(title)}">
<meta property="og:description" content="${escAttr(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="${L.ogLocale}">
${img ? `<meta property="og:image" content="${img}">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n` : ''}<meta name="twitter:card" content="${img ? 'summary_large_image' : 'summary'}">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
${preloads}
<link rel="stylesheet" href="/assets/css/fonts.css?v=${V.fonts}">
<link rel="stylesheet" href="/assets/css/site.css?v=${V.css}">
<script>try{var s=localStorage.getItem('soloprimus-theme');document.documentElement.dataset.theme=s==='dark'||s==='light'?s:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch(e){}</script>
<script src="/assets/js/site.js?v=${V.js}" defer></script>
${graph}</head>
<body>
<a class="skip-link" href="#main">${esc(t.skip)}</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="${P.home(lang)}" aria-label="${escAttr(t.homeLabel)}">${mark()}<span class="brand-name">${NAME.caps}</span>${lang === 'zh' ? `<span class="brand-cn">${NAME.zh}</span>` : ''}</a>
    <nav class="site-nav" id="site-nav" aria-label="${escAttr(t.navLabel)}">
${nav.map(([key, href, label]) => `      <a href="${href}"${key === current ? ' aria-current="page"' : ''}>${esc(label)}</a>`).join('\n')}
      <a class="lang-link" href="${langHref}" hreflang="${SITE.langs[o].hreflang}" lang="${SITE.langs[o].htmlLang}" title="${escAttr(t.otherLang.title)}">${esc(t.otherLang.label)}</a>
    </nav>
    <div class="header-tools">
      <button class="icon-btn theme-toggle" type="button" aria-label="${escAttr(t.theme.toDark)}" data-label-dark="${escAttr(t.theme.toDark)}" data-label-light="${escAttr(t.theme.toLight)}">${ICON.sun}${ICON.moon}</button>
      <button class="icon-btn nav-toggle" type="button" aria-controls="site-nav" aria-expanded="false" aria-label="${escAttr(t.menu.open)}" data-label-open="${escAttr(t.menu.open)}" data-label-close="${escAttr(t.menu.close)}"><span></span><span></span></button>
    </div>
  </div>
</header>
<main id="main">
${main}
</main>
${followBand(lang)}
${footer(lang, langHref)}
</body>
</html>
`;
}

function channelLink(lang, key, label) {
  const href = SITE.links[key];
  const name = href ? label : `${label} · ${T[lang].follow.pending}`;
  const attrs = `class="social-icon social-icon--${key}${href ? '' : ' social-placeholder'}" data-platform="${key}" aria-label="${escAttr(name)}" title="${escAttr(name)}"`;
  const content = `${socialIcon(key)}<span class="social-tooltip" aria-hidden="true">${esc(name)}</span>`;
  if (href) {
    if (!/^https:\/\//.test(href)) throw new Error(`SITE.links.${key} must be an https URL or null`);
    return `<a ${attrs} href="${escAttr(href)}" rel="noopener">${content}</a>`;
  }
  return `<span ${attrs} role="img" aria-disabled="true">${content}</span>`;
}

function followBand(lang) {
  const f = T[lang].follow;
  return `<section class="follow" id="follow" aria-labelledby="follow-title">
  <div class="wrap follow-inner">
    <div>
      <p class="eyebrow">${esc(f.eyebrow)}</p>
      <h2 id="follow-title">${esc(f.title)}</h2>
      <p>${esc(f.text)}</p>
    </div>
    <div class="follow-actions">
      ${lang === 'zh'
        ? channelLink(lang, 'wechat', f.wechat) + '\n      ' + channelLink(lang, 'douyin', f.douyin)
        : channelLink(lang, 'substack', f.substack) + '\n      ' + channelLink(lang, 'x', f.x)}
      <a class="btn btn-quiet" href="${P.feed(lang)}">${ICON.rss}<span>${esc(f.rss)}</span></a>
    </div>
  </div>
</section>`;
}

function footer(lang, langHref) {
  const t = T[lang];
  const o = other(lang);
  return `<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-brand">
      <a class="brand" href="${P.home(lang)}">${mark()}<span class="brand-name">${NAME.caps}</span>${lang === 'zh' ? `<span class="brand-cn">${NAME.zh}</span>` : ''}</a>
      <p>${esc(t.footer.tagline)}</p>
    </div>
    <nav class="footer-links" aria-label="${escAttr(t.navLabel)}">
      <a href="${P.essays(lang)}">${esc(t.nav.essays)}</a>
      <a href="${P.about(lang)}">${esc(t.nav.about)}</a>
      <a href="${P.feed(lang)}">${esc(t.footer.rss)}</a>
      <a href="${langHref}" hreflang="${SITE.langs[o].hreflang}" lang="${SITE.langs[o].htmlLang}">${esc(t.otherLang.label)}</a>
    </nav>
    <p class="footer-note">${esc(t.footer.disclaimer)}</p>
  </div>
  <nav class="wrap footer-social" aria-labelledby="social-title">
    <h2 id="social-title">${esc(t.follow.more)}</h2>
    <ul class="social-list">
${SITE.socialPlatforms[lang].map(([key, label]) => `      <li>${channelLink(lang, key, lang === 'zh' ? `关注${label}` : label)}</li>`).join('\n')}
    </ul>
  </nav>
  <div class="wrap footer-bottom"><span>© ${new Date().getUTCFullYear()} ${NAME.en}${lang === 'zh' ? ` · ${NAME.zh}` : ''}</span></div>
</footer>`;
}

// ---------------------------------------------------------------- shared blocks
function essayRow(e, lang, heading = 'h3') {
  const t = T[lang];
  const cross = e.lang !== lang;
  const title = cross ? e.title_en || e.title : e.title;
  const summary = cross ? e.summary_en || e.summary : e.summary;
  const hl = cross ? ` hreflang="${SITE.langs[e.lang].hreflang}"` : '';
  return `<li class="essay-row" data-topic="${e.topic}">
  <div class="essay-meta"><a class="topic-tag" href="${P.essays(lang)}#${e.topic}">${esc(t.topics[e.topic])}</a><span><time datetime="${iso(e.date)}">${esc(t.shortDate(e.date))}</time> · ${esc(t.minRead(e.minutes))}</span></div>
  <div class="essay-main">
    <${heading}><a href="${P.essay(e.lang, e.slug)}"${hl}>${esc(title)}</a>${cross ? ` <span class="badge" lang="zh-CN">${esc(t.essays.zhBadge)}</span>` : ''}</${heading}>
    <p>${esc(summary)}</p>${cross ? `\n    <p class="essay-orig" lang="zh-CN">${esc(e.title)}</p>` : ''}
  </div>
</li>`;
}

function thesisDiagram(d) {
  return `<figure class="diagram diagram-thesis">
  <p class="diagram-label">${esc(d.label)}</p>
  <div class="diagram-body"><ol class="thesis-rows">${d.rows.map(([k, v]) => `<li><b>${esc(k)}</b><span>${esc(v)}</span></li>`).join('')}</ol></div>
  <figcaption class="diagram-caption">${esc(d.caption)}</figcaption>
</figure>`;
}

function workflowDiagram(d) {
  const mins = [5, 2, 8, 10];
  const hand = 30;
  const total = mins.reduce((a, b) => a + b, 0);
  const pct = (m) => `${((m / hand) * 100).toFixed(2)}%`;
  const label = `${d.withAi}: ${d.steps.map((s, i) => `${s} ${mins[i]}`).join(', ')} (${total} ${d.unit}); ${d.byHand}: ${hand} ${d.unit}`;
  return `<figure class="diagram diagram-workflow">
  <p class="diagram-label">${esc(d.label)}</p>
  <div class="diagram-body">
    <div class="bars" role="img" aria-label="${escAttr(label)}">
      <div class="bar-row"><span class="bar-name">${esc(d.withAi)}</span><span class="bar-track">${mins.map((m, i) => `<i class="seg seg-${i + 1}" style="--w:${pct(m)}"></i>`).join('')}</span><span class="bar-total">${total} ${esc(d.unit)}</span></div>
      <div class="bar-row"><span class="bar-name">${esc(d.byHand)}</span><span class="bar-track"><i class="seg seg-hand" style="--w:100%"></i></span><span class="bar-total">${hand} ${esc(d.unit)}</span></div>
    </div>
    <ul class="legend" aria-hidden="true">${d.steps.map((s, i) => `<li><i class="seg-${i + 1}"></i>${esc(s)} ${mins[i]}</li>`).join('')}</ul>
  </div>
  <figcaption class="diagram-caption">${esc(d.caption)}</figcaption>
</figure>`;
}

function loopDiagram(d) {
  const [a, b, c, e] = d.steps.map(esc);
  return `<figure class="diagram diagram-loop">
  <p class="diagram-label">${esc(d.label)}</p>
  <div class="diagram-body">
  <svg viewBox="0 0 280 180" role="img" aria-label="${escAttr([...d.steps, d.steps[0]].join(' → '))}">
    <defs><marker id="loop-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="loop-head" d="M0 0 10 5 0 10z"/></marker></defs>
    <g class="loop-arcs" fill="none">
      <path d="M151.64 35.22A56 56 0 0 1 194.78 78.36" marker-end="url(#loop-arrow)"/>
      <path d="M194.78 101.64A56 56 0 0 1 151.64 144.78" marker-end="url(#loop-arrow)"/>
      <path d="M128.36 144.78A56 56 0 0 1 85.22 101.64" marker-end="url(#loop-arrow)"/>
      <path d="M85.22 78.36A56 56 0 0 1 128.36 35.22" marker-end="url(#loop-arrow)"/>
    </g>
    <g class="loop-nodes"><circle cx="140" cy="34" r="5"/><circle cx="196" cy="90" r="5"/><circle cx="140" cy="146" r="5"/><circle cx="84" cy="90" r="5"/></g>
    <g class="loop-labels">
      <text x="140" y="19" text-anchor="middle">${a}</text>
      <text x="208" y="94.5">${b}</text>
      <text x="140" y="171" text-anchor="middle">${c}</text>
      <text x="72" y="94.5" text-anchor="end">${e}</text>
    </g>
    <text class="loop-center" x="140" y="95" text-anchor="middle">${esc(d.center)}</text>
  </svg>
  </div>
  <figcaption class="diagram-caption">${esc(d.caption)}</figcaption>
</figure>`;
}

// ---------------------------------------------------------------- pages
function homePage(lang, essays) {
  const t = T[lang];
  const h = t.home;
  const own = [...essays[lang]].sort((a, b) => a.featured - b.featured || b.date - a.date);
  const cross = lang === 'en' ? essays.zh.filter((z) => !z.alt).sort((a, b) => a.featured - b.featured || b.date - a.date) : [];
  const diagrams = { investing: thesisDiagram(h.thesis), ai: workflowDiagram(h.workflow), growth: loopDiagram(h.loop) };
  const main = `<section class="wrap hero">
  <div class="hero-copy">
    <p class="eyebrow">${esc(h.eyebrow)}</p>
    <h1>${h.h1.map((line) => `<span>${esc(line)}</span>`).join(' ')}</h1>
    <ul class="hero-pillars">
${h.pillars.map(([k, v]) => `      <li><b>${esc(k)}</b><span>${esc(v)}</span></li>`).join('\n')}
    </ul>
    <div class="hero-actions">
      <a class="btn" href="${P.essays(lang)}"><span>${esc(h.primary)}</span><span aria-hidden="true">→</span></a>
      ${lang === 'zh'
        ? channelLink(lang, 'douyin', t.follow.douyin) + '\n      ' + channelLink(lang, 'wechat', t.follow.wechat)
        : channelLink(lang, 'substack', h.secondary) + '\n      ' + channelLink(lang, 'x', t.follow.x)}
    </div>
  </div>
  <div class="hero-art">
    <div class="hero-art-inner"><img src="/assets/images/mountain-sculpture.webp" width="1536" height="1024" alt="${escAttr(h.heroAlt)}" fetchpriority="high" decoding="async"></div>
  </div>
  <dl class="facts">
${h.facts.map(([from, to]) => `    <div><dt>${esc(from)}<span class="facts-arrow" aria-hidden="true">→</span><span class="sr-only">${esc(h.factsTo)}</span></dt><dd>${esc(to)}</dd></div>`).join('\n')}
  </dl>
</section>

<section class="section band levers" id="topics" aria-labelledby="levers-title">
  <div class="wrap">
    <header class="section-head">
      <p class="eyebrow">${esc(h.leverEyebrow)}</p>
      <h2 id="levers-title">${esc(h.leverTitle)}</h2>
      <p class="section-intro">${esc(h.leverIntro)}</p>
    </header>
    <div class="lever-grid">
${SITE.topics.map((topic) => {
    const c = h.cards[topic];
    return `      <article class="lever">
        <p class="lever-kicker">${esc(t.topics[topic])}</p>
        <h3>${esc(c.title)}</h3>
        <p class="lever-text">${esc(c.text)}</p>
        ${diagrams[topic]}
        <a class="text-link" href="${P.essays(lang)}#${topic}">${esc(c.link)} <span aria-hidden="true">→</span></a>
      </article>`;
  }).join('\n')}
    </div>
  </div>
</section>

<section class="section start" aria-labelledby="start-title">
  <div class="wrap">
    <header class="section-head">
      <p class="eyebrow">${esc(h.startEyebrow)}</p>
      <h2 id="start-title">${esc(h.startTitle)}</h2>
    </header>
    <ol class="essay-list">
${own.map((e) => essayRow(e, lang)).join('\n')}
    </ol>
${cross.length ? `    <div class="also">
      <h3 class="list-subhead">${esc(h.alsoTitle)}</h3>
      <p class="list-note">${esc(h.alsoNote)}</p>
      <ol class="essay-list">
${cross.map((e) => essayRow(e, lang, 'h4')).join('\n')}
      </ol>
    </div>
` : ''}    <p class="section-more"><a class="text-link" href="${P.essays(lang)}">${esc(h.allEssays)} <span aria-hidden="true">→</span></a></p>
  </div>
</section>

<section class="section band intro" aria-labelledby="intro-title">
  <div class="wrap intro-grid">
    <div class="intro-copy">
      <h2 id="intro-title">${esc(h.introTitle)}</h2>
${h.intro.map((p) => `      <p>${esc(p)}</p>`).join('\n')}
      <a class="text-link" href="${P.about(lang)}">${esc(h.introMore)} <span aria-hidden="true">→</span></a>
    </div>
    <div class="intro-side">
      <h3>${esc(h.principlesTitle)}</h3>
      <ul class="principles">
${h.principles.map((p) => `        <li>${esc(p)}</li>`).join('\n')}
      </ul>
    </div>
  </div>
</section>`;
  return layout({
    lang, path: P.home(lang), altPath: P.home(other(lang)), title: h.title, description: h.description, current: 'home',
    jsonld: [WEBSITE, PERSON], main,
  });
}

function essaysPage(lang, essays) {
  const t = T[lang];
  const E = t.essays;
  const own = essays[lang];
  const cross = lang === 'en' ? essays.zh.filter((z) => !z.alt) : [];
  const all = [...own, ...cross];
  const count = (topic) => all.filter((e) => topic === 'all' || e.topic === topic).length;
  const main = `<section class="wrap page-head">
  <p class="eyebrow">${esc(E.eyebrow)}</p>
  <h1>${esc(E.h1)}</h1>
  <p class="lead">${esc(E.lead)}</p>
</section>
<section class="wrap essays-index">
  <div class="filters" role="group" aria-label="${escAttr(E.filterLabel)}">
    <button type="button" data-filter="all" aria-pressed="true">${esc(E.all)} <span>${count('all')}</span></button>
${SITE.topics.map((topic) => `    <button type="button" data-filter="${topic}" aria-pressed="false">${esc(t.topics[topic])} <span>${count(topic)}</span></button>`).join('\n')}
  </div>
  <div data-filter-group>
    <h2 class="sr-only">${esc(E.h1)}</h2>
    <ol class="essay-list">
${own.map((e) => essayRow(e, lang)).join('\n')}
    </ol>
  </div>
${cross.length ? `  <div class="also" data-filter-group>
    <h2 class="list-subhead">${esc(E.inChinese)}</h2>
    <p class="list-note">${esc(E.inChineseNote)}</p>
    <ol class="essay-list">
${cross.map((e) => essayRow(e, lang)).join('\n')}
    </ol>
  </div>
` : ''}  <p class="filter-empty" hidden>${esc(E.empty)}</p>
</section>`;
  return layout({
    lang, path: P.essays(lang), altPath: P.essays(other(lang)), title: E.title, description: E.description, current: 'essays',
    jsonld: [{ '@type': 'CollectionPage', name: E.h1, url: abs(P.essays(lang)), inLanguage: SITE.langs[lang].htmlLang, isPartOf: { '@id': WEBSITE['@id'] } }], main,
  });
}

function essayPage(e, essays) {
  const lang = e.lang;
  const t = T[lang];
  const A = t.article;
  const url = abs(P.essay(lang, e.slug));
  const altPath = e.alt ? P.essay(e.alt.lang, e.slug) : null;
  const toc = e.headings.filter((h) => h.level === 2);
  const same = essays[lang].filter((x) => x.slug !== e.slug);
  const next = [...same.filter((x) => x.topic === e.topic), ...same.filter((x) => x.topic !== e.topic)].slice(0, 3);
  const image = ogImage(`${lang}-${e.slug}`);
  const main = `<div class="wrap article-layout">
  <article class="article">
    <header class="article-head">
      <a class="topic-tag" href="${P.essays(lang)}#${e.topic}">${esc(t.topics[e.topic])}</a>
      <h1>${esc(e.title)}</h1>
      <p class="article-dek">${esc(e.summary)}</p>
      <p class="byline"><span>${esc(A.by)} <a href="${P.about(lang)}">${lang === 'zh' ? `${NAME.zh}` : NAME.en}</a></span><span aria-hidden="true">·</span><time datetime="${iso(e.date)}">${esc(t.date(e.date))}</time><span aria-hidden="true">·</span><span>${esc(t.minRead(e.minutes))}</span>${altPath ? `<span aria-hidden="true">·</span><a href="${altPath}" hreflang="${SITE.langs[other(lang)].hreflang}">${esc(A.alternate)}</a>` : ''}</p>
    </header>
${toc.length >= 3 ? `    <nav class="toc" aria-labelledby="toc-title">
      <p id="toc-title">${esc(A.onThisPage)}</p>
      <ol>
${toc.map((h) => `        <li><a href="#${h.id}">${esc(h.text)}</a></li>`).join('\n')}
      </ol>
    </nav>
` : ''}    <div class="prose">
${e.html}
    </div>
${e.note ? `    <p class="article-note">${esc(e.note)}</p>\n` : ''}    <aside class="author-box" aria-labelledby="author-title">
      <div class="avatar">${mark('avatar-mark')}</div>
      <div>
        <h2 id="author-title">${esc(A.authorTitle)}</h2>
        <p>${esc(A.authorBio)}</p>
        <div class="author-actions"><a href="${P.about(lang)}">${esc(A.authorMore)}</a>${channelLink(lang, 'substack', T[lang].follow.substack)}<a href="${P.feed(lang)}">RSS</a></div>
      </div>
    </aside>
  </article>
  <aside class="article-side" aria-label="${escAttr(A.topicsTitle)}">
    <div class="side-sticky">
      <p class="side-label">${esc(A.topicsTitle)}</p>
      <ul class="side-list">
${SITE.topics.map((topic) => `        <li><a href="${P.essays(lang)}#${topic}"${topic === e.topic ? ' aria-current="true"' : ''}>${esc(t.topics[topic])}</a></li>`).join('\n')}
      </ul>
      <p class="side-more"><a href="${P.essays(lang)}">${esc(A.allEssays)} →</a></p>
    </div>
  </aside>
</div>
${next.length ? `<section class="section read-next" aria-labelledby="next-title">
  <div class="wrap">
    <h2 id="next-title" class="read-next-title">${esc(A.readNext)}</h2>
    <ol class="essay-list">
${next.map((x) => essayRow(x, lang)).join('\n')}
    </ol>
  </div>
</section>` : ''}`;
  const article = {
    '@type': 'Article',
    headline: e.title,
    description: e.summary,
    datePublished: iso(e.date),
    dateModified: iso(e.date),
    inLanguage: SITE.langs[lang].htmlLang,
    author: { '@id': PERSON['@id'] },
    publisher: { '@id': PERSON['@id'] },
    mainEntityOfPage: url,
    url,
    ...(image || ogImage(`${lang}-default`) ? { image: image || ogImage(`${lang}-default`) } : {}),
  };
  return layout({
    lang, path: P.essay(lang, e.slug), altPath, title: `${e.title} · ${lang === 'zh' ? NAME.zh : NAME.en}`, description: e.summary,
    image, type: 'article', jsonld: [article, PERSON], current: 'essays', main,
  });
}

function aboutPage(lang) {
  const t = T[lang];
  const A = t.about;
  const h = t.home;
  const main = `<section class="wrap page-head">
  <p class="eyebrow">${esc(A.eyebrow)}</p>
  <h1>${esc(A.h1)}</h1>
  <p class="lead">${esc(A.lead)}</p>
</section>
<div class="wrap">
  <div class="about-body prose">
    <div class="about-story">
${A.story.map((p) => (Array.isArray(p)
    ? `      <p><strong>${esc(p[0])}</strong> ${esc(p[1])}</p>`
    : `      <p>${p.split('\n').map(esc).join('<br>')}</p>`)).join('\n')}
      <p class="about-motto">${esc(A.motto)}</p>
      <p class="about-motto-note">${esc(A.mottoNote)}</p>
    </div>
${A.sections.map((s) => `    <h2>${esc(s.h)}</h2>\n${s.p.map((p) => `    <p>${esc(p)}</p>`).join('\n')}`).join('\n')}
    <h2>${esc(A.howTitle)}</h2>
    <ul class="principles">
${h.principles.map((p) => `      <li>${esc(p)}</li>`).join('\n')}
    </ul>
    <p>${esc(A.howNote)}</p>
    <h2>${esc(A.disclosureTitle)}</h2>
${A.disclosures.map((p) => `    <p>${esc(p)}</p>`).join('\n')}
    <h2>${esc(A.elsewhereTitle)}</h2>
    <ul class="elsewhere">
      <li>${channelLink(lang, 'substack', T[lang].follow.substack)}</li>
      <li>${channelLink(lang, 'x', T[lang].follow.x)}</li>
      <li><a href="${P.feed(lang)}">${ICON.rss}<span>RSS</span></a></li>
    </ul>
  </div>
</div>`;
  return layout({
    lang, path: P.about(lang), altPath: P.about(other(lang)), title: A.title, description: A.description, current: 'about',
    jsonld: [{ '@type': 'ProfilePage', url: abs(P.about(lang)), inLanguage: SITE.langs[lang].htmlLang, mainEntity: { '@id': PERSON['@id'] } }, PERSON], main,
  });
}

function notFoundPage() {
  const en = T.en.notFound;
  const zh = T.zh.notFound;
  const main = `<section class="wrap page-head not-found">
  <p class="eyebrow">404</p>
  <h1>${esc(en.h1)}</h1>
  <p class="lead">${esc(en.text)}</p>
  <p class="hero-actions"><a class="btn" href="/">${esc(en.home)}</a><a class="text-link" href="/essays/">${esc(en.essays)} →</a></p>
  <div lang="zh-CN" class="not-found-zh">
    <h2>${esc(zh.h1)}</h2>
    <p>${esc(zh.text)}</p>
    <p class="hero-actions"><a class="btn btn-quiet" href="/zh/">${esc(zh.home)}</a><a class="text-link" href="/zh/essays/">${esc(zh.essays)} →</a></p>
  </div>
</section>`;
  return layout({ lang: 'en', path: '/404.html', title: en.title, description: en.text, main, noindex: true });
}

// ---------------------------------------------------------------- feeds & sitemap
function feed(lang, essays) {
  const t = T[lang];
  const list = essays[lang];
  const title = lang === 'en' ? NAME.en : `${NAME.zh} ${NAME.caps}`;
  const updated = list.length ? list[0].date : new Date(0);
  const cdata = (s) => `<![CDATA[${s.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
<title>${esc(title)}</title>
<link>${abs(P.home(lang))}</link>
<description>${esc(t.home.description)}</description>
<language>${SITE.langs[lang].htmlLang}</language>
<atom:link href="${abs(P.feed(lang))}" rel="self" type="application/rss+xml"/>
<lastBuildDate>${updated.toUTCString()}</lastBuildDate>
${list.map((e) => `<item>
<title>${esc(e.title)}</title>
<link>${abs(P.essay(lang, e.slug))}</link>
<guid isPermaLink="true">${abs(P.essay(lang, e.slug))}</guid>
<pubDate>${e.date.toUTCString()}</pubDate>
<description>${esc(e.summary)}</description>
<content:encoded>${cdata(e.html)}</content:encoded>
</item>`).join('\n')}
</channel>
</rss>
`;
}

function sitemap(essays) {
  const entries = [];
  const pair = (enPath, zhPath, lastmod) => {
    for (const [lang, path, alt] of [['en', enPath, zhPath], ['zh', zhPath, enPath]]) {
      if (!path) continue;
      entries.push({ loc: abs(path), lastmod, alts: alt ? [['en', abs(enPath)], ['zh-CN', abs(zhPath)], ['x-default', abs(enPath)]] : [] });
    }
  };
  const latest = iso([...essays.en, ...essays.zh].reduce((m, e) => (e.date > m ? e.date : m), new Date(0)));
  pair(P.home('en'), P.home('zh'), latest);
  pair(P.essays('en'), P.essays('zh'), latest);
  pair(P.about('en'), P.about('zh'), latest);
  const slugs = new Set([...essays.en, ...essays.zh].map((e) => e.slug));
  for (const slug of [...slugs].sort()) {
    const en = essays.en.find((e) => e.slug === slug);
    const zh = essays.zh.find((e) => e.slug === slug);
    const d = iso([en, zh].filter(Boolean).reduce((m, e) => (e.date > m ? e.date : m), new Date(0)));
    if (en && zh) pair(P.essay('en', slug), P.essay('zh', slug), d);
    else entries.push({ loc: abs(P.essay(en ? 'en' : 'zh', slug)), lastmod: d, alts: [] });
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map((u) => `<url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod>${u.alts.map(([hl, href]) => `<xhtml:link rel="alternate" hreflang="${hl}" href="${href}"/>`).join('')}</url>`).join('\n')}
</urlset>
`;
}

// ---------------------------------------------------------------- write
function build() {
  const essays = loadEssays();
  const out = new Map();
  const put = (path, html) => out.set(path.replace(/^\//, ''), html);
  for (const lang of LANGS) {
    put(`${pre(lang)}/index.html`, homePage(lang, essays));
    put(`${pre(lang)}/essays/index.html`, essaysPage(lang, essays));
    put(`${pre(lang)}/about/index.html`, aboutPage(lang));
    put(`${pre(lang)}/feed.xml`, feed(lang, essays));
    for (const e of essays[lang]) put(`${pre(lang)}/essays/${e.slug}/index.html`, essayPage(e, essays));
  }
  put('/404.html', notFoundPage());
  put('/sitemap.xml', sitemap(essays));

  const previous = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : [];
  for (const rel of previous) {
    if (!out.has(rel) && existsSync(join(ROOT, rel))) {
      rmSync(join(ROOT, rel));
      console.log(`removed ${rel}`);
    }
  }
  for (const [rel, content] of out) {
    const file = join(ROOT, rel);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content);
  }
  writeFileSync(MANIFEST, `${JSON.stringify([...out.keys()].sort(), null, 2)}\n`);
  console.log(`built ${out.size} files · ${essays.en.length} English essays · ${essays.zh.length} Chinese essays`);
}

build();
