import { hash, verify } from 'argon2';

export async function hashPassword(password: string): Promise<string> {
  // ponytail: node emits m=,p=,t= but Go's strict Sscanf wants m=,t=,p=; reorder post-hash.
  const raw = await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
    hashLength: 32,
  });
  return raw.replace(/(m=\d+,)p=(\d+),t=(\d+)/, '$1t=$3,p=$2');
}

export async function verifyPassword(hashed: string, password: string): Promise<boolean> {
  try {
    return await verify(hashed, password);
  } catch {
    return false;
  }
}
