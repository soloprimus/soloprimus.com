// Live reading leases and private, browser-local passage underlines.
(() => {
  const article = document.querySelector('[data-reading-article]');
  if (!article) return;
  const zh = article.dataset.readingLang === 'zh';
  const prose = article.querySelector('[data-reading-prose]');
  const tools = article.querySelector('.reading-tools');
  const count = article.querySelector('[data-reading-count]');
  const presence = article.querySelector('.reading-presence');
  const toolbar = article.querySelector('.reading-toolbar');
  const add = toolbar.querySelector('[data-underline-add]');
  const remove = toolbar.querySelector('[data-underline-remove]');
  const clear = article.querySelector('.reading-clear');
  const status = article.querySelector('.reading-status');
  const storageKey = `soloprimus-underlines-v1:${article.dataset.readingLang}:${article.dataset.readingArticle}`;
  const originalText = prose.textContent;
  let notes = [], chosen = null, anchorMark = null;
  tools.hidden = false;

  // Stable across tabs, anonymous, unrelated to IP or the visitor totals.
  let reader = crypto.randomUUID();
  try {
    const key = 'soloprimus-reader-v1';
    const saved = localStorage.getItem(key);
    if (/^[a-f0-9-]{36}$/.test(saved || '')) reader = saved;
    else localStorage.setItem(key, reader);
  } catch { /* In private storage modes the current page still works. */ }

  let timer, controller, stopped = false;
  const unavailable = () => {
    presence.dataset.state = 'unavailable';
    count.textContent = zh ? '实时人数暂不可用' : 'Live readers unavailable';
  };
  async function heartbeat() {
    clearTimeout(timer);
    if (stopped || document.hidden) return;
    controller = new AbortController();
    const timeout = setTimeout(() => controller?.abort(), 8000);
    try {
      const response = await fetch('/api/reading', {
        method: 'POST', credentials: 'same-origin', cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article: article.dataset.readingArticle, reader }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('Reading service unavailable');
      const data = await response.json();
      if (!Number.isSafeInteger(data.active) || data.active < 1) throw new Error('Invalid reader count');
      presence.dataset.state = 'live';
      const number = new Intl.NumberFormat(zh ? 'zh-CN' : 'en').format(data.active);
      count.textContent = zh ? `${number} 人正在阅读` : `${number} ${data.active === 1 ? 'person' : 'people'} reading now`;
    } catch {
      if (!document.hidden && !stopped) unavailable();
    } finally {
      clearTimeout(timeout);
      controller = null;
      if (!stopped && !document.hidden) timer = setTimeout(heartbeat, 20000);
    }
  }
  document.addEventListener('visibilitychange', () => {
    clearTimeout(timer);
    if (document.hidden) controller?.abort();
    else if (!controller) heartbeat();
  });
  window.addEventListener('pagehide', () => { stopped = true; clearTimeout(timer); controller?.abort(); });
  window.addEventListener('pageshow', event => { if (event.persisted) { stopped = false; heartbeat(); } });
  heartbeat();

  function announce(message, error = false) {
    status.classList.toggle('sr-only', !error);
    status.textContent = message;
  }
  function save() {
    try {
      if (notes.length) localStorage.setItem(storageKey, JSON.stringify(notes));
      else localStorage.removeItem(storageKey);
      announce(zh ? '划线已保存在此浏览器' : 'Underlines saved in this browser.');
    } catch {
      announce(zh ? '浏览器未允许保存，划线仅在本次阅读中保留' : 'Storage is unavailable. Underlines will last for this visit only.', true);
    }
  }

  function load() {
    notes = [];
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (!Array.isArray(stored)) return;
      for (const item of stored.slice(0, 500)) {
        if (!Number.isInteger(item.start) || !Number.isInteger(item.end) || typeof item.quote !== 'string' ||
          item.start < 0 || item.end <= item.start || !item.quote.trim()) continue;
        let start = item.start, end = item.end;
        if (originalText.slice(start, end) !== item.quote) {
          // Reattach after an article edit only when the passage is unambiguous.
          start = originalText.indexOf(item.quote);
          if (start < 0 || originalText.indexOf(item.quote, start + 1) !== -1) continue;
          end = start + item.quote.length;
        }
        notes.push({ start, end, quote: item.quote });
      }
      merge();
    } catch { /* Malformed or blocked local storage does not affect reading. */ }
  }

  function merge() {
    const merged = [];
    for (const note of notes.sort((a, b) => a.start - b.start)) {
      const previous = merged.at(-1);
      if (previous && previous.end >= note.start) previous.end = Math.max(previous.end, note.end);
      else merged.push({ start: note.start, end: note.end });
    }
    notes = merged.map(note => ({ ...note, quote: originalText.slice(note.start, note.end) }));
  }

  function paint() {
    for (const mark of prose.querySelectorAll('mark.reader-underline')) mark.replaceWith(...mark.childNodes);
    prose.normalize();
    const walker = document.createTreeWalker(prose, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node, offset = 0;
    while ((node = walker.nextNode())) {
      nodes.push({ node, start: offset, end: offset + node.length });
      offset += node.length;
    }
    for (const entry of nodes) {
      const hits = notes.filter(note => note.start < entry.end && note.end > entry.start);
      if (!hits.length) continue;
      const fragment = document.createDocumentFragment();
      let cursor = 0;
      for (const note of hits) {
        const start = Math.max(note.start - entry.start, 0);
        const end = Math.min(note.end - entry.start, entry.node.length);
        fragment.append(entry.node.data.slice(cursor, start));
        const mark = document.createElement('mark');
        mark.className = 'reader-underline';
        mark.dataset.start = note.start;
        mark.dataset.end = note.end;
        mark.textContent = entry.node.data.slice(start, end);
        fragment.append(mark);
        cursor = end;
      }
      fragment.append(entry.node.data.slice(cursor));
      entry.node.replaceWith(fragment);
    }
    clear.hidden = !notes.length;
  }

  function hide() { toolbar.hidden = true; chosen = null; anchorMark = null; }
  function show(rect) {
    const intersects = notes.some(note => note.start < chosen.end && note.end > chosen.start);
    const covered = notes.some(note => note.start <= chosen.start && note.end >= chosen.end);
    add.hidden = covered;
    remove.hidden = !intersects;
    toolbar.hidden = false;
    const box = toolbar.getBoundingClientRect();
    const left = Math.max(8, Math.min(window.innerWidth - box.width - 8, rect.left + rect.width / 2 - box.width / 2));
    const top = rect.top > box.height + 16 ? rect.top - box.height - 10 : rect.bottom + 10;
    toolbar.style.left = `${left}px`;
    toolbar.style.top = `${Math.max(8, Math.min(window.innerHeight - box.height - 8, top))}px`;
  }
  function selected() {
    if (toolbar.contains(document.activeElement)) return;
    const selection = getSelection();
    if (!selection?.rangeCount || selection.isCollapsed) {
      if (anchorMark?.isConnected && chosen) return show(anchorMark.getBoundingClientRect());
      return hide();
    }
    anchorMark = null;
    const range = selection.getRangeAt(0);
    if (!prose.contains(range.startContainer) || !prose.contains(range.endContainer) || !range.toString().trim()) return hide();
    const before = document.createRange();
    before.selectNodeContents(prose);
    before.setEnd(range.startContainer, range.startOffset);
    const start = before.toString().length;
    chosen = { start, end: start + range.toString().length };
    const rects = range.getClientRects();
    show(rects[0] || range.getBoundingClientRect());
  }
  let selectionFrame;
  document.addEventListener('selectionchange', () => {
    cancelAnimationFrame(selectionFrame);
    selectionFrame = requestAnimationFrame(selected);
  });
  // Preserve the selection while activating the floating controls on touch/mouse.
  toolbar.addEventListener('pointerdown', event => event.preventDefault());
  toolbar.addEventListener('focusout', () => setTimeout(() => {
    if (!toolbar.contains(document.activeElement)) selected();
  }, 0));
  toolbar.addEventListener('keydown', event => {
    const buttons = [...toolbar.querySelectorAll('button')].filter(button => !button.hidden);
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const current = buttons.indexOf(document.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1
      : (current + (event.key === 'ArrowLeft' ? -1 : 1) + buttons.length) % buttons.length;
    buttons[next]?.focus();
  });
  add.addEventListener('click', () => {
    if (!chosen) return;
    notes.push(chosen);
    merge();
    finish();
  });
  remove.addEventListener('click', () => {
    if (!chosen) return;
    notes = notes.flatMap(note => {
      if (note.end <= chosen.start || note.start >= chosen.end) return [note];
      return [
        ...(note.start < chosen.start ? [{ start: note.start, end: chosen.start }] : []),
        ...(note.end > chosen.end ? [{ start: chosen.end, end: note.end }] : []),
      ];
    });
    merge();
    finish();
  });
  function finish() {
    const keyboard = toolbar.contains(document.activeElement);
    getSelection()?.removeAllRanges();
    hide();
    paint();
    save();
    if (keyboard) { prose.tabIndex = -1; prose.focus({ preventScroll: true }); }
  }
  clear.addEventListener('click', () => {
    // Clear can be undone immediately, avoiding an accidental permanent wipe.
    const previous = notes;
    notes = [];
    finish();
    const undo = document.createElement('button');
    undo.type = 'button';
    undo.className = 'reading-clear';
    undo.textContent = zh ? '撤销清除' : 'Undo clear';
    tools.querySelector('[data-undo-clear]')?.remove();
    undo.dataset.undoClear = '';
    tools.append(undo);
    undo.addEventListener('click', () => { notes = [...notes, ...previous]; merge(); finish(); undo.remove(); }, { once: true });
    undo.focus();
  });
  prose.addEventListener('click', event => {
    const mark = event.target.closest('mark.reader-underline');
    if (!mark || !getSelection()?.isCollapsed) return;
    anchorMark = mark;
    chosen = { start: Number(mark.dataset.start), end: Number(mark.dataset.end) };
    show(mark.getBoundingClientRect());
  });
  document.addEventListener('pointerdown', event => {
    if (!toolbar.contains(event.target)) anchorMark = null;
    if (!toolbar.contains(event.target) && !prose.contains(event.target)) hide();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); });
  window.addEventListener('scroll', hide, { passive: true });
  window.addEventListener('resize', hide);
  window.addEventListener('storage', event => {
    if (event.key === storageKey || event.key === null) { hide(); load(); paint(); }
  });
  load();
  paint();
})();
