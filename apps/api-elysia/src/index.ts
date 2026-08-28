import { Elysia } from 'elysia';

export const app = new Elysia({ prefix: '/v1' }).get('/ping', () => ({
  message: 'pong from elysia',
}));

// ponytail: 4002 avoids 4000 (NestJS) and 4001 (Go) while all twins run locally.
if (import.meta.main) {
  const port = Number(Bun.env.PORT ?? 4002);
  app.listen(port);
  console.log(`api-elysia listening on http://localhost:${port}/v1`);
}
