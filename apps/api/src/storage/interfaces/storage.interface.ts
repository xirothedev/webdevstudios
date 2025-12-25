export interface UploadFileOptions {
  key: string;
  file: Buffer;
  contentType: string;
  metadata?: Record<string, string>;
}

export interface UploadImageOptions {
  key: string;
  file: Buffer;
  contentType: string;
  width?: number;
  height?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

export interface UploadResult {
  key: string;
  url: string;
  size: number;
}
