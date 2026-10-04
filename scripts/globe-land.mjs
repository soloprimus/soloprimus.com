// Generate an evenly spaced land point cloud from Natural Earth's public-domain
// 1:110m land polygons. Run: node scripts/globe-land.mjs path/to/ne_110m_land.geojson
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = process.argv[2];
if (!source) throw new Error('Supply a Natural Earth land GeoJSON file.');
const geo = JSON.parse(readFileSync(source, 'utf8').replace(/^\uFEFF/, ''));
const polygons = geo.features.flatMap(({ geometry }) => geometry.type === 'MultiPolygon' ? geometry.coordinates : [geometry.coordinates]);
const bounds = polygons.map(rings => {
  const points = rings[0];
  return { rings, west: Math.min(...points.map(p => p[0])), east: Math.max(...points.map(p => p[0])), south: Math.min(...points.map(p => p[1])), north: Math.max(...points.map(p => p[1])) };
});
function inside(lon, lat, ring) {
  let hit = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}
const points = [];
for (let lat = -86; lat <= 86; lat += 1.65) {
  const step = 1.65 / Math.cos(lat * Math.PI / 180);
  for (let lon = -180 + step / 2; lon < 180; lon += step) {
    if (bounds.some(p => lon >= p.west && lon <= p.east && lat >= p.south && lat <= p.north && inside(lon, lat, p.rings[0]) && !p.rings.slice(1).some(ring => inside(lon, lat, ring)))) {
      points.push([Number(lat.toFixed(3)), Number(lon.toFixed(3))]);
    }
  }
}
const directory = join(root, 'assets', 'data');
mkdirSync(directory, { recursive: true });
writeFileSync(join(directory, 'globe-land.json'), JSON.stringify({ source: 'Natural Earth 1:110m land, public domain', points }));
writeFileSync(join(directory, 'README.md'), '# Globe geography\n\n`globe-land.json` contains an evenly spaced land point cloud derived from Natural Earth’s public-domain 1:110m land polygons. It contains geographic coordinates only, with no visitor data.\n\n- Source: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson\n- Terms: https://www.naturalearthdata.com/about/terms-of-use/\n- Generator: `node scripts/globe-land.mjs path/to/ne_110m_land.geojson`\n');
console.log(`Generated ${points.length} land points.`);
