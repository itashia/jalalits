import { stat, readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { cpus, platform, arch } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { createRequire } from 'node:module';
import { PersianCalendar, JalaliDateTime } from '../packages/core/dist/index.mjs';
import * as jalaali from 'jalaali-js';
import dayjs from 'dayjs';
import jalaliday from 'jalaliday';

dayjs.extend(jalaliday);
const require = createRequire(import.meta.url);
const iterations = Number(process.argv[2] ?? 30_000);
const batches = 5;
const warmup = 5_000;
const date = JalaliDateTime.create({ year: 1405, month: 8, day: 19, hour: 12 });
const dayjsDate = dayjs('2026-11-10T12:00:00Z').calendar('jalali');
let sink = 0;

async function versionOf(moduleName) {
  let current = dirname(fileURLToPath(import.meta.resolve(moduleName)));
  for (;;) {
    try {
      const metadata = JSON.parse(await readFile(join(current, 'package.json'), 'utf8'));
      if (metadata.name === moduleName) return metadata.version;
    } catch {
      /* Continue up from the module entry to its package root. */
    }
    const parent = dirname(current);
    if (parent === current) return 'unknown';
    current = parent;
  }
}

async function measure(name, operation) {
  for (let index = 0; index < warmup; index++) operation();
  const samples = [];
  const memoryBefore = process.memoryUsage().heapUsed;
  for (let batch = 0; batch < batches; batch++) {
    const start = performance.now();
    for (let index = 0; index < iterations; index++) operation();
    samples.push(performance.now() - start);
  }
  const memoryAfter = process.memoryUsage().heapUsed;
  const medianMs = samples.toSorted((a, b) => a - b)[Math.floor(samples.length / 2)];
  return {
    name,
    iterationsPerBatch: iterations,
    batches,
    medianMs: Number(medianMs.toFixed(2)),
    operationsPerSecond: Math.round((iterations / medianMs) * 1000),
    heapDeltaBytes: memoryAfter - memoryBefore,
  };
}

const cases = [
  [
    'JalaliTS conversion: Gregorian → Jalali',
    () => {
      sink += PersianCalendar.fromGregorian({ year: 2026, month: 11, day: 10 }).day;
    },
  ],
  [
    'jalaali-js conversion: Gregorian → Jalali',
    () => {
      sink += jalaali.toJalaali(2026, 11, 10).jy;
    },
  ],
  [
    'JalaliTS strict date parsing',
    () => {
      sink += JalaliDateTime.parse('1405/08/19').day;
    },
  ],
  [
    'Day.js + Jalaliday parse/calendar selection',
    () => {
      sink += dayjs('2026-11-10').calendar('jalali').date();
    },
  ],
  [
    'JalaliTS formatting',
    () => {
      sink += date.format('Y/m/d').length;
    },
  ],
  [
    'Day.js + Jalaliday formatting',
    () => {
      sink += dayjsDate.format('YYYY/MM/DD').length;
    },
  ],
  [
    'JalaliTS month arithmetic',
    () => {
      sink += date.addMonths(1).day;
    },
  ],
  [
    'Day.js + Jalaliday month arithmetic',
    () => {
      sink += dayjsDate.add(1, 'month').date();
    },
  ],
  [
    'JalaliTS object creation',
    () => {
      sink += JalaliDateTime.create({ year: 1405, month: 8, day: 19 }).day;
    },
  ],
];
const results = [];
for (const [name, operation] of cases) results.push(await measure(name, operation));

const bundleSizes = {};
for (const packageName of ['core', 'api', 'react', 'temporal', 'zod']) {
  const entry = new URL(`../packages/${packageName}/dist/index.mjs`, import.meta.url);
  const content = await readFile(entry);
  bundleSizes[packageName] = {
    bytes: (await stat(entry)).size,
    gzipBytes: gzipSync(content).byteLength,
  };
}
const info = {
  environment: {
    node: process.version,
    platform,
    arch,
    cpu: cpus()[0]?.model,
    iterations,
    batches,
    warmupPerCase: warmup,
  },
  dependencies: {
    'jalaali-js': await versionOf('jalaali-js'),
    dayjs: await versionOf('dayjs'),
    jalaliday: await versionOf('jalaliday'),
  },
  bundleSizes,
  notes: [
    'Each case is warmed and measured sequentially; output is consumed to prevent dead-code elimination.',
    'Implementations have different validation and semantics; results are indicative, not a strict apples-to-apples ranking.',
    'Heap deltas are observational and are not a stable allocation benchmark.',
  ],
  results,
  sink,
};
console.log(JSON.stringify(info, null, 2));
