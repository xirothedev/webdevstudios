// Shared vocabulary and small helpers for all infra stacks.

export const DOMAIN = 'webdevstudio.resonance.io.vn';
export const SUBDOMAINS = {
  web: DOMAIN, // apex of the delegated zone
  api: `api.${DOMAIN}`,
  vue: `vue.${DOMAIN}`,
  apiGo: `api-go.${DOMAIN}`,
  apiAxum: `api-axum.${DOMAIN}`,
  apiElysia: `api-elysia.${DOMAIN}`,
} as const;

// Keys of the per-stage app secret (webdev/<stage>/app). Mirrors apps/api/.env.example
// so one human editing the secret configures every Mirror the same way.
export const APP_ENV_KEYS = [
  'CORS_ORIGIN',
  'CSRF_SECRET',
  'EMAIL_VERIFICATION_TOKEN_EXPIRES_IN',
  'EMAIL_VERIFICATION_URL',
  'FRONTEND_URL',
  'GITHUB_CALLBACK_URL',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'JWT_ACCESS_TOKEN_EXPIRES_IN',
  'JWT_REFRESH_TOKEN_EXPIRES_IN',
  'JWT_SECRET_KEY',
  'MAIL_HOST',
  'MAIL_PASS',
  'MAIL_PORT',
  'MAIL_USER',
  'PASSWORD_RESET_TOKEN_EXPIRES_IN',
  'PASSWORD_RESET_URL',
  'PAYOS_API_KEY',
  'PAYOS_CANCEL_URL',
  'PAYOS_CHECKSUM_KEY',
  'PAYOS_CLIENT_ID',
  'PAYOS_RETURN_URL',
  'R2_ACCESS_KEY_ID',
  'R2_ACCOUNT_ID',
  'R2_BUCKET_NAME',
  'R2_ENDPOINT',
  'R2_PUBLIC_URL',
  'R2_SECRET_ACCESS_KEY',
  'SESSION_SECRET',
  'SWAGGER_PASSWORD',
  'SWAGGER_USERNAME',
] as const;

// ponytail: liveness only — the 404 matcher keeps targets healthy as long as the
// process answers HTTP. Add a real /health to each app when readiness matters.
export const LIVENESS = {
  path: '/',
  interval: 30,
  timeout: 5,
  healthyThresholdCount: 2,
  unhealthyThresholdCount: 3,
  matcher: '200-404',
} as const;

export function placeholderConfig(): Record<string, string> {
  const o: Record<string, string> = {};
  for (const k of APP_ENV_KEYS) o[k] = 'REPLACE_ME';
  return o;
}
