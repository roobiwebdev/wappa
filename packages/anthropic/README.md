# @wappajs/anthropic

Anthropic (Claude) provider for [wappa](https://github.com/sifenfisaha/wappa) WhatsApp
agents. Maps one wappa `generate()` call onto the Anthropic Messages API, including
tool-calling.

```bash
npm install @wappajs/core @wappajs/anthropic
```

```ts
import { Agent } from '@wappajs/core';
import { AnthropicProvider } from '@wappajs/anthropic';

const agent = new Agent({
  instructions: 'You are a helpful WhatsApp assistant.',
  provider: new AnthropicProvider(), // reads ANTHROPIC_API_KEY from the environment
});
```

Pick a model or pass your own client:

```ts
new AnthropicProvider({ model: 'claude-sonnet-5', apiKey: '...', maxTokens: 1024 });
```

The default model is `claude-sonnet-5`. `AnthropicClientLike` lets you inject a stub in
tests, and the mapping helpers are exported if you need to inspect what gets sent.

Docs: https://github.com/sifenfisaha/wappa/blob/main/docs/providers.md

## License

MIT
