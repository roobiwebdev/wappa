#!/usr/bin/env node
/**
 * Publish every wappa package to npm, in dependency order so that a consumer installing
 * mid-release never resolves a package whose `@wappajs/*` dependency is not on the registry
 * yet. Pass --dry-run to rehearse without publishing.
 *
 *   node scripts/release.mjs [--dry-run] [--tag next]
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// Dependency order: core first, then the adapters that depend on it, then the scaffolder.
const ORDER = [
  'core',
  'baileys',
  'cloud-api',
  'twilio',
  'anthropic',
  'openai',
  'create-wappa-agent',
];

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const tagIndex = argv.indexOf('--tag');
const tag = tagIndex === -1 ? undefined : argv[tagIndex + 1];

const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { stdio: 'inherit', ...opts });

const versions = new Set(
  ORDER.map((d) => JSON.parse(readFileSync(`packages/${d}/package.json`, 'utf8')).version),
);
if (versions.size !== 1) {
  console.error(`package versions are out of sync: ${[...versions].join(', ')}`);
  console.error('run `node scripts/version.mjs <x.y.z>` first');
  process.exit(1);
}
const [version] = versions;

const dirty = execFileSync('git', ['status', '--porcelain']).toString().trim();
if (dirty && !dryRun) {
  console.error('working tree is dirty — commit before releasing:\n' + dirty);
  process.exit(1);
}

console.log(`\n=== building and testing v${version} ===`);
run('npm', ['run', 'build']);
run('npm', ['test']);

for (const dir of ORDER) {
  const { name } = JSON.parse(readFileSync(`packages/${dir}/package.json`, 'utf8'));
  console.log(`\n=== publishing ${name}@${version} ===`);
  const args = ['publish', '--access', 'public'];
  if (tag) args.push('--tag', tag);
  if (dryRun) args.push('--dry-run');
  run('npm', args, { cwd: `packages/${dir}` });
}

console.log(`\nDone. ${dryRun ? 'Dry run — nothing was published.' : `Published v${version}.`}`);
if (!dryRun) console.log(`Next: git tag v${version} && git push --tags`);
