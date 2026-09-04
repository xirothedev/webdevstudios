import { Schema } from 'effect';
import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiGroup } from 'effect/unstable/httpapi';

import { wrap } from '../lib/http';
import { generateCsrfToken, issueCsrfToken } from '../lib/csrf';

export const coreGroup = HttpApiGroup.make('core')
  .add(
    HttpApiEndpoint.get('ping', '/v1/ping', {
      success: Schema.Struct({ message: Schema.String }),
    }),
    HttpApiEndpoint.get('csrfToken', '/v1/csrf-token', {
      success: Schema.Struct({ csrfToken: Schema.String }),
    }),
  );

export const coreLocal = HttpApi.make('api-effect').add(coreGroup);

export const coreHandlers = HttpApiBuilder.group(coreLocal, 'core', (h) =>
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
