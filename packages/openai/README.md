# @wappajs/openai

OpenAI provider for [wappa](https://github.com/sifenfisaha/wappa) WhatsApp agents — and for
any **OpenAI-compatible** server (Ollama, vLLM, OpenRouter, Together, LM Studio) via
`baseURL`.

```bash
npm install @wappajs/core @wappajs/openai
```

```ts
import { Agent } from '@wappajs/core';
import { OpenAIProvider } from '@wappajs/openai';

const agent = new Agent({
  instructions: 'You are a helpful WhatsApp assistant.',
  provider: new OpenAIProvider(), // reads OPENAI_API_KEY from the environment
});
```

Point it at a local model instead:

```ts
new OpenAIProvider({
  baseURL: 'http://localhost:11434/v1',
  apiKey: 'ollama',
  model: 'llama3.1',
});
```

The default model is `gpt-5`. `toOpenAIMessages`, `toOpenAITools` and `fromOpenAIResponse`
are exported for tests and custom mapping.

Docs: https://github.com/sifenfisaha/wappa/blob/main/docs/providers.md

## License

MIT
