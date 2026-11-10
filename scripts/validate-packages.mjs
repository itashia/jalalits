import { access, readFile, readdir } from 'node:fs/promises';

const packagesDirectory = new URL('../packages/', import.meta.url);
const entries = await readdir(packagesDirectory, { withFileTypes: true });
const packages = [];

for (const entry of entries) {
  if (!entry.isDirectory()) continue;
  const directory = new URL(`../packages/${entry.name}/`, import.meta.url);
  const packageJson = JSON.parse(await readFile(new URL('package.json', directory), 'utf8'));
  packages.push({ directory, packageJson });
  if (packageJson.name !== 'jalalits' && !packageJson.name.startsWith('@jalalits/')) {
    throw new Error(`${packageJson.name} must use the jalalits package identity.`);
  }
  if (packageJson.private) throw new Error(`${packageJson.name} should be a publishable package.`);
  if (packageJson.type !== 'module') throw new Error(`${packageJson.name} must be ESM-first.`);
  if (packageJson.sideEffects !== false)
    throw new Error(`${packageJson.name} must declare sideEffects: false.`);
  if (
    !packageJson.exports?.['.']?.import?.types ||
    !packageJson.exports?.['.']?.import?.default ||
    !packageJson.exports?.['.']?.require?.types ||
    !packageJson.exports?.['.']?.require?.default
  ) {
    throw new Error(`${packageJson.name} must expose ESM, CommonJS, and declaration entry points.`);
  }
  if (
    packageJson.files?.includes('tests') ||
    packageJson.files?.includes('src') ||
    packageJson.files?.includes('fixtures')
  ) {
    throw new Error(`${packageJson.name} must not publish source, tests, or fixtures.`);
  }
  if (
    packageJson.dependencies &&
    Object.keys(packageJson.dependencies).length > 0 &&
    packageJson.name === 'jalalits'
  ) {
    throw new Error('The core package must remain free of runtime dependencies.');
  }
  for (const field of ['dependencies', 'peerDependencies']) {
    for (const [dependency, version] of Object.entries(packageJson[field] ?? {})) {
      if (String(version).startsWith('workspace:') && field === 'peerDependencies') {
        throw new Error(
          `${packageJson.name} has an unpublished workspace protocol peer for ${dependency}.`,
        );
      }
    }
  }
  for (const entrypoint of [
    packageJson.exports['.'].import.types,
    packageJson.exports['.'].import.default,
    packageJson.exports['.'].require.types,
    packageJson.exports['.'].require.default,
  ]) {
    await access(new URL(entrypoint.replace('./', ''), directory));
  }
  for (const file of ['README.md', 'LICENSE']) await access(new URL(file, directory));
}

const names = new Set(packages.map(({ packageJson }) => packageJson.name));
if (!names.has('jalalits')) throw new Error('The core package must be named jalalits.');
for (const { packageJson } of packages) {
  for (const dependency of Object.keys(packageJson.dependencies ?? {})) {
    if (names.has(dependency) && dependency !== 'jalalits') {
      throw new Error(
        `${packageJson.name} has an unsupported package dependency on ${dependency}.`,
      );
    }
  }
}
console.log(
  `Validated ${packages.length} package export maps, published files, and dependency boundaries.`,
);
