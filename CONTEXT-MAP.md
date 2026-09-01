# Context map

This repo has six contexts, one per app. Each context has its own `CONTEXT.md` and `apps/<app>/docs/adr/`.

- **api** — NestJS backend API. See `apps/api/CONTEXT.md` (created lazily by `/domain-modeling`).
- **api-go** — Go Mirror of the API. See `apps/api-go/CONTEXT.md`.
- **api-axum** — Rust Axum Mirror of the API. See `apps/api-axum/CONTEXT.md`.
- **api-elysia** — Elysia/Bun Mirror of the API. See `apps/api-elysia/CONTEXT.md`.
- **web** — frontend web app. See `apps/web/CONTEXT.md` (created lazily by `/domain-modeling`).
- **web-vue** — Vue Mirror of web. See `apps/web-vue/CONTEXT.md`.

System-wide decisions live in `docs/adr/`.
