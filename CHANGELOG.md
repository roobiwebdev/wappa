# Changelog

All notable changes to this project are documented here. The packages are versioned
together: every release publishes all seven at the same version, because
`create-wappa-agent` pins the dependencies it scaffolds to its own version.

## 0.1.1 (2026-09-16)

First public release. All packages are published under the `@wappajs` scope.

### Added

- `@wappajs/core`: transport agnostic runtime. `Bot` (per chat queues, middleware chain,
  graceful shutdown), `Agent` (tool call loop, history window, error rollback, `maxTurns`
  cap), `defineTool` with zod inferred and validated arguments, session stores (in memory
  and file backed), and the `Transport` and `Provider` interfaces.
- `@wappajs/core/testing`: `MockTransport` and `ScriptedProvider` for testing a whole bot
  offline, with no WhatsApp connection and no LLM key.
- `@wappajs/baileys`: personal number transport with QR login and persistent auth state.
- `@wappajs/cloud-api`: official Meta WhatsApp Cloud API transport. Webhook verification
  handshake, `X-Hub-Signature-256` validation, and Graph API sending, with no Meta SDK
  dependency.
- `@wappajs/twilio`: Twilio WhatsApp (BSP) transport. Form encoded webhook parsing,
  `X-Twilio-Signature` validation, and the Messages REST API, with no Twilio SDK
  dependency.
- `@wappajs/anthropic`: Claude provider, default model `claude-sonnet-5`.
- `@wappajs/openai`: OpenAI provider, default model `gpt-5`, and any OpenAI compatible
  server through `baseURL` (Ollama, vLLM, OpenRouter, LM Studio).
- `create-wappa-agent`: project scaffolder, interactive or fully flag driven.

### Notes

- Node 20 or newer. The packages are ESM only, so your project needs `"type": "module"`.
- An earlier partial release published `wappa-baileys`, `wappa-cloud-api` and
  `wappa-anthropic` as unscoped packages at 0.1.0. Those versions are broken, since they
  depend on a `wappa` core package that was never published. They are deprecated in favor
  of the `@wappajs` packages. Version 0.1.0 was skipped for the scoped release because npm
  does not allow reusing a version number.
