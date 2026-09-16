# Releasing

All wappa packages are released together, at one shared version. This is not optional:
`create-wappa-agent` pins the dependencies it scaffolds to `^<its own version>`, so a
release where the versions drift apart scaffolds projects that cannot install.

## One-time setup

1. Sign in:

   ```bash
   npm login
   ```

2. Create the npm organization matching the scope in `packages/*/package.json` (currently
   **`@wappajs`**) at https://www.npmjs.com/org/create, and pick the **free** tier, which
   publishes unlimited *public* packages. Every package sets
   `publishConfig.access = "public"`, so nothing is published privately by accident.

   npm only tells you whether an org name is free when you try to create it. If
   `wappajs` is taken, pick another and move the whole repo over in one command:

   ```bash
   node scripts/rename-scope.mjs <new-scope>   # package names, deps, imports, docs, templates
   npm install && npm run build && npm test
   ```

   Candidates with no public packages as of the last check: `wappajs`, `wappadev`,
   `usewappa`, `wappakit`, `getwappa`, `wappaai`.

3. If your account has 2FA set to "Authorization and writes" (recommended), keep your
   authenticator handy, npm prompts for an OTP on every publish.

## Cleaning up the abandoned unscoped release

An earlier partial release published `wappa-baileys`, `wappa-cloud-api` and
`wappa-anthropic` at `0.1.0` as unscoped packages. They are broken: each depends on
`wappa@^0.1.0`, a core package that was never published, so `npm install wappa-baileys`
fails with a 404. Point people at the scoped packages instead:

```bash
npm deprecate wappa-baileys@0.1.0   "Moved to @wappajs/baileys"
npm deprecate wappa-cloud-api@0.1.0 "Moved to @wappajs/cloud-api"
npm deprecate wappa-anthropic@0.1.0 "Moved to @wappajs/anthropic"
```

Deprecating leaves them installable but prints the message, which is preferable to unpublishing,
which npm only allows within 72 hours of publishing.

## Cutting a release

```bash
node scripts/version.mjs 0.1.1     # sets every package + internal ^ranges in lockstep
npm run release:dry                # build, test, and rehearse every publish
git commit -am "release: v0.1.1"
npm run release                    # build, test, publish core -> adapters -> scaffolder
git tag v0.1.1 && git push && git push --tags
```

`scripts/release.mjs` refuses to run if the package versions are out of sync or the
working tree is dirty, and publishes in dependency order (`core` first) so that someone
installing mid-release never resolves an adapter whose `@wappajs/core` range is not on the
registry yet.

To publish a prerelease without moving the `latest` tag:

```bash
node scripts/version.mjs 0.2.0-beta.0
node scripts/release.mjs --tag next
```

## Verifying a release

```bash
npm view @wappajs/core version
npm create wappa-agent smoke-test -- --transport baileys --provider anthropic --yes
cd smoke-test && npm install && npm run build
```

## Unpublishing

npm only allows unpublishing within 72 hours of publishing, and a version number can
never be reused. Prefer publishing a patch over unpublishing.

```bash
npm deprecate @wappajs/core@0.1.1 "Broken release, use 0.1.2"
```
