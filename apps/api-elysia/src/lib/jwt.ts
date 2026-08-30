import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

function toSecret(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export interface VerifiedClaims {
  sub: string;
  jti?: string;
  email?: string;
  role?: string;
}

export async function signAccess(
  secret: string,
  sub: string,
  email: string,
  role: string,
  jti: string,
  ttlSeconds: number,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload = { sub, iat: now, exp: now + ttlSeconds };
  if (email !== '') payload.email = email;
  if (role !== '') payload.role = role;
  if (jti !== '') payload.jti = jti;
  return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).sign(toSecret(secret));
}

export async function signRefresh(
  secret: string,
  sub: string,
  ttlSeconds: number,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload = { sub, iat: now, exp: now + ttlSeconds };
  return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).sign(toSecret(secret));
}

export async function verifyToken(secret: string, token: string): Promise<VerifiedClaims | null> {
  if (secret === '') return null;
  try {
    const { payload } = await jwtVerify(token, toSecret(secret), { algorithms: ['HS256'] });
    if (typeof payload.sub !== 'string' || payload.sub === '') return null;
    const claims: VerifiedClaims = { sub: payload.sub };
    if (typeof payload.jti === 'string') claims.jti = payload.jti;
    if (typeof payload.email === 'string') claims.email = payload.email;
    if (typeof payload.role === 'string') claims.role = payload.role;
    return claims;
  } catch {
    return null;
  }
}
