# Dependency Upgrade Audit - 2026-05-19

## Scope

- Workspace package manager: `pnpm@10.26.1`
- Manifests in scope:
  - `package.json`
  - `apps/api/package.json`
  - `apps/web/package.json`
- Lockfile in scope: `pnpm-lock.yaml`

## Pre-Upgrade Registry State

Command used:

```bash
corepack pnpm outdated -r --format json
```

Result captured in `/tmp/webdevstudios-upgrade/outdated.stdout.json`.

Summary:

- 77 outdated or deprecated dependency entries.
- 15 major-version upgrade entries.
- 3 deprecated direct type packages:
  - `@types/helmet`
  - `@types/ioredis`
  - `@types/winston`

Major upgrades requiring extra attention:

- `@eslint/js`: `9.39.2` -> `10.0.1`
- `@hookform/resolvers`: `3.10.0` -> `5.2.2`
- `@shikijs/rehype`: `3.20.0` -> `4.1.0`
- `@types/node`: `22.19.3` -> `25.9.0`
- `@types/nodemailer`: `7.0.4` -> `8.0.0`
- `@types/supertest`: `6.0.3` -> `7.2.0`
- `eslint`: `9.39.2` -> `10.4.0`
- `eslint-plugin-simple-import-sort`: `12.1.1` -> `13.0.0`
- `globals`: `16.5.0` -> `17.6.0`
- `lint-staged`: `16.2.7` -> `17.0.5`
- `nodemailer`: `7.0.12` -> `8.0.7`
- `recharts`: `2.15.4` -> `3.8.1`
- `shiki`: `3.20.0` -> `4.1.0`
- `typescript`: `5.9.3` -> `6.0.3`
- `lucide-react`: `0.562.0` -> `1.16.0`

## Vulnerability Scan Status

Command used:

```bash
corepack pnpm audit --json
```

Result captured in `/tmp/webdevstudios-upgrade/pnpm-audit.stdout.json`.

Pre-upgrade audit result:

- 143 advisories total
- 2 critical
- 60 high
- 66 moderate
- 15 low

Representative vulnerable transitive packages:

- `hono` `<4.11.4` / `<4.11.7`
- `lodash` / `lodash-es` `<=4.17.22`
- `undici` `<6.23.0`
- `diff` `>=4.0.0 <4.0.4`

## GitHub Vulnerability Scan Clarification

What can be verified locally:

- No `.github/dependabot.yml` or `.github/dependabot.yaml` exists in this checkout.
- No GitHub Actions workflow exists under `.github/workflows`.
- `gh auth status` reports the local `xirothedev` token is invalid, so Dependabot alert API access cannot be verified from this environment.

Interpretation before upgrading:

- GitHub Dependabot alert status is not verified as enabled or scanned.
- The repository has no checked-in Dependabot version-update config.
- The actionable vulnerability evidence currently available is the `pnpm audit` result above.
- A valid GitHub token with Dependabot alerts read permission is required to confirm open/fixed Dependabot alerts from GitHub itself.

## Context7 Migration Notes

### Next.js

Context7 source: `/vercel/next.js/v16.2.2`

Relevant notes:

- `useSearchParams` remains a Client Component hook from `next/navigation`; App Router static rendering still requires isolating it behind Suspense or passing `searchParams` from a Server Component.
- URL updates should use `URLSearchParams(searchParams.toString())` with `router.push`, `<Link>`, or `window.history.pushState`.
- `use cache` is available for caching page segments and nested component output when Cache Components are used.

### Recharts

Context7 source: `/recharts/recharts/v3.3.0`

Relevant notes:

- Core chart syntax remains declarative React components such as `ResponsiveContainer`, `AreaChart`, `BarChart`, `XAxis`, `CartesianGrid`, `Tooltip`, `Legend`, `Area`, and `Bar`.
- Tooltip and legend customization use component props such as `content` and `wrapperStyle`.
- For TypeScript stability, prefer typed static imports from `recharts` unless a dynamic import is clearly needed and correctly typed.

### React Hook Form Resolvers

Context7 source: `/react-hook-form/resolvers`

Relevant notes:

- `zodResolver(schema)` remains the standard integration point.
- Zod v3 and Zod v4 are supported; Zod v4 can be imported from `zod` or `zod/v4`.
- `zodResolver(schema, undefined, { mode: 'sync' })` and `{ raw: true }` are available when sync validation or uncoerced values are required.
- For stronger TypeScript output typing, `useForm<z.input<typeof schema>, any, z.output<typeof schema>>()` can be used.

## Upgrade Strategy

1. Upgrade all direct workspace dependencies to the latest registry versions.
2. Remove deprecated direct `@types/*` packages when the runtime package ships its own types or the type package is deprecated.
3. Re-run vulnerability audit after upgrade.
4. Fix TypeScript, ESLint, build, and runtime syntax breakage from major upgrades.
5. Keep existing uncommitted user changes intact.

## Post-Upgrade Result

Commands used:

```bash
corepack pnpm update -r --latest
corepack pnpm install --ignore-scripts
corepack pnpm outdated -r --format json
corepack pnpm audit --json
```

Final dependency state:

- `pnpm outdated -r --format json` returned 0 entries.
- Deprecated direct packages removed from `apps/api/package.json`:
  - `@types/helmet`
  - `@types/ioredis`
  - `@types/winston`
- `pnpm audit --json` returned 0 advisories after adding security overrides.

Security overrides added in `pnpm-workspace.yaml`:

- `@hono/node-server: 1.19.13`
- `postcss: 8.5.15`

Remaining peer warnings from install:

- `eslint@10.4.0` is newer than peer ranges declared by `eslint-config-next@16.2.6` and its transitive ESLint plugins. Actual lint verification passed.
- `mjml` transitive `htmlnano` expects `cssnano@^8.0.0` but resolved `7.1.9`.
- `nunjucks@3.2.4` expects `chokidar@^3.3.0` but resolved `4.0.3`.

Verification performed:

- `corepack pnpm --filter web exec tsc --noEmit --pretty false`
- `corepack pnpm --filter web run lint`
- `corepack pnpm dlx react-doctor@0.2.1 --offline --full --fail-on none .` from `apps/web`
- `corepack pnpm --filter api exec tsc --noEmit --pretty false`
- `corepack pnpm --filter api exec eslint "{src,apps,libs,test}/**/*.ts"`
- `corepack pnpm --filter api run build`
- `corepack pnpm --filter api test`
- `timeout 240 corepack pnpm --filter web exec next build --webpack`
- `corepack pnpm install --frozen-lockfile --ignore-scripts`
- `git diff --check` on touched files
- `corepack pnpm exec prettier --check` on touched files

Build note:

- `next build` with default Turbopack timed out after 180 seconds without producing a compile error.
- `next build --webpack` completed successfully when run with network access; the first non-network attempt failed only because `next/font` could not fetch Google Fonts.
- During static generation, blog API fetches failed with the app's offline/server-unreachable message, but the production build still completed and emitted the route manifest.
