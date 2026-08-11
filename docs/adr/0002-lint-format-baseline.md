# Lint and format baseline adoption

The repository adopted the team lint/format baseline: one root `prettier.config.mjs` (`semi`, `singleQuote`, `trailingComma: "all"`, `printWidth: 100`, LF) with no app-level `.prettierrc`, Prettier never formats `*.md`, the API lints with oxlint (root `.oxlintrc.json`), and the Next.js web app lints with ESLint via `eslint-config-next` plus `eslint-config-prettier` last.

Two deviations are documented in the config itself: `apps/web` pins `eslint@^9` because `eslint-plugin-react@7.37.x` crashes under ESLint 10 (`context.getFilename` removed), and `react-hooks/set-state-in-effect` plus `react-hooks/error-boundaries` are disabled for specific files via `// ponytail:` comments — client-only random decorations need a mount effect to keep SSR output stable, and async server components catch data-fetching errors with `try/catch` + `notFound()`, which error boundaries cannot replace.
