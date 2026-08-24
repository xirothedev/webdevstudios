import { OAuthProvider } from '@prisma/client';

/**
 * Normalized profile every Passport strategy maps to before handing off to
 * OAuthService. See apps/api/CONTEXT.md — raw provider profiles must not leak
 * into domain services.
 */
export interface OAuthProfile {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  name?: string;
  picture?: string;
}
