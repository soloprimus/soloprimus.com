import { DurableObject } from 'cloudflare:workers';

const TIME_ZONE = 'America/Los_Angeles';
const DAY_FORMAT = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });
const BOT = /bot|crawler|spider|headless|lighthouse|curl|wget|python-requests|preview|facebookexternalhit/i;
const COUNTER_NAME = 'soloprimus-public-readers-v1';
const encoder = new TextEncoder();

export function calendarDay(now = new Date()) {
  // IANA timezone rules include California's daylight-saving transitions.
  const fields = Object.fromEntries(DAY_FORMAT.formatToParts(now).map(({ type, value }) => [type, value]));
  return `${fields.year}-${fields.month}-${fields.day}`;
}

export function approximateLocation(cf = {}) {
  if (!/^[A-Z]{2}$/.test(cf.country || '') || cf.country === 'XX' || cf.country === 'T1') return null;
  if (cf.latitude == null || cf.longitude == null || cf.latitude === '' || cf.longitude === '') return null;
  const lat = Number(cf.latitude), lon = Number(cf.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  const city = placeName(cf.city), region = placeName(cf.region);
  // IP geolocation describes a city, never a person's GPS position.
  const step = city ? 0.1 : 2;
  const round = value => Number((Math.round(value / step) * step).toFixed(1));
  return { country: cf.country, city, region, lat: round(lat), lon: round(lon) };
}

function placeName(value) {
  return typeof value === 'string' && value.length <= 100 ? value.replace(/[\p{Cc}\p{Cf}]/gu, '').trim() : '';
}

function json(body, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}

function counter(env) {
  return env.VISITORS.get(env.VISITORS.idFromName(COUNTER_NAME));
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/visitors') {
      if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405);
      try {
        return await counter(env).fetch(new Request('https://counter.internal/stats'));
      } catch {
        return json({ error: 'statistics_unavailable' }, 503);
      }
    }
    if (url.pathname.startsWith('/api/')) return json({ error: 'not_found' }, 404);

    // Static assets keep their existing headers, redirects, 404 and cache behavior.
    const response = await env.ASSETS.fetch(request);
    const ip = request.headers.get('CF-Connecting-IP');
    const destination = request.headers.get('Sec-Fetch-Dest');
    const isPage = request.method === 'GET' && response.status === 200 &&
      response.headers.get('Content-Type')?.includes('text/html') &&
      request.headers.get('Accept')?.includes('text/html') &&
      (!destination || destination === 'document') &&
      !BOT.test(request.headers.get('User-Agent') || '') && !request.cf?.botManagement?.verifiedBot;
    if (isPage && ip && env.VISITORS) {
      // Persist separately so readers never wait for analytics to see the page.
      ctx.waitUntil(counter(env).fetch(new Request('https://counter.internal/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, location: approximateLocation(request.cf) }),
      })).then(result => {
        if (!result.ok) throw new Error('Counter write failed');
      }).catch(() => console.error('Visitor statistics write unavailable')));
    }
    return response;
  },
};

