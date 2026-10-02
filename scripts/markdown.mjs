// A small Markdown renderer for the essays in content/essays.
// Supports: ## headings, paragraphs, blank-line separation, > quotes, - and 1. lists, --- rules,
// **bold**, *italic*, ==highlight==, `code`, links, local essay figures, and tables.

export const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const escapeAttr = (s) => escapeHtml(s).replace(/"/g, '&quot;');

const CJK = /[　-〿㐀-鿿＀-￯]/;

// Join soft-wrapped lines: no space between two CJK characters, one space otherwise.
function joinLines(lines) {
  return lines.reduce((acc, line) => {
    if (!acc) return line;
    return CJK.test(acc.at(-1)) && CJK.test(line[0]) ? acc + line : `${acc} ${line}`;
  }, '');
}

export function inline(text) {
  const codes = [];
  let s = escapeHtml(text).replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(c) - 1}\u0000`);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => {
    const href = url.replace(/"/g, '%22');
    return `<a href="${href}">${label}</a>`;
  });
  s = s.replace(/==([^=]+?)==/g, '<mark class="key">$1</mark>');
  s = s.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, '$1<em>$2</em>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[Number(i)]}</code>`);
}

function slugify(text, used, index) {
  const base = text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  let id = base || `section-${index}`;
  while (used.has(id)) id = `${id}-2`;
  used.add(id);
  return id;
}

export function markdown(source) {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const html = [];
  const headings = [];
  const used = new Set();
  let para = [];
  let quote = [];
  let list = null;

  const flushPara = () => {
    if (para.length) html.push(`<p>${inline(joinLines(para))}</p>`);
    para = [];
  };
  const flushQuote = () => {
    if (quote.length) html.push(`<blockquote><p>${inline(joinLines(quote))}</p></blockquote>`);
    quote = [];
  };
  const flushList = () => {
    if (list) html.push(`<${list.type}>${list.items.map((i) => `<li>${inline(i)}</li>`).join('')}</${list.type}>`);
    list = null;
  };
  const flushAll = () => { flushPara(); flushQuote(); flushList(); };

  const tableCells = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
  const isTableRule = (line) => line && tableCells(line).every((cell) => /^:?-{3,}:?$/.test(cell));

  for (let index = 0; index < lines.length; index++) {
    const raw = lines[index];
    const line = raw.trimEnd();
    let m;
    if (!line.trim()) { flushAll(); continue; }
    if ((m = line.match(/^!\[([^\]]*)\]\((\/assets\/images\/essays\/[a-zA-Z0-9_./-]+\.(?:png|jpe?g|webp))\)$/))) {
      flushAll();
      if (m[2].split('/').includes('..')) throw new Error('Essay images must stay inside assets/images/essays.');
      html.push(`<figure class="essay-figure"><img src="${escapeAttr(m[2])}" alt="${escapeAttr(m[1])}" loading="lazy" decoding="async">${m[1] ? `<figcaption>${inline(m[1])}</figcaption>` : ''}</figure>`);
      continue;
    }
    if (line.trim().startsWith('|') && isTableRule(lines[index + 1])) {
      flushAll();
      const header = tableCells(line);
      const rules = tableCells(lines[++index]);
      if (header.length !== rules.length) throw new Error('Table header and alignment columns must match.');
      const rows = [];
      while (lines[index + 1]?.trim().startsWith('|')) {
        const row = tableCells(lines[++index]);
        if (row.length !== header.length) throw new Error('Table rows must have the same number of columns.');
        rows.push(row);
      }
      const aligned = (column) => rules[column].endsWith(':') ? (rules[column].startsWith(':') ? ' class="align-center"' : ' class="align-right"') : '';
      html.push(`<div class="essay-table-wrap" tabindex="0"><table class="essay-table"><thead><tr>${header.map((cell, column) => `<th scope="col"${aligned(column)}>${inline(cell)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell, column) => column === 0 ? `<th scope="row">${inline(cell)}</th>` : `<td${aligned(column)}>${inline(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }
    if ((m = line.match(/^(#{2,4})\s+(.+)$/))) {
      flushAll();
      const level = m[1].length;
      const text = m[2].trim();
      const id = slugify(text, used, headings.length + 1);
      headings.push({ level, text, id });
      html.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      continue;
    }
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) { flushAll(); html.push('<hr>'); continue; }
    if ((m = line.match(/^>\s?(.*)$/))) { flushPara(); flushList(); quote.push(m[1].trim()); continue; }
    if ((m = line.match(/^\s*[-*]\s+(.+)$/)) || (m = line.match(/^\s*\d+[.)]\s+(.+)$/))) {
      const type = /^\s*\d/.test(line) ? 'ol' : 'ul';
      flushPara(); flushQuote();
      if (!list || list.type !== type) { flushList(); list = { type, items: [] }; }
      list.items.push(m[1].trim());
      continue;
    }
    if (list && /^\s{2,}\S/.test(raw)) { list.items[list.items.length - 1] += ` ${line.trim()}`; continue; }
    flushQuote(); flushList();
    para.push(line.trim());
  }
  flushAll();
  return { html: html.join('\n'), headings };
}

// Reading time: about 400 Chinese characters or 230 English words per minute.
export function readingMinutes(source) {
  const text = source.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  const cjk = (text.match(/[㐀-鿿]/g) || []).length;
  const words = (text.replace(/[㐀-鿿]/g, ' ').match(/[A-Za-z0-9’']+/g) || []).length;
  return Math.max(1, Math.round(cjk / 400 + words / 230));
}

// Front matter: simple `key: value` lines between two --- fences.
export function parseFrontMatter(source) {
  const m = source.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: source };
  const data = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2].trim();
  }
  return { data, body: m[2] };
}
