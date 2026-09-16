# Getting started

wappa is a set of npm packages (ESM-only, Node >= 20). The normal way to use it is to
install them from npm.

## Fastest path — scaffold a project

```bash
npm create wappa-agent my-bot -- --transport baileys --provider anthropic
cd my-bot
npm install
cp .env.example .env   # add your API keys
npm run build
npm start
```

## Install into an existing project

Pick one transport and one provider; `@wappajs/core` is always required. Your project needs
`"type": "module"` in its `package.json` and Node >= 20.

```bash
npm install @wappajs/core @wappajs/baileys @wappajs/anthropic zod
```

| You want | Install |
| --- | --- |
| Personal number, QR login | `@wappajs/baileys` |
| Official Meta Cloud API | `@wappajs/cloud-api` |
| Twilio WhatsApp (BSP) | `@wappajs/twilio` |
| Claude | `@wappajs/anthropic` |
| GPT / any OpenAI-compatible server | `@wappajs/openai` |

```ts
// src/index.ts
import { Agent, Bot } from '@wappajs/core';
import { BaileysTransport } from '@wappajs/baileys';
import { AnthropicProvider } from '@wappajs/anthropic';

const agent = new Agent({
  instructions: 'You are a helpful assistant reachable over WhatsApp. Keep replies short.',
  provider: new AnthropicProvider(), // reads ANTHROPIC_API_KEY
});

const bot = new Bot({ transport: new BaileysTransport(), agent });
await bot.start();
```

The rest of this page covers working from a clone of the repo instead — useful when you
want to modify the framework itself.

## Working from a clone

```bash
git clone https://github.com/sifenfisaha/wappa.git
cd wappa
npm install
npm run build          # tsc -b — builds every package's dist/
npm test               # optional: vitest run, all offline
```

### Option A — build your bot inside this workspace

The lowest-friction way to experiment: add your bot as another workspace package next to
the examples (the root `package.json` declares workspaces `packages/*` and `examples/*`).

```bash
mkdir -p examples/my-bot/src
```

`examples/my-bot/package.json`:

```json
{
  "name": "my-bot",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "scripts": {
    "build": "tsc -b",
    "start": "node dist/index.js",
    "dev": "node --watch dist/index.js"
  },
  "dependencies": {
    "@wappajs/core": "^0.1.0",
    "@wappajs/baileys": "^0.1.0",
    "@wappajs/anthropic": "^0.1.0",
    "zod": "^4.5.4"
  }
}
```

`examples/my-bot/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "rootDir": "src", "outDir": "dist" },
  "include": ["src"],
  "references": [
    { "path": "../../packages/core" },
    { "path": "../../packages/baileys" },
    { "path": "../../packages/anthropic" }
  ]
}
```

`examples/my-bot/src/index.ts` — the quickstart from the [README](../README.md):

```ts
import { Agent, Bot } from '@wappajs/core';
import { BaileysTransport } from '@wappajs/baileys';
import { AnthropicProvider } from '@wappajs/anthropic';

const agent = new Agent({
  instructions: 'You are a helpful assistant reachable over WhatsApp. Keep replies short.',
  provider: new AnthropicProvider(),
});

const bot = new Bot({ transport: new BaileysTransport(), agent });
await bot.start();
```

Then, from the repo root:

```bash
npm install                     # links the workspace deps
npx tsc -b examples/my-bot      # builds my-bot and (via references) the packages it uses
export ANTHROPIC_API_KEY=sk-ant-...
node examples/my-bot/dist/index.js
```

(`npm run build` builds the projects listed in the root `tsconfig.json`; add
`{ "path": "examples/my-bot" }` to its `references` if you want your bot included.)

Scan the QR code that appears in the terminal with WhatsApp on your phone
(Settings → Linked devices → Link a device) and message the linked number.

### Option B — `npm pack` tarballs into your own project

Build once, pack the packages you need, and install the tarballs into any project:

```bash
# in the wappa repo
npm run build
npm pack -w packages/core -w packages/baileys -w packages/anthropic --pack-destination ..
```

This produces `wappa-core-0.1.0.tgz`, `wappa-baileys-0.1.0.tgz` and
`wappa-anthropic-0.1.0.tgz` one directory up. In your project, install them **in one
command** so npm resolves the `@wappajs/core@^0.1.0` dependency of the adapters against the
local core tarball instead of the registry:

```bash
# in your project
npm install ../wappa-core-0.1.0.tgz ../wappa-baileys-0.1.0.tgz ../wappa-anthropic-0.1.0.tgz zod
```

Swap in `-w packages/cloud-api` / `-w packages/twilio` / `-w packages/openai` (and the
matching tarballs) for the transport + provider combination you want. Your project needs
`"type": "module"` and Node >= 20.

### Option C — publish your own fork

The packages are plain, publishable npm packages. To release them under your own scope,
rename them in each `packages/*/package.json` (and update the matching `@wappajs/*`
dependency ranges and imports), then follow [RELEASING.md](../RELEASING.md).

## The scaffolder

`create-wappa-agent` scaffolds a ready project — interactive prompts, or fully
non-interactive with flags:

```bash
npm create wappa-agent my-bot -- --transport baileys --provider anthropic --yes
```

It generates `package.json`, `tsconfig.json`, a wired `src/index.ts`, `.env.example` and
a README; it does not run `npm install` for you.

## Environment variables

| Variable | Used by |
| --- | --- |
| `ANTHROPIC_API_KEY` | `AnthropicProvider` (SDK default when `apiKey` not passed) |
| `OPENAI_API_KEY` | `OpenAIProvider` (SDK default when `apiKey` not passed) |
| `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET` | your Cloud API bot config — see [transports/cloud-api.md](transports/cloud-api.md) |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`, `TWILIO_WEBHOOK_URL` | your Twilio bot config — see [transports/twilio.md](transports/twilio.md) |

## Where next

- [Concepts](concepts.md) — how the Bot pipeline and Agent loop actually work
- [Baileys transport](transports/baileys.md) — QR login, auth persistence, reconnects, ToS caveats
- [Cloud API transport](transports/cloud-api.md) — full Meta dashboard walkthrough
- [Twilio transport](transports/twilio.md) — sandbox quickstart, webhook setup, capability table
- [Testing](testing.md) — test your bot offline before pointing it at real WhatsApp
