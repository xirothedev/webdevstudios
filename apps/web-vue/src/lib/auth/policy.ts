// Pure auth policy decisions. No imports from api-client / vue-query / window —
// everything route- or role-dependent is decided here and executed elsewhere.
import type { User } from '@/types/auth.types';

// Single source of truth for "routes that never force a login redirect".
export const PUBLIC_ROUTES = [
  '/', // Home page
  '/shop', // Shop listing
  '/about', // About page
  '/faq', // FAQ page
  '/generation', // Generation page
  '/calendar', // Calendar page
  '/achievements', // Achievements page
  '/activities', // Activities page
  '/partner', // Partner page
  '/blog', // Blog listing page
] as const;

export const PUBLIC_ROUTE_PREFIXES = ['/shop/', '/auth/', '/legal/', '/blog/'] as const;

export function isPublicRoute(path: string): boolean {
  return (
    (PUBLIC_ROUTES as readonly string[]).includes(path) ||
    PUBLIC_ROUTE_PREFIXES.some((prefix) => path.startsWith(prefix))
  );
}

/** Where a dead session must be bounced to; null means "stay put". */
export function expiryRedirectTarget(path: string): string | null {
  return isPublicRoute(path) ? null : '/auth/login';
}

/** mirrors apps/web app/admin/layout.tsx guard: !user -> login, non-admin -> home, else allow. */
export function adminRedirectFor(user: User | undefined): true | string {
  if (!user) return '/auth/login';
  if (user.role !== 'ADMIN') return '/';
  return true;
}
