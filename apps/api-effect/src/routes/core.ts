import { HttpApiBuilder } from 'effect/unstable/httpapi';

import { api } from '../api';
import { wrap } from '../lib/http';
import { generateCsrfToken, issueCsrfToken } from '../lib/csrf';

export const coreHandlers = HttpApiBuilder.group(api, 'core', (h) =>
  h
    .handle(
      'ping',
      wrap(true, async () => ({ message: 'pong from effect' })),
    )
    .handle(
      'csrfToken',
      wrap(true, async (ctx) => {
        const token = generateCsrfToken();
        issueCsrfToken(ctx, token);
        return { csrfToken: token };
      }),
    ),
);
