import { describe, expect, it } from 'bun:test';

import { app } from './index';

describe('api-elysia mirror backend', () => {
  it('responds to the mirrored /v1/ping endpoint', async () => {
    const response = await app.handle(new Request('http://localhost/v1/ping'));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ message: 'pong from elysia' });
  });
});
