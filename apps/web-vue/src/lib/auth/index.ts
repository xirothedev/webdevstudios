// Auth module entry point. Import side effect: registers the auth-lost handler so
// api-client (pure transport) never knows about routes or window.location itself.
import { registerAuthLostHandler } from '@/lib/api-client';

import { expiryRedirectTarget } from './policy';

export * from './policy';
export * from './user-cache';

registerAuthLostHandler(() => {
  if (typeof window === 'undefined') return;
  const target = expiryRedirectTarget(window.location.pathname);
  if (target) window.location.href = target;
});
