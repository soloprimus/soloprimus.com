import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';

// The test adapter uses a real SQLite database. Wrangler also exercises the
// unchanged Worker in workerd; this adapter lets us control time and visitor IPs.
const source = readFileSync(new URL('../workers/index.mjs', import.meta.url), 'utf8')
  .replace("import { DurableObject } from 'cloudflare:workers';", 'class DurableObject { constructor() {} }');
const { default: worker, VisitorCounter, calendarDay, approximateLocation } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

function sqliteStorage(db = new DatabaseSync(':memory:')) {
  return {
    db,
    sql: { exec(query, ...bindings) {
      if (!bindings.length && query.trim().split(';').filter(Boolean).length > 1) { db.exec(query); return {}; }
      const statement = db.prepare(query);
      const rows = statement.columns().length ? statement.all(...bindings) : (statement.run(...bindings), []);
      return { toArray: () => rows, one: () => { assert.equal(rows.length, 1); return rows[0]; } };
    } },
    transactionSync(fn) {
      db.exec('BEGIN');
      try { const result = fn(); db.exec('COMMIT'); return result; }
      catch (error) { db.exec('ROLLBACK'); throw error; }
    },
  };
}
const visit = (counter, ip, location = { country: 'CN', lat: 32, lon: 122 }) => counter.fetch(new Request('https://internal/visit', {
  method: 'POST', body: JSON.stringify({ ip, location }),
}));

test('Homepage language uses mainland IP, with stable deep links and uncached redirects', async () => {
  let assetCalls = 0;
  const env = { ASSETS: { fetch: async () => {
    assetCalls++;
    return new Response('page', { headers: { 'Content-Type': 'text/html', 'Cache-Control': 'public, max-age=3600', 'X-Content-Type-Options': 'nosniff' } });
  } } };
  const ctx = { waitUntil() { throw new Error('Redirect must not count as a visit'); } };
  async function request(path = '/', country = 'CN', headers = {}, method = 'GET', extra = {}) {
    const req = new Request('https://soloprimus.com' + path, { method, headers: { 'User-Agent': 'Mozilla/5.0', ...headers } });
    Object.defineProperty(req, 'cf', { value: { country, ...extra } });
    return worker.fetch(req, env, ctx);
  }
  const cn = await request('/?utm_source=test');
  assert.equal(cn.status, 302);
  assert.equal(cn.headers.get('Location'), 'https://soloprimus.com/zh/?utm_source=test');
  assert.equal(cn.headers.get('Cache-Control'), 'private, no-store');
  assert.equal(assetCalls, 0);
  for (const country of ['US', 'GB', 'JP', 'HK', 'MO', 'TW', 'XX', null]) {
    const res = await request('/', country);
    assert.equal(res.status, 200, String(country));
    assert.equal(res.headers.get('Cache-Control'), 'private, no-store');
    assert.equal(res.headers.get('X-Content-Type-Options'), 'nosniff');
  }
  const noGeo = await worker.fetch(new Request('https://soloprimus.com/'), env, ctx);
  assert.equal(noGeo.status, 200);
  assert.equal((await request('/', 'CN', {}, 'HEAD')).status, 302);
  for (const path of ['/zh/', '/essays/gpu-speed-cpu-shortage/', '/zh/essays/gpu-speed-cpu-shortage/', '/about/']) {
    for (const country of ['CN', 'US']) {
      const res = await request(path, country);
      assert.equal(res.status, 200);
      assert.equal(res.headers.get('Cache-Control'), 'public, max-age=3600');
    }
  }
  assert.equal((await request('/', 'CN', { 'CF-IPCountry': 'US' })).status, 302);
  assert.equal((await request('/', 'US', { 'CF-IPCountry': 'CN' })).status, 200);
  assert.equal((await request('/', 'CN', { 'User-Agent': 'Googlebot' })).status, 200);
  assert.equal((await request('/', 'CN', {}, 'GET', { botManagement: { verifiedBot: true } })).status, 200);
});

