# @wappajs/baileys

Baileys transport for [wappa](https://github.com/sifenfisaha/wappajs) — run a WhatsApp agent
on a **personal number**, logged in by scanning a QR code. The fastest way to get an agent
answering messages; no Meta Business account required.

```bash
npm install @wappajs/core @wappajs/baileys
```

```ts
import { Agent, Bot } from '@wappajs/core';
import { BaileysTransport } from '@wappajs/baileys';

const bot = new Bot({
  transport: new BaileysTransport(),        // prints a QR code on first start
  agent: new Agent({ instructions: '...', provider: myProvider }),
});

await bot.start();
```

Auth state persists in `./wappa-auth`, so the QR scan is only needed once.

## Caveats

Baileys is an **unofficial** WhatsApp client. It is excellent for prototypes, personal
bots, and internal tools, but running one on a number you care about carries a ban risk and
is outside WhatsApp's Terms of Service. For production and commercial messaging use
[`@wappajs/cloud-api`](https://www.npmjs.com/package/@wappajs/cloud-api) (official Meta Cloud
API) or [`@wappajs/twilio`](https://www.npmjs.com/package/@wappajs/twilio).

## Options

`BaileysTransportOptions` covers the auth-state directory, logger, and reconnect behavior —
see https://github.com/sifenfisaha/wappajs/blob/main/docs/transports

## License

MIT
