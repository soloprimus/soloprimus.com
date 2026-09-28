/* SOLO PRIMUS · 凌霄: theme toggle, mobile menu, and essay filters. No dependencies. */
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