test('Manual language selection survives geographic defaults without a redirect loop', async () => {
  const env = { ASSETS: { fetch: async () => new Response('page', { headers: { 'Content-Type': 'text/html' } }) } };
  async function request(path, country, cookie = '') {
    const req = new Request('https://soloprimus.com' + path, { headers: { 'User-Agent': 'Mozilla/5.0', Cookie: cookie } });
    Object.defineProperty(req, 'cf', { value: { country } });
    return worker.fetch(req, env, { waitUntil() {} });
  }
  const en = await request('/?lang=en', 'CN', 'soloprimus-language=zh');
  assert.equal(en.status, 200);
  assert.match(en.headers.get('Set-Cookie'), /^soloprimus-language=en; Path=\/; Max-Age=31536000; Secure; HttpOnly; SameSite=Lax$/);
  assert.equal((await request('/', 'CN', 'theme=dark; soloprimus-language=en; test=1')).status, 200);
  const zh = await request('/zh/?lang=zh', 'US', 'soloprimus-language=en');
  assert.match(zh.headers.get('Set-Cookie'), /^soloprimus-language=zh;/);
  assert.equal(zh.headers.get('Cache-Control'), 'private, no-store');
  assert.equal((await request('/', 'US', 'soloprimus-language=zh')).headers.get('Location'), 'https://soloprimus.com/zh/');
  assert.equal((await request('/zh/', 'US', 'soloprimus-language=zh')).status, 200);
  const article = await request('/essays/gpu-speed-cpu-shortage/?lang=en', 'CN');
  assert.equal(article.status, 200);
  assert.match(article.headers.get('Set-Cookie'), /^soloprimus-language=en;/);
  assert.equal((await request('/?lang=invalid', 'CN', 'soloprimus-language=not-en')).status, 302);
  assert.equal((await request('/?lang=en', 'CN')).headers.get('Location'), null);
});

test('California calendar days honor midnight, summer/winter time and DST transitions', () => {
  for (const [timestamp, day] of [
    ['2026-01-04T07:59:59Z', '2026-01-03'],
    ['2026-01-04T08:00:00Z', '2026-01-04'],
    ['2026-03-08T07:59:59Z', '2026-03-07'],
    ['2026-03-08T08:00:00Z', '2026-03-08'],
    ['2026-03-09T06:59:59Z', '2026-03-08'],
    ['2026-03-09T07:00:00Z', '2026-03-09'],
    ['2026-10-04T06:59:59Z', '2026-10-03'],
    ['2026-10-04T07:00:00Z', '2026-10-04'],
    ['2026-10-04T16:00:00Z', '2026-10-04'],
    ['2026-11-01T06:59:59Z', '2026-10-31'],
    ['2026-11-01T07:00:00Z', '2026-11-01'],
    ['2026-11-01T08:30:00Z', '2026-11-01'],
    ['2026-11-01T09:30:00Z', '2026-11-01'],
    ['2026-11-02T07:59:59Z', '2026-11-01'],
    ['2026-11-02T08:00:00Z', '2026-11-02'],
  ]) assert.equal(calendarDay(new Date(timestamp)), day, timestamp);
});

test('Geographic quantization and city names', () => {
  assert.deepEqual(approximateLocation({ country: 'CN', latitude: '31.2304', longitude: '121.4737' }), { country: 'CN', city: '', region: '', lat: 32, lon: 122 });
  assert.deepEqual(approximateLocation({ country: 'CN', city: 'Shanghai', region: 'Shanghai', latitude: '31.2304', longitude: '121.4737' }), { country: 'CN', city: 'Shanghai', region: 'Shanghai', lat: 31.2, lon: 121.5 });
  assert.equal(approximateLocation({ country: 'US', city: ' New\u202eyork\n ', latitude: 40.7, longitude: -74 }).city, 'Newyork');
  for (const value of [{}, { country: 'XX', latitude: 31, longitude: 120 }, { country: 'US', latitude: '', longitude: '' }, { country: 'US', latitude: 'NaN', longitude: 3 }, { country: 'US', latitude: 91, longitude: 2 }]) assert.equal(approximateLocation(value), null);
});

