# create-wappa-agent

Project scaffolder for [wappa](https://github.com/sifenfisaha/wappajs), the TypeScript
framework for building WhatsApp agents.

```bash
npm create wappa-agent my-bot
```

It asks which transport (Baileys / Cloud API / Twilio) and which LLM provider (Anthropic /
OpenAI) you want, then writes a ready-to-run TypeScript project: `package.json` with the
matching `@wappajs/*` dependencies pinned to this release, `tsconfig.json`, a starter
`src/index.ts`, `.env.example`, and a `.gitignore`.

```bash
cd my-bot
npm install
cp .env.example .env   # add your API keys
npm run build
npm start
```

Non-interactive use:

```bash
npm create wappa-agent my-bot -- --transport baileys --provider anthropic
```

Full documentation: https://github.com/sifenfisaha/wappajs

## License

MIT
