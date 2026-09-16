/**
 * End-to-end tests: build the CLI with tsc, then execute the BUILT dist/index.js
 * with node in an os.tmpdir() sandbox — exactly how npm runs it.
 */
import { execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const exec = promisify(execFile);

const PKG_DIR = fileURLToPath(new URL('..', import.meta.url));
const REPO_ROOT = path.resolve(PKG_DIR, '..', '..');
const TSC = path.join(REPO_ROOT, 'node_modules', 'typescript', 'lib', 'tsc.js');
const CLI = path.join(PKG_DIR, 'dist', 'index.js');

/** The npm scope the packages currently live under — read it, don't hardcode it. */
const SCOPE = (
  JSON.parse(
    readFileSync(path.join(PKG_DIR, '..', 'core', 'package.json'), 'utf8')
  ) as { name: string }
).name.split('/')[0] as string;

/** The scaffolder pins generated deps to `^<its own version>`; follow it, don't hardcode. */
const DEP_RANGE = `^${
  (JSON.parse(readFileSync(path.join(PKG_DIR, 'package.json'), 'utf8')) as { version: string })
    .version
}`;

let sandbox: string;

beforeAll(async () => {
  await exec(process.execPath, [TSC, '-b', PKG_DIR]);
  sandbox = await mkdtemp(path.join(os.tmpdir(), 'create-wappa-agent-e2e-'));
}, 120_000);

afterAll(async () => {
  await rm(sandbox, { recursive: true, force: true });
});

/** Run the built CLI with `args`, resolving with exit code + output. */
async function runCli(
  args: string[],
  cwd: string
): Promise<{ code: number; stdout: string; stderr: string }> {
  try {
    const { stdout, stderr } = await exec(process.execPath, [CLI, ...args], { cwd });
    return { code: 0, stdout, stderr };
  } catch (err) {
    const e = err as { code?: number; stdout?: string; stderr?: string };
    return { code: e.code ?? -1, stdout: e.stdout ?? '', stderr: e.stderr ?? '' };
  }
}

/**
 * Typecheck a generated project against the REAL workspace packages by
 * symlinking them into its node_modules — proves the starter code compiles.
 */
async function typecheck(dir: string, framDeps: string[]): Promise<void> {
  await mkdir(path.join(dir, 'node_modules', SCOPE), { recursive: true });
  await mkdir(path.join(dir, 'node_modules', '@types'), { recursive: true });
  for (const dep of framDeps) {
    await symlink(
      path.join(REPO_ROOT, 'packages', dep),
      path.join(dir, 'node_modules', SCOPE, dep)
    );
  }
  await symlink(
    path.join(REPO_ROOT, 'node_modules', '@types', 'node'),
    path.join(dir, 'node_modules', '@types', 'node')
  );
  await exec(process.execPath, [TSC, '-p', dir, '--noEmit']);
}

describe('built CLI', () => {
  it('dist/index.js starts with the node shebang', async () => {
    const built = await readFile(CLI, 'utf8');
    expect(built.startsWith('#!/usr/bin/env node\n')).toBe(true);
  });

  it(
    'scaffolds baileys + anthropic with flags and --yes',
    async () => {
      const { code, stdout } = await runCli(
        ['my-bot', '--transport', 'baileys', '--provider', 'anthropic', '--yes'],
        sandbox
      );
      expect(code).toBe(0);
      expect(stdout).toContain('npm install');
      expect(stdout).toContain('cd my-bot');

      const dir = path.join(sandbox, 'my-bot');
      const pkg = JSON.parse(await readFile(path.join(dir, 'package.json'), 'utf8')) as {
        name: string;
        dependencies: Record<string, string>;
      };
      expect(pkg.name).toBe('my-bot');
      expect(pkg.dependencies).toEqual({
        '@wappajs/core': DEP_RANGE,
        '@wappajs/baileys': DEP_RANGE,
        '@wappajs/anthropic': DEP_RANGE,
      });

      const index = await readFile(path.join(dir, 'src', 'index.ts'), 'utf8');
      expect(index).toContain('BaileysTransport');
      expect(index).toContain('AnthropicProvider');
      expect(index).toContain('new Bot(');

      const env = await readFile(path.join(dir, '.env.example'), 'utf8');
      expect(env).toContain('ANTHROPIC_API_KEY=');
      expect(env).not.toContain('WHATSAPP_ACCESS_TOKEN');

      const readme = await readFile(path.join(dir, 'README.md'), 'utf8');
      expect(readme).toMatch(/Terms of Service/);

      await typecheck(dir, ['core', 'baileys', 'anthropic']);
    },
    120_000
  );

  it(
    'scaffolds cloud-api + openai with flags and --yes',
    async () => {
      const { code } = await runCli(
        ['cloud-bot', '--transport', 'cloud-api', '--provider', 'openai', '--yes'],
        sandbox
      );
      expect(code).toBe(0);

      const dir = path.join(sandbox, 'cloud-bot');
      const pkg = JSON.parse(await readFile(path.join(dir, 'package.json'), 'utf8')) as {
        dependencies: Record<string, string>;
      };
      expect(pkg.dependencies).toEqual({
        '@wappajs/core': DEP_RANGE,
        '@wappajs/cloud-api': DEP_RANGE,
        '@wappajs/openai': DEP_RANGE,
      });

      const index = await readFile(path.join(dir, 'src', 'index.ts'), 'utf8');
      expect(index).toContain('CloudApiTransport');
      expect(index).toContain('OpenAIProvider');

      const env = await readFile(path.join(dir, '.env.example'), 'utf8');
      expect(env).toContain('OPENAI_API_KEY=');
      expect(env).toContain('WHATSAPP_ACCESS_TOKEN=');
      expect(env).toContain('WHATSAPP_PHONE_NUMBER_ID=');
      expect(env).toContain('WHATSAPP_VERIFY_TOKEN=');

      const readme = await readFile(path.join(dir, 'README.md'), 'utf8');
      expect(readme).toMatch(/webhook/i);

      await typecheck(dir, ['core', 'cloud-api', 'openai']);
    },
    120_000
  );

  it(
    'scaffolds twilio + anthropic with flags and --yes',
    async () => {
      const { code, stdout } = await runCli(
        ['twilio-bot', '--transport', 'twilio', '--provider', 'anthropic', '--yes'],
        sandbox
      );
      expect(code).toBe(0);
      expect(stdout).toContain('sandbox');

      const dir = path.join(sandbox, 'twilio-bot');
      const pkg = JSON.parse(await readFile(path.join(dir, 'package.json'), 'utf8')) as {
        dependencies: Record<string, string>;
      };
      expect(pkg.dependencies).toEqual({
        '@wappajs/core': DEP_RANGE,
        '@wappajs/twilio': DEP_RANGE,
        '@wappajs/anthropic': DEP_RANGE,
      });

      const index = await readFile(path.join(dir, 'src', 'index.ts'), 'utf8');
      expect(index).toContain('TwilioTransport');
      expect(index).toContain('AnthropicProvider');

      const env = await readFile(path.join(dir, '.env.example'), 'utf8');
      expect(env).toContain('TWILIO_ACCOUNT_SID=');
      expect(env).toContain('TWILIO_AUTH_TOKEN=');
      expect(env).toContain('TWILIO_WHATSAPP_NUMBER=');
      expect(env).toContain('PORT=');
      expect(env).toContain('ANTHROPIC_API_KEY=');

      const readme = await readFile(path.join(dir, 'README.md'), 'utf8');
      expect(readme).toMatch(/sandbox/i);
      expect(readme).toMatch(/join/i);
      expect(readme).toMatch(/ngrok/i);

      await typecheck(dir, ['core', 'twilio', 'anthropic']);
    },
    120_000
  );

  it(
    'scaffolds twilio + openai with flags and --yes',
    async () => {
      const { code } = await runCli(
        ['twilio-openai-bot', '--transport', 'twilio', '--provider', 'openai', '--yes'],
        sandbox
      );
      expect(code).toBe(0);

      const dir = path.join(sandbox, 'twilio-openai-bot');
      const index = await readFile(path.join(dir, 'src', 'index.ts'), 'utf8');
      expect(index).toContain('TwilioTransport');
      expect(index).toContain('OpenAIProvider');

      await typecheck(dir, ['core', 'twilio', 'openai']);
    },
    120_000
  );

  it('defaults transport and provider under bare --yes', async () => {
    const { code } = await runCli(['defaults-bot', '--yes'], sandbox);
    expect(code).toBe(0);
    const pkg = JSON.parse(
      await readFile(path.join(sandbox, 'defaults-bot', 'package.json'), 'utf8')
    ) as { dependencies: Record<string, string> };
    expect(Object.keys(pkg.dependencies).sort()).toEqual([
      '@wappajs/anthropic',
      '@wappajs/baileys',
      '@wappajs/core',
    ]);
  });

  it('refuses to scaffold into a non-empty directory', async () => {
    const dir = path.join(sandbox, 'taken');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'existing.txt'), 'hello', 'utf8');

    const { code, stderr } = await runCli(
      ['taken', '--transport', 'baileys', '--provider', 'anthropic', '--yes'],
      sandbox
    );
    expect(code).toBe(1);
    expect(stderr).toMatch(/not empty/);
    expect(await readFile(path.join(dir, 'existing.txt'), 'utf8')).toBe('hello');
  });

  it('rejects an invalid --transport with usage on stderr', async () => {
    const { code, stderr } = await runCli(['x', '--transport', 'sms', '--yes'], sandbox);
    expect(code).toBe(1);
    expect(stderr).toMatch(/baileys, cloud-api, twilio/);
    expect(stderr).toContain('Usage:');
  });

  it('answers interactive prompts fed through stdin', async () => {
    const child = execFile(process.execPath, [CLI], { cwd: sandbox });
    child.stdin?.end('prompted-bot\n2\n2\n');
    const { code } = await new Promise<{ code: number }>((resolve) => {
      child.on('close', (c) => resolve({ code: c ?? -1 }));
    });
    expect(code).toBe(0);
    const pkg = JSON.parse(
      await readFile(path.join(sandbox, 'prompted-bot', 'package.json'), 'utf8')
    ) as { dependencies: Record<string, string> };
    expect(pkg.dependencies['@wappajs/cloud-api']).toBe(DEP_RANGE);
    expect(pkg.dependencies['@wappajs/openai']).toBe(DEP_RANGE);
  });

  it('prints help with --help', async () => {
    const { code, stdout } = await runCli(['--help'], sandbox);
    expect(code).toBe(0);
    expect(stdout).toContain('Usage:');
    expect(stdout).toContain('--transport');
    expect(stdout).toContain('baileys|cloud-api|twilio');
  });
});
