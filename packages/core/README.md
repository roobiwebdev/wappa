# @wappajs/core

Transport-agnostic core of [wappa](https://github.com/sifenfisaha/wappajs) — a TypeScript
framework for building WhatsApp agents. This package never imports a WhatsApp library: it
speaks a normalized message model, owns the LLM tool-call loop, and lets you plug in a
transport and a provider.

```bash
npm install @wappajs/core
```

```ts
import { Agent, Bot, defineTool } from '@wappajs/core';
import { z } from 'zod';

const agent = new Agent({
  instructions: 'You are a helpful assistant reachable over WhatsApp. Keep replies short.',
  provider: myProvider, // @wappajs/anthropic or @wappajs/openai
  tools: [
    defineTool({
      name: 'get_time',
      description: 'Get the current date and time.',
      parameters: z.object({}),
      execute: () => new Date().toString(),
    }),
  ],
});

const bot = new Bot({ transport: myTransport, agent });
await bot.start();
```

## What's in here

- `Bot` — per-chat message queues, middleware chain (`use`, `command`, `hears`), graceful shutdown
- `Agent` — the tool-call loop, history window, error rollback, `maxTurns` cap
- `defineTool` — typed tools whose arguments are inferred and validated with zod
- Sessions — per-chat conversation history and durable data (in-memory and file-backed stores)
- `Transport` / `Provider` interfaces — the contracts adapter packages implement

## Testing

`@wappajs/core/testing` ships `MockTransport` and `ScriptedProvider`, so a whole bot can be
unit-tested offline — no WhatsApp connection, no LLM key.

```ts
import { MockTransport, ScriptedProvider } from '@wappajs/core/testing';
```

## Ecosystem

Transports: [`@wappajs/baileys`](https://www.npmjs.com/package/@wappajs/baileys),
[`@wappajs/cloud-api`](https://www.npmjs.com/package/@wappajs/cloud-api),
[`@wappajs/twilio`](https://www.npmjs.com/package/@wappajs/twilio).
Providers: [`@wappajs/anthropic`](https://www.npmjs.com/package/@wappajs/anthropic),
[`@wappajs/openai`](https://www.npmjs.com/package/@wappajs/openai).
Scaffolder: `npm create wappa-agent my-bot`.

Full documentation: https://github.com/sifenfisaha/wappajs

## License

MIT
