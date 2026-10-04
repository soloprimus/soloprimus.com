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

test('Beijing midnight and geographic quantization', () => {
  assert.equal(calendarDay(new Date('2026-10-04T15:59:59Z')), '2026-10-04');
  assert.equal(calendarDay(new Date('2026-10-04T16:00:00Z')), '2026-10-05');
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