test('City upgrade keeps existing counts and keys, enriches returning visitors only once', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2026-10-04T12:00:00Z') });
  const storage = sqliteStorage();
  let instance = new VisitorCounter({ storage }, {});
  await visit(instance, '198.51.100.20', { country: 'CN', lat: 32, lon: 122 });
  const salt = storage.sql.exec("SELECT value FROM metadata WHERE key = 'salt'").one().value;
  const start = instance.snapshot().startedAt;
  // Model storage written before city support was introduced.
  storage.sql.exec('DROP TABLE city_visitors');
  storage.sql.exec('DROP TABLE city_locations');
  instance = new VisitorCounter({ storage }, {});
  assert.equal(instance.snapshot().locations[0].city, undefined);
  const shanghai = approximateLocation({ country: 'CN', city: 'Shanghai', region: 'Shanghai', latitude: 31.2304, longitude: 121.4737 });
  const beijing = approximateLocation({ country: 'CN', city: 'Beijing', region: 'Beijing', latitude: 39.9042, longitude: 116.4074 });
  await Promise.all(Array.from({ length: 10 }, () => visit(instance, '198.51.100.20', shanghai)));
  assert.equal(instance.snapshot().today, 1);
  assert.equal(instance.snapshot().total, 1);
  assert.equal(instance.snapshot().locations[0].city, 'Shanghai');
  assert.equal(instance.snapshot().locations[0].visitors, 1);
  await visit(instance, '198.51.100.21', shanghai);
  await visit(instance, '198.51.100.22', beijing);
  let snapshot = instance.snapshot();
  assert.equal(snapshot.total, 3);
  assert.equal(snapshot.locations.length, 2);
  assert.equal(snapshot.locations.find(item => item.city === 'Shanghai').visitors, 2);
  assert.equal(snapshot.countries[0].visitors, 3);
  assert.equal(snapshot.startedAt, start);
  assert.equal(storage.sql.exec("SELECT value FROM metadata WHERE key = 'salt'").one().value, salt);
  instance = new VisitorCounter({ storage }, {});
  await visit(instance, '198.51.100.20', beijing);
  assert.equal(instance.snapshot().total, 3);
  assert.equal(instance.snapshot().locations.find(item => item.city === 'Beijing').visitors, 1);
  t.mock.timers.setTime(new Date('2026-10-25T04:00:00Z').getTime());
  await visit(instance, '198.51.100.20', beijing);
  assert.equal(instance.snapshot().today, 1);
  assert.equal(instance.snapshot().total, 3);
  assert.equal(storage.sql.exec('SELECT COUNT(*) AS n FROM city_visitors').one().n, 1);
  assert.equal(storage.sql.exec('SELECT COUNT(*) AS n FROM city_locations').one().n, 1);
  storage.db.close();
});

test('Unique visitors persist through refreshes, concurrency, day changes and object restarts', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2026-10-04T12:00:00Z') });
  const storage = sqliteStorage();
  let counter = new VisitorCounter({ storage }, {});
  assert.equal(counter.snapshot().total, 0);
  await Promise.all(Array.from({ length: 20 }, () => visit(counter, '198.51.100.1')));
  await visit(counter, '198.51.100.2', { country: 'US', lat: 40, lon: -74 });
  let snapshot = counter.snapshot();
  assert.equal(snapshot.today, 2);
  assert.equal(snapshot.total, 2);
  assert.equal(snapshot.locations.length, 2);
  assert.equal(snapshot.countries.reduce((sum, item) => sum + item.visitors, 0), 2);
  assert(!JSON.stringify(snapshot).includes('198.51.100'));
  assert(!JSON.stringify(storage.sql.exec('SELECT * FROM visitors').toArray()).includes('198.51.100'));
  assert.deepEqual(Object.keys(storage.sql.exec('SELECT * FROM visitors').toArray()[0]), ['visitor_hash']);
  t.mock.timers.setTime(new Date('2026-10-04T16:00:00Z').getTime());
  assert.equal(counter.snapshot().today, 2, 'Beijing midnight must no longer reset the reporting day');
  assert.equal(counter.snapshot().timeZone, 'America/Los_Angeles');
  t.mock.timers.setTime(new Date('2026-10-05T06:59:59Z').getTime());
  await visit(counter, '198.51.100.1');
  assert.equal(counter.snapshot().today, 2);
  t.mock.timers.setTime(new Date('2026-10-05T07:00:00Z').getTime());
  assert.equal(counter.snapshot().today, 0);
  await visit(counter, '198.51.100.1');
  await visit(counter, '198.51.100.3', null);
  snapshot = counter.snapshot();
  assert.equal(snapshot.today, 2);
  assert.equal(snapshot.total, 3);
  assert.equal(snapshot.locations.reduce((sum, item) => sum + item.visitors, 0), 1);
  const start = snapshot.startedAt;
  counter = new VisitorCounter({ storage }, {});
  await visit(counter, '198.51.100.1');
  assert.equal(counter.snapshot().total, 3);
  assert.equal(counter.snapshot().today, 2);
  assert.equal(counter.snapshot().startedAt, start);
  t.mock.timers.setTime(new Date('2026-10-25T04:00:00Z').getTime());
  await visit(counter, '198.51.100.1');
  assert.equal(counter.snapshot().total, 3);
  assert.equal(counter.snapshot().today, 1);
  assert.equal(storage.sql.exec("SELECT COUNT(*) AS n FROM daily_visitors WHERE day < '2026-10-11'").one().n, 0);
  storage.db.close();
});

