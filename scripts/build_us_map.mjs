// Builds public/us-map.json: an Albers USA SVG of the states (from the US Census, via us-atlas)
// and a projector config, so the casino map needs no external map service.
import { readFileSync, writeFileSync } from 'node:fs';
import { geoAlbersUsa, geoPath } from 'd3-geo';
import { feature, mesh } from 'topojson-client';

const topo = JSON.parse(readFileSync(new URL('../node_modules/us-atlas/states-10m.json', import.meta.url)));
const W = 975, H = 610;
const projection = geoAlbersUsa().scale(1300).translate([487.5, 305]);
const path = geoPath(projection);
const round = d => d.replace(/(\d+\.\d{1})\d+/g, '$1');
const states = feature(topo, topo.objects.states).features
  .map(f => ({ id: f.id, name: f.properties.name, d: round(path(f) || '') }))
  .filter(s => s.d);
const borders = round(path(mesh(topo, topo.objects.states, (a, b) => a !== b)));
writeFileSync(new URL('../public/us-map.json', import.meta.url), JSON.stringify({ width: W, height: H, states, borders }));
console.log('states', states.length);

// Place each casino on the same projection (run after scripts/build_casinos.py).
const casinoFile = new URL('../public/casinos.json', import.meta.url);
try {
  const data = JSON.parse(readFileSync(casinoFile));
  let placed = 0;
  for (const c of data.casinos) {
    const p = projection([c.lng, c.lat]);
    if (p) { c.x = Math.round(p[0] * 10) / 10; c.y = Math.round(p[1] * 10) / 10; placed++; }
  }
  writeFileSync(casinoFile, JSON.stringify(data));
  console.log('casinos placed', placed, 'of', data.casinos.length);
} catch (e) { if (e.code !== 'ENOENT') throw e; }