export class VisitorCounter extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.storage = ctx.storage;
    this.sql = ctx.storage.sql;
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS counters (key TEXT PRIMARY KEY, value INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS visitors (visitor_hash TEXT PRIMARY KEY);
      CREATE TABLE IF NOT EXISTS daily_visitors (day TEXT NOT NULL, visitor_hash TEXT NOT NULL, PRIMARY KEY(day, visitor_hash));
      CREATE TABLE IF NOT EXISTS daily_totals (day TEXT PRIMARY KEY, visitors INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS locations (day TEXT NOT NULL, country TEXT NOT NULL, lat REAL NOT NULL, lon REAL NOT NULL, visitors INTEGER NOT NULL, last_seen TEXT NOT NULL, PRIMARY KEY(day, country, lat, lon));
      CREATE TABLE IF NOT EXISTS city_visitors (day TEXT NOT NULL, visitor_hash TEXT NOT NULL, PRIMARY KEY(day, visitor_hash));
      CREATE TABLE IF NOT EXISTS city_locations (day TEXT NOT NULL, country TEXT NOT NULL, region TEXT NOT NULL, city TEXT NOT NULL, lat REAL NOT NULL, lon REAL NOT NULL, visitors INTEGER NOT NULL, last_seen TEXT NOT NULL, PRIMARY KEY(day, country, region, city));
      INSERT OR IGNORE INTO counters VALUES ('total', 0);
    `);
    const salt = this.sql.exec("SELECT value FROM metadata WHERE key = 'salt'").toArray()[0]?.value;
    if (!salt) {
      const secret = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
      this.sql.exec("INSERT INTO metadata VALUES ('salt', ?)", secret);
      this.sql.exec("INSERT INTO metadata VALUES ('started_at', ?)", new Date().toISOString());
    }
    this.key = crypto.subtle.importKey('raw', encoder.encode(salt || this.sql.exec("SELECT value FROM metadata WHERE key = 'salt'").one().value), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    this.lastCleanup = '';
  }

  async fetch(request) {
    const path = new URL(request.url).pathname;
    if (path === '/stats' && request.method === 'GET') return json(this.snapshot());
    if (path !== '/visit' || request.method !== 'POST') return json({ error: 'not_found' }, 404);
    const { ip, location } = await request.json();
    if (typeof ip !== 'string' || !ip || ip.length > 64) return json({ error: 'invalid_visit' }, 400);
    const signed = await crypto.subtle.sign('HMAC', await this.key, encoder.encode(ip));
    const visitor = Array.from(new Uint8Array(signed), b => b.toString(16).padStart(2, '0')).join('');
    const now = new Date(), day = calendarDay(now), timestamp = now.toISOString();
    this.storage.transactionSync(() => {
      const first = this.sql.exec('INSERT OR IGNORE INTO visitors VALUES (?) RETURNING visitor_hash', visitor).toArray().length;
      if (first) this.sql.exec("UPDATE counters SET value = value + 1 WHERE key = 'total'");
      const today = this.sql.exec('INSERT OR IGNORE INTO daily_visitors VALUES (?, ?) RETURNING visitor_hash', day, visitor).toArray().length;
      if (today) {
        this.sql.exec('INSERT INTO daily_totals VALUES (?, 1) ON CONFLICT(day) DO UPDATE SET visitors = visitors + 1', day);
        if (location && /^[A-Z]{2}$/.test(location.country) && Number.isFinite(location.lat) && Number.isFinite(location.lon) && Math.abs(location.lat) <= 90 && Math.abs(location.lon) <= 180) {
          this.sql.exec('INSERT INTO locations VALUES (?, ?, ?, ?, 1, ?) ON CONFLICT(day, country, lat, lon) DO UPDATE SET visitors = visitors + 1, last_seen = excluded.last_seen', day, location.country, location.lat, location.lon, timestamp);
        }
      }
      // A previously counted reader can gain a city label after this upgrade.
      // This updates only geographic aggregates, never either visitor total.
      if (location && /^[A-Z]{2}$/.test(location.country) && Number.isFinite(location.lat) && Number.isFinite(location.lon) && Math.abs(location.lat) <= 90 && Math.abs(location.lon) <= 180) {
        const observed = this.sql.exec('INSERT OR IGNORE INTO city_visitors VALUES (?, ?) RETURNING visitor_hash', day, visitor).toArray().length;
        if (observed) this.sql.exec('INSERT INTO city_locations VALUES (?, ?, ?, ?, ?, ?, 1, ?) ON CONFLICT(day, country, region, city) DO UPDATE SET visitors = visitors + 1, last_seen = excluded.last_seen', day, location.country, placeName(location.region), placeName(location.city), location.lat, location.lon, timestamp);
      }
      if (this.lastCleanup !== day) {
        const cutoff = calendarDay(new Date(now.getTime() - 14 * 86400000));
        this.sql.exec('DELETE FROM daily_visitors WHERE day < ?', cutoff);
        this.sql.exec('DELETE FROM locations WHERE day < ?', cutoff);
        this.sql.exec('DELETE FROM city_visitors WHERE day < ?', cutoff);
        this.sql.exec('DELETE FROM city_locations WHERE day < ?', cutoff);
        this.lastCleanup = day;
      }
    });
    return json({ recorded: true });
  }

  snapshot() {
    const day = calendarDay();
    const cities = this.sql.exec('SELECT country, region, city, lat, lon, visitors FROM city_locations WHERE day = ? ORDER BY visitors DESC, last_seen DESC', day).toArray();
    const cityCountries = new Set(cities.map(item => item.country));
    const legacy = this.sql.exec('SELECT country, lat, lon, visitors FROM locations WHERE day = ? ORDER BY visitors DESC, last_seen DESC', day).toArray();
    return {
      today: this.sql.exec('SELECT visitors FROM daily_totals WHERE day = ?', day).toArray()[0]?.visitors || 0,
      total: this.sql.exec("SELECT value FROM counters WHERE key = 'total'").one().value,
      day,
      timeZone: TIME_ZONE,
      startedAt: this.sql.exec("SELECT value FROM metadata WHERE key = 'started_at'").one().value,
      generatedAt: new Date().toISOString(),
      locations: [...cities, ...legacy.filter(item => !cityCountries.has(item.country))],
      countries: this.sql.exec('SELECT country, SUM(visitors) AS visitors FROM locations WHERE day = ? GROUP BY country ORDER BY visitors DESC', day).toArray(),
    };
  }
}
