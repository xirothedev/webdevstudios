import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

// Cloudflare R2 via S3, mirrors api-go storage.go.
// null = not configured; ErrUnavailable-style errors make callers degrade.

export class StorageUnavailableError extends Error {
  constructor() {
    super('storage: R2_* env vars not configured');
    this.name = 'StorageUnavailableError';
  }
}

type ClientOptions = {
  client: S3Client;
  bucket: string;
  publicUrl: string;
};

let state: ClientOptions | null | undefined;

function getClient(): ClientOptions | null {
  if (state === undefined) {
    state = null;
    const key = process.env.R2_ACCESS_KEY_ID;
    if (key !== undefined && key !== '') {
      const bucket = process.env.R2_BUCKET_NAME ?? '';
      state = {
        client: new S3Client({
          region: 'auto',
          endpoint: process.env.R2_ENDPOINT,
          credentials: {
            accessKeyId: key,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
          },
        }),
        bucket,
        publicUrl: (process.env.R2_PUBLIC_URL ?? '').replace(/\/+$/, ''),
      };
    }
  }

  return state;
}

export function storageEnabled(): boolean {
  return getClient() !== null;
}

// Absolute URLs pass through; bare R2 keys get the public base prepended.
export function resolveMediaUrl(ref: string): string {
  if (ref === '') return '';
  const cfg = getClient();
  if (ref.includes('://') || cfg === null || cfg.publicUrl === '') return ref;
  return `${cfg.publicUrl}/${ref}`;
}

export async function getObject(key: string): Promise<Uint8Array> {
  const cfg = getClient();
  if (cfg === null) throw new StorageUnavailableError();
  const res = await cfg.client.send(new GetObjectCommand({ Bucket: cfg.bucket, Key: key }));
  if (res.Body === undefined) throw new Error('storage: empty object body');
  const bytes = new Uint8Array(await res.Body.transformToByteArray());
  return bytes;
}

export async function putObject(key: string, body: Uint8Array, contentType: string): Promise<void> {
  const cfg = getClient();
  if (cfg === null) throw new StorageUnavailableError();
  await cfg.client.send(
    new PutObjectCommand({ Bucket: cfg.bucket, Key: key, Body: body, ContentType: contentType }),
  );
}

export async function deleteObject(key: string): Promise<void> {
  const cfg = getClient();
  if (cfg === null) throw new StorageUnavailableError();
  await cfg.client.send(new DeleteObjectCommand({ Bucket: cfg.bucket, Key: key }));
}
