/* SOLO PRIMUS · 凌霄: theme toggle, mobile menu, social QR codes, and essay filters. No dependencies. */
(() => {
  'use strict';
  const root = document.documentElement;

  // Color theme. The initial value is set inline in <head> before first paint.
  const themeButton = document.querySelector('.theme-toggle');
  const syncTheme = () => {
    if (!themeButton) return;
    const dark = root.dataset.theme === 'dark';
    themeButton.setAttribute('aria-label', dark ? themeButton.dataset.labelLight : themeButton.dataset.labelDark);
    themeButton.setAttribute('aria-pressed', String(dark));
  };
  themeButton?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('soloprimus-theme', root.dataset.theme); } catch (_) { /* storage unavailable */ }
    syncTheme();
  });
  syncTheme();

  // Mobile menu.
  const nav = document.getElementById('site-nav');
  const toggle = document.querySelector('.nav-toggle');
  const setMenu = (open) => {
    if (!nav || !toggle) return;
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? toggle.dataset.labelClose : toggle.dataset.labelOpen);
  };
  toggle?.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav?.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (nav?.classList.contains('is-open') && !event.target.closest('.site-header')) setMenu(false);
  });

  // Native dialogs provide keyboard focus containment and Escape-to-close.
  document.querySelectorAll('[data-qr-dialog]').forEach((link) => {
    const dialog = document.getElementById(link.dataset.qrDialog);
    if (!dialog || typeof dialog.showModal !== 'function') return;
    link.addEventListener('click', (event) => {
      // Preserve the direct-image link for modified clicks and browsers without dialog support.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (!dialog.open) dialog.showModal();
      root.classList.add('qr-open');
    });
  });
  document.querySelectorAll('.qr-dialog').forEach((dialog) => {
    dialog.addEventListener('close', () => {
      if (!document.querySelector('.qr-dialog[open]')) root.classList.remove('qr-open');
    });
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
    const image = dialog.querySelector('img');
    const showError = () => {
      image.hidden = true;
      dialog.querySelector('.qr-error').hidden = false;
    };
    image.addEventListener('error', showError);
    if (image.complete && image.naturalWidth === 0) showError();
  });

  // Show cumulative article readership without changing publication-date order.
  const readerLists = [...document.querySelectorAll('[data-reader-totals]')];
  if (readerLists.length) {
    let loading = false, updatedAt = 0;
    const updateTotals = async () => {
      if (loading || document.hidden) return;
      loading = true;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch('/api/reading-totals', { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error('Reading totals unavailable');
        const data = await response.json();
        if (!Array.isArray(data.articles) || data.articles.some(item =>
          typeof item.article !== 'string' || !/^[a-z0-9][a-z0-9-]{0,99}$/.test(item.article) ||
          !Number.isSafeInteger(item.total) || item.total < 0)) throw new Error('Invalid reading totals');
        const totals = new Map(data.articles.map(item => [item.article, item.total]));
        for (const list of readerLists) {
          const zh = list.dataset.readerTotals === 'zh';
          const rows = [...list.children];
          for (const row of rows) {
            const total = totals.get(row.dataset.essaySlug) || 0;
            let label = row.querySelector('[data-essay-readers]');
            if (!label) {
              label = document.createElement('span');
              label.dataset.essayReaders = '';
              row.querySelector('.essay-meta').append(label);
            }
            const number = new Intl.NumberFormat(zh ? 'zh-CN' : 'en').format(total);
            label.textContent = zh ? `${number} 人已读` : `${number} ${total === 1 ? 'reader' : 'readers'}`;
          }
        }
        updatedAt = Date.now();
      } catch { /* Keep the static list and omit unknown counts if statistics fail. */ }
      finally { clearTimeout(timeout); loading = false; }
    };
    updateTotals();
    window.addEventListener('pageshow', event => { if (event.persisted) updateTotals(); });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && Date.now() - updatedAt > 60000) updateTotals();
    });
  }

  // Essay filters on the essays page. Without JavaScript every essay stays visible.
  const buttons = [...document.querySelectorAll('[data-filter]')];
  if (buttons.length) {
    const topics = buttons.map((b) => b.dataset.filter);
    const rows = [...document.querySelectorAll('.essays-index [data-topic]')];
    const groups = [...document.querySelectorAll('.essays-index [data-filter-group]')];
    const empty = document.querySelector('.filter-empty');
    const apply = (topic) => {
      if (!topics.includes(topic)) topic = 'all';
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === topic)));
      let shown = 0;
      rows.forEach((row) => {
        row.hidden = topic !== 'all' && row.dataset.topic !== topic;
        if (!row.hidden) shown += 1;
      });
      groups.forEach((group) => { group.hidden = !group.querySelector('[data-topic]:not([hidden])'); });
      if (empty) empty.hidden = shown > 0;
    };
    buttons.forEach((b) => b.addEventListener('click', () => {
      const topic = b.dataset.filter;
      history.replaceState(null, '', topic === 'all' ? location.pathname : `#${topic}`);
      apply(topic);
    }));
    window.addEventListener('hashchange', () => apply(location.hash.slice(1)));
    apply(location.hash.slice(1));
  }
})();