test('Collecting the first city retains legacy geography for other countries', async () => {
  const storage = sqliteStorage();
  let instance = new VisitorCounter({ storage }, {});
  await visit(instance, '198.51.100.30', { country: 'CN', lat: 32, lon: 122 });
  await visit(instance, '198.51.100.31', { country: 'US', lat: 40, lon: -78 });
  storage.sql.exec('DROP TABLE city_visitors');
  storage.sql.exec('DROP TABLE city_locations');
  instance = new VisitorCounter({ storage }, {});
  await visit(instance, '198.51.100.30', approximateLocation({ country: 'CN', city: 'Shanghai', latitude: 31.2304, longitude: 121.4737 }));
  const snapshot = instance.snapshot();
  assert.equal(snapshot.today, 2);
  assert.equal(snapshot.total, 2);
  assert.equal(snapshot.locations.length, 2);
  assert.equal(snapshot.locations.find(item => item.country === 'CN').city, 'Shanghai');
  assert.equal(snapshot.locations.find(item => item.country === 'US').city, undefined);
  storage.db.close();
});

test('Every current-day city and legacy country remains available beyond 24 locations', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2026-10-05T12:00:00Z') });
  const storage = sqliteStorage();
  let instance = new VisitorCounter({ storage }, {});
  const legacyCountries = ['CN', 'JP', 'GB', 'DE', 'FR'];
  for (let i = 0; i < legacyCountries.length; i++) {
    await visit(instance, `198.51.100.${i + 1}`, { country: legacyCountries[i], lat: 30, lon: i * 10 });
  }
  storage.sql.exec('DROP TABLE city_visitors');
  storage.sql.exec('DROP TABLE city_locations');
  instance = new VisitorCounter({ storage }, {});
  for (let i = 0; i < 40; i++) {
    await visit(instance, `203.0.113.${i + 1}`, { country: 'US', city: `Test City ${i}`, region: 'Test Region', lat: 30, lon: i });
  }
  await visit(instance, '203.0.113.200', { country: 'US', city: 'Test City 39', region: 'Test Region', lat: 30, lon: 39 });
  const snapshot = instance.snapshot();
  assert.equal(snapshot.today, 46);
  assert.equal(snapshot.total, 46);
  assert.equal(snapshot.locations.length, 45);
  assert.equal(snapshot.locations.filter(item => item.city).length, 40);
  assert.equal(snapshot.locations[0].city, 'Test City 39');
  assert.equal(snapshot.locations[0].visitors, 2);
  for (const country of legacyCountries) assert(snapshot.locations.some(item => item.country === country && !('city' in item)));
  assert.equal(new Set(snapshot.locations.filter(item => item.city).map(item => item.city)).size, 40);
  t.mock.timers.setTime(new Date('2026-10-06T07:00:00Z').getTime());
  assert.equal(instance.snapshot().locations.length, 0, 'Locations follow the current California day');
  assert.equal(instance.snapshot().total, 46);
  storage.db.close();
});

test('Only real document requests count; statistics, feeds, bots and missing pages do not', async () => {
  const storage = sqliteStorage();
  const instance = new VisitorCounter({ storage }, {});
  const pending = [];
  let status = 200;
  const env = {
    VISITORS: { idFromName: value => value, get: () => ({ fetch: request => instance.fetch(request) }) },
    ASSETS: { fetch: async request => new Response('page', { status, headers: { 'Content-Type': new URL(request.url).pathname.endsWith('.xml') ? 'application/rss+xml' : 'text/html' } }) },
  };
  const ctx = { waitUntil: task => pending.push(task) };
  async function request(path, ip, headers = {}, method = 'GET') {
    return worker.fetch(new Request('https://soloprimus.com' + path, { method, headers: { 'CF-Connecting-IP': ip, 'Accept': 'text/html', 'User-Agent': 'Mozilla/5.0 browser', ...headers } }), env, ctx);
  }
  await request('/', '203.0.113.1');
  await request('/zh/', '203.0.113.1');
  await request('/about/', '203.0.113.2');
  await request('/feed.xml', '203.0.113.3');
  await request('/', '203.0.113.4', { 'User-Agent': 'Googlebot' });
  await request('/', '203.0.113.5', { 'Sec-Fetch-Dest': 'iframe' });
  await request('/', '203.0.113.6', {}, 'HEAD');
  status = 404;
  await request('/missing', '203.0.113.7');
  await Promise.all(pending);
  assert.equal(instance.snapshot().today, 2);
  assert.equal(instance.snapshot().total, 2);
  const stats = await request('/api/visitors', '203.0.113.8');
  assert.equal((await stats.json()).total, 2);
  assert.equal(stats.headers.get('Cache-Control'), 'no-store');
  assert.equal((await request('/api/visitors', '203.0.113.8', {}, 'POST')).status, 405);
  assert.equal((await request('/api/missing', '203.0.113.8')).status, 404);
  const unavailable = await worker.fetch(new Request('https://soloprimus.com/api/visitors'), {}, ctx);
  assert.equal(unavailable.status, 503);
  storage.db.close();
});
