import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { delimiter, join, resolve } from 'node:path';
import { existsSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const temp = await mkdtemp(join(tmpdir(), 'jalalits-package-smoke-'));
const artifacts = join(temp, 'tarballs');
const consumer = join(temp, 'consumer');
const pnpmDirectory = process.env.PATH.split(delimiter).find((path) =>
  existsSync(join(path, 'pnpm')),
);
if (pnpmDirectory === undefined) throw new Error('pnpm must be available on PATH.');
const pnpmExecutable = realpathSync(join(pnpmDirectory, 'pnpm'));
const run = (command, args, options = {}) =>
  execFileSync(command, args, { cwd: root, stdio: 'inherit', ...options });

try {
  await mkdir(consumer, { recursive: true });
  const output = execFileSync(
    process.execPath,
    [
      pnpmExecutable,
      '-r',
      '--filter',
      './packages/**',
      'pack',
      '--json',
      '--pack-destination',
      artifacts,
    ],
    { cwd: root, encoding: 'utf8' },
  );
  const packed = JSON.parse(output);
  const rootPackage = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  const packageByName = new Map(packed.map((pkg) => [pkg.name, pkg]));
  const expected = [
    'jalalits',
    '@jalalits/api',
    '@jalalits/react',
    '@jalalits/temporal',
    '@jalalits/zod',
  ];
  if (expected.some((name) => !packageByName.has(name))) {
    throw new Error('One or more public JalaliTS packages were missing from the packed workspace.');
  }

  const dependencies = Object.fromEntries(
    expected.map((name) => [name, `file:${packageByName.get(name).filename}`]),
  );
  for (const name of ['react', 'zod', '@js-temporal/polyfill']) {
    dependencies[name] = rootPackage.devDependencies[name];
  }
  await writeFile(
    join(consumer, 'package.json'),
    JSON.stringify(
      {
        name: 'jalalits-package-smoke-consumer',
        version: '1.0.0',
        private: true,
        type: 'module',
        dependencies,
        pnpm: { overrides: { jalalits: `file:${packageByName.get('jalalits').filename}` } },
      },
      null,
      2,
    ),
  );

  const storeArgs = process.env.JALALITS_PNPM_STORE_DIR
    ? ['--store-dir', process.env.JALALITS_PNPM_STORE_DIR]
    : [];
  run(process.execPath, [pnpmExecutable, 'install', '--dir', consumer, ...storeArgs]);

  await writeFile(
    join(consumer, 'esm-smoke.mjs'),
    `import assert from 'node:assert/strict';
import { jalali, JalaliDateTime } from 'jalalits';
import { parseRequestDate } from '@jalalits/api';
import { useJalaliDate } from '@jalalits/react';
import { fromTemporalInstant, toTemporalInstant } from '@jalalits/temporal';
import { zJalaliDate } from '@jalalits/zod';
import { Temporal } from '@js-temporal/polyfill';
const date = JalaliDateTime.parse('1405/08/19');
assert.equal(date.format(), '1405/08/19');
assert.equal(jalali('1405/08/19').format(), '1405/08/19');
assert.equal(parseRequestDate('1405/08/19').day, 19);
assert.equal(zJalaliDate().parse('1405/08/19').day, 19);
assert.equal(typeof useJalaliDate, 'function');
const instant = Temporal.Instant.from('2026-11-10T12:30:45.123456789Z');
assert.equal(toTemporalInstant(fromTemporalInstant(instant), Temporal).epochNanoseconds, instant.epochNanoseconds);
`,
  );
  await writeFile(
    join(consumer, 'cjs-smoke.cjs'),
    `const assert = require('node:assert/strict');
const core = require('jalalits');
const api = require('@jalalits/api');
const react = require('@jalalits/react');
const temporal = require('@jalalits/temporal');
const zod = require('@jalalits/zod');
assert.equal(core.JalaliDateTime.parse('1405/08/19').day, 19);
assert.equal(core.jalali('1405/08/19').day, 19);
assert.equal(api.parseRequestDate('1405/08/19').day, 19);
assert.equal(zod.zJalaliDate().parse('1405/08/19').day, 19);
assert.equal(typeof react.useJalaliDate, 'function');
assert.equal(typeof temporal.fromTemporalInstant, 'function');
`,
  );
  await writeFile(
    join(consumer, 'types-smoke.ts'),
    `import { jalali, JalaliDateTime } from 'jalalits';
import { parseRequestDate } from '@jalalits/api';
import { useJalaliCalendar } from '@jalalits/react';
import { zJalaliDate } from '@jalalits/zod';
const inferred: JalaliDateTime = zJalaliDate().parse('1405/08/19');
const fromFactory: JalaliDateTime = jalali('1405/08/19');
const fromRequest: JalaliDateTime = parseRequestDate('1405/08/19');
void useJalaliCalendar({ year: fromFactory.year, month: fromFactory.month }).weeks;
void fromRequest;
`,
  );
  run(process.execPath, [join(consumer, 'esm-smoke.mjs')], { cwd: consumer });
  run(process.execPath, [join(consumer, 'cjs-smoke.cjs')], { cwd: consumer });
  run(
    process.execPath,
    [
      join(root, 'node_modules/typescript/lib/tsc.js'),
      '--noEmit',
      '--strict',
      '--skipLibCheck',
      '--target',
      'ES2022',
      '--module',
      'NodeNext',
      '--moduleResolution',
      'NodeNext',
      'types-smoke.ts',
    ],
    { cwd: consumer },
  );
  console.log(
    `Packed install, ESM, CommonJS, and declaration smoke checks passed for ${expected.length} packages.`,
  );
} finally {
  await rm(temp, { recursive: true, force: true });
}
