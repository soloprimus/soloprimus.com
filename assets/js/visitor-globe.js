/* Reader globe. Real, same-origin visitor statistics; native Canvas.
   Land geometry is derived from Natural Earth's public-domain polygons. */
(() => {
  'use strict';
  const section = document.querySelector('[data-visitor-globe]');
  if (!section) return;
  const canvas = section.querySelector('canvas');
  const context = canvas.getContext('2d');
  const status = section.querySelector('.globe-status');
  status.hidden = false;
  if (!context) {
    status.textContent = status.dataset.error;
    section.dataset.globeReady = 'error';
    return;
  }
  const pauseButton = section.querySelector('.globe-pause');
  const locationLabel = section.querySelector('[data-globe-location]');
  const locationControls = section.querySelector('.globe-locations');
  const statsStatus = section.querySelector('[data-stats-status]');
  const copy = JSON.parse(section.dataset.copy);
  const locale = document.documentElement.lang === 'zh-CN' ? 'zh-CN' : 'en';
  const numberFormat = new Intl.NumberFormat(locale);
  const countryNames = new Intl.DisplayNames([locale], { type: 'region' });
  let locationButtons = [];
  let locations = [];
  let statsBusy = false;
  let statsTimer = null;
  statsStatus.hidden = false;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const colorScheme = matchMedia('(prefers-color-scheme: dark)');
  const radians = Math.PI / 180;
  const tilt = 18 * radians;
  const cosTilt = Math.cos(tilt);
  const sinTilt = Math.sin(tilt);
  let land = [];
  let width = 0;
  let height = 0;
  let palette;
  let longitude = 110 * radians;
  let destination = null;
  let active = 0;
  let paused = reduced.matches;
  let visible = false;
  let started = false;
  let loaded = false;
  let previousTime = 0;
  let elapsed = 0;
  let frameId = null;

  function rgb(hex) {
    const value = hex.trim().replace('#', '');
    return [0, 2, 4].map(index => parseInt(value.slice(index, index + 2), 16));
  }
  const rgba = (color, alpha) => `rgba(${color.join(',')},${alpha})`;
  function readPalette() {
    const style = getComputedStyle(document.documentElement);
    palette = Object.fromEntries(['paper', 'band', 'ink-2', 'line-2', 'accent'].map(key => [key, rgb(style.getPropertyValue(`--${key}`))]));
    if (loaded) draw();
  }
  function worldPoint(lat, lon) {
    const latitude = lat * radians;
    const meridian = lon * radians;
    return [Math.cos(latitude) * Math.sin(meridian), Math.sin(latitude), Math.cos(latitude) * Math.cos(meridian)];
  }
  let markers = [];
  const graticules = [
    ...[-60, -30, 0, 30, 60].map(lat => Array.from({ length: 181 }, (_, step) => worldPoint(lat, step * 2 - 180))),
    ...[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150, 180].map(lon => Array.from({ length: 181 }, (_, step) => worldPoint(step - 90, lon))),
  ];
  function project(point, cos, sin) {
    const horizontal = point[0] * cos - point[2] * sin;
    const depth = point[0] * sin + point[2] * cos;
    return [horizontal, point[1] * cosTilt - depth * sinTilt, point[1] * sinTilt + depth * cosTilt];
  }
  function draw() {
    if (!loaded || !width || !height || !palette) return;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(cx, cy) - 19;
    const cos = Math.cos(longitude);
    const sin = Math.sin(longitude);
    const xy = point => [cx + point[0] * radius, cy - point[1] * radius];
    context.clearRect(0, 0, width, height);

    // A restrained spherical surface makes the geographic points legible.
    context.beginPath();
    context.arc(cx, cy, radius, 0, Math.PI * 2);
    const surface = context.createRadialGradient(cx - radius * .32, cy - radius * .38, radius * .08, cx, cy, radius);
    surface.addColorStop(0, rgba(palette.band, .12));
    surface.addColorStop(1, rgba(palette['line-2'], .16));
    context.fillStyle = surface;
    context.fill();
    context.strokeStyle = rgba(palette['line-2'], .65);
    context.lineWidth = .65;
    context.stroke();

    // Geographic graticules are clipped to the visible hemisphere.
    function graticule(points) {
      context.beginPath();
      let drawing = false;
      for (const coordinate of points) {
        const point = project(coordinate, cos, sin);
        if (point[2] > .002) {
          const [x, y] = xy(point);
          if (drawing) context.lineTo(x, y); else context.moveTo(x, y);
          drawing = true;
        } else drawing = false;
      }
      context.stroke();
    }
    context.strokeStyle = rgba(palette['line-2'], .34);
    context.lineWidth = .5;
    for (const points of graticules) graticule(points);

    // Rear points are faint; front points gain contrast toward the viewer.
    // Batch thousands of dots into nine paths instead of thousands of fills.
    const layers = Array.from({ length: 9 }, () => []);
    for (const point of land) {
      const p = project(point, cos, sin);
      const layer = p[2] < 0 ? 0 : 1 + Math.min(7, Math.floor(p[2] * 8));
      layers[layer].push(xy(p));
    }
    for (let layer = 0; layer < layers.length; layer++) {
      const depth = (layer - .5) / 8;
      const dotRadius = layer ? .72 + depth * .52 : .65;
      context.fillStyle = rgba(palette['ink-2'], layer ? .32 + depth * .40 : .07);
      context.beginPath();
      for (const [x, y] of layers[layer]) {
        context.moveTo(x + dotRadius, y);
        context.arc(x, y, dotRadius, 0, Math.PI * 2);
      }
      context.fill();
    }

    for (let index = 0; index < markers.length; index++) {
      const p = project(markers[index], cos, sin);
      if (p[2] <= .02) continue;
      const [x, y] = xy(p);
      const selected = index === active;
      if (selected && !paused && !reduced.matches) {
        const phase = (elapsed % 3.2) / 3.2;
        context.beginPath();
        context.arc(x, y, 6 + phase * 19, 0, Math.PI * 2);
        context.strokeStyle = rgba(palette.accent, (1 - phase) * .4);
        context.lineWidth = 1;
        context.stroke();
      }
      if (selected) {
        context.beginPath();
        context.arc(x, y, 9, 0, Math.PI * 2);
        context.fillStyle = rgba(palette.accent, .12);
        context.fill();
      }
      context.beginPath();
      context.arc(x, y, selected ? 4.1 : 2.4, 0, Math.PI * 2);
      context.fillStyle = rgba(palette.accent, selected ? 1 : .7);
      context.fill();
      context.strokeStyle = rgba(palette.paper, 1);
      context.lineWidth = selected ? 1.5 : .8;
      context.stroke();
    }
  }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    const scale = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    draw();
  }
  function animate(time) {
    frameId = null;
    if (!loaded || !visible || document.hidden || paused || reduced.matches) return;
    // The slow globe stays smooth at 30 fps without using a full refresh budget.
    if (previousTime && time - previousTime < 32) {
      frameId = requestAnimationFrame(animate);
      return;
    }
    const dt = previousTime ? Math.min((time - previousTime) / 1000, .05) : 0;
    previousTime = time;
    elapsed += dt;
    if (destination !== null) {
      longitude += (destination - longitude) * (1 - Math.exp(-dt * 4));
      if (Math.abs(destination - longitude) < .002) destination = null;
    } else longitude += dt * .055;
    draw();
    frameId = requestAnimationFrame(animate);
  }
  function schedule() {
    if (frameId !== null) cancelAnimationFrame(frameId);
    frameId = null;
    previousTime = 0;
    if (loaded && visible && !document.hidden && !paused && !reduced.matches) frameId = requestAnimationFrame(animate);
    else draw();
  }
  function syncPause() {
    pauseButton.hidden = !loaded;
    pauseButton.disabled = reduced.matches;
    pauseButton.textContent = reduced.matches ? pauseButton.dataset.static : paused ? pauseButton.dataset.resume : pauseButton.dataset.pause;
    pauseButton.setAttribute('aria-pressed', String(paused || reduced.matches));
    section.dataset.motion = paused || reduced.matches ? 'paused' : 'running';
    schedule();
  }
  pauseButton.addEventListener('click', () => {
    paused = !paused;
    syncPause();
  });
  function selectLocation(index, rotate = true) {
    active = index;
    locationButtons.forEach(item => item.setAttribute('aria-pressed', String(Number(item.dataset.globeLocationIndex) === index)));
    locationLabel.textContent = locations[index]?.label || copy.noLocations;
    if (locations[index] && rotate) {
      const delta = Math.atan2(Math.sin(locations[index].lon * radians - longitude), Math.cos(locations[index].lon * radians - longitude));
      if (paused || reduced.matches) { longitude += delta; destination = null; draw(); }
      else destination = longitude + delta;
      elapsed = 0;
    }
    schedule();
  }
  function updateLocations(points, countries) {
    const selectedKey = locations[active]?.key;
    const focusedKey = locationControls.contains(document.activeElement) ? locations[Number(document.activeElement.dataset.globeLocationIndex)]?.key : null;
    const totals = new Map(countries.filter(item => /^[A-Z]{2}$/.test(item.country) && Number.isSafeInteger(item.visitors) && item.visitors > 0).map(item => [item.country, item.visitors]));
    locations = points.filter(item => /^[A-Z]{2}$/.test(item.country) && Number.isFinite(item.lat) && Number.isFinite(item.lon) && Math.abs(item.lat) <= 90 && Math.abs(item.lon) <= 180 && Number.isSafeInteger(item.visitors) && item.visitors > 0).map(item => {
      const city = typeof item.city === 'string' ? item.city.slice(0, 100) : '';
      const region = typeof item.region === 'string' ? item.region.slice(0, 100) : '';
      const country = countryNames.of(item.country);
      const name = [city || region, country].filter(Boolean).join(' · ');
      const count = 'city' in item ? item.visitors : totals.get(item.country) || item.visitors;
      return {
        ...item, name, shortName: city || region || country,
        key: JSON.stringify([item.country, region, city]),
        label: copy.region.replace('{place}', name).replace('{count}', numberFormat.format(count)),
      };
    });
    markers = locations.map(item => worldPoint(item.lat, item.lon));
    const scrollTop = locationControls.scrollTop;
    locationControls.replaceChildren();
    const chosen = new Set();
    for (let index = 0; index < locations.length; index++) {
      if (chosen.has(locations[index].key)) continue;
      chosen.add(locations[index].key);
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.globeLocationIndex = String(index);
      button.textContent = locations[index].shortName;
      button.setAttribute('aria-label', locations[index].label);
      button.title = locations[index].name;
      button.addEventListener('click', () => selectLocation(index));
      locationControls.append(button);
    }
    locationButtons = [...locationControls.querySelectorAll('button')];
    locationControls.hidden = !loaded || !locations.length;
    active = Math.max(0, locations.findIndex(item => item.key === selectedKey));
    selectLocation(active, !selectedKey && locations.length > 0);
    if (focusedKey) locationButtons.find(button => locations[Number(button.dataset.globeLocationIndex)].key === focusedKey)?.focus({ preventScroll: true });
    locationControls.scrollTop = scrollTop;
  }
  function queueStats(delay = 45000) {
    clearTimeout(statsTimer);
    statsTimer = visible && !document.hidden ? setTimeout(readStats, delay) : null;
  }
  async function readStats() {
    if (statsBusy) return;
    statsBusy = true;
    try {
      const response = await fetch(section.dataset.statsSrc, { credentials: 'omit', cache: 'no-store', signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error('Statistics unavailable');
      const data = await response.json();
      const started = new Date(data.startedAt), updated = new Date(data.generatedAt);
      if (![data.today, data.total].every(n => Number.isSafeInteger(n) && n >= 0) || data.today > data.total || !Array.isArray(data.locations) || !Array.isArray(data.countries) || !Number.isFinite(started.getTime()) || !Number.isFinite(updated.getTime())) throw new Error('Invalid statistics');
      section.querySelector('[data-visitor-today]').textContent = numberFormat.format(data.today);
      section.querySelector('[data-visitor-total]').textContent = numberFormat.format(data.total);
      const timeZone = data.timeZone || 'America/Los_Angeles';
      const date = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric', timeZone }).format(started);
      const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone, hour12: false }).format(updated);
      statsStatus.textContent = `${copy.since.replace('{date}', date)} · ${copy.updated.replace('{time}', time)}`;
      statsStatus.dataset.error = 'false';
      section.dataset.statsReady = 'true';
      updateLocations(data.locations, data.countries);
    } catch {
      statsStatus.textContent = copy.unavailable;
      statsStatus.dataset.error = 'true';
      section.dataset.statsReady = 'error';
    } finally {
      statsBusy = false;
      queueStats();
    }
  }
  // Reading statistics never increments the counter; document requests do that.
  readStats();
  reduced.addEventListener('change', () => { paused = reduced.matches; syncPause(); });
  colorScheme.addEventListener('change', readPalette);
  document.addEventListener('visibilitychange', () => { schedule(); if (!document.hidden && visible) readStats(); else queueStats(); });
  const themeObserver = new MutationObserver(readPalette);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  readPalette();

  async function load() {
    if (started) return;
    started = true;
    try {
      const response = await fetch(section.dataset.landSrc, { credentials: 'omit' });
      if (!response.ok) throw new Error('Geography unavailable');
      const data = await response.json();
      if (!Array.isArray(data.points) || data.points.length < 100) throw new Error('Invalid geography');
      land = data.points.map(([lat, lon]) => worldPoint(lat, lon));
      loaded = true;
      status.hidden = true;
      section.dataset.globeReady = 'true';
      locationControls.hidden = !locations.length;
      resize();
      syncPause();
    } catch {
      status.textContent = status.dataset.error;
      section.dataset.globeReady = 'error';
    }
  }
  // Only fetch and animate when this below-the-fold module approaches the screen.
  const preloadObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) { load(); preloadObserver.disconnect(); }
  }, { rootMargin: '240px' });
  preloadObserver.observe(section);
  const visibilityObserver = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    schedule();
    if (visible) readStats(); else queueStats();
  });
  visibilityObserver.observe(canvas);
  window.addEventListener('pagehide', () => {
    if (frameId !== null) cancelAnimationFrame(frameId);
    frameId = null;
    clearTimeout(statsTimer);
  });
  window.addEventListener('pageshow', () => { schedule(); if (visible) readStats(); });
})();
