import { describe, expect, test } from 'bun:test';
import sharp from 'sharp';

import { ImageProcessingException } from '../exceptions';
import {
  convertToWebP,
  generateThumbnail,
  processImage,
  resizeImage,
  validateImage,
} from './image-optimization.util';

// real PNG bytes — sharp generates it, no fixtures needed
const png = async (width = 10, height = 10) =>
  sharp({
    create: { width, height, channels: 3, background: { r: 200, g: 10, b: 10 } },
  })
    .png()
    .toBuffer();

describe('image-optimization utils', () => {
  test('validateImage reads real metadata', async () => {
    const result = await validateImage(await png(12, 7));

    expect(result).toMatchObject({ isValid: true, width: 12, height: 7, format: 'png' });
  });

  test('validateImage rejects garbage buffers', async () => {
    await expect(validateImage(Buffer.from('definitely not an image'))).rejects.toThrow(
      ImageProcessingException,
    );
  });

  test('resizeImage produces exact dimensions', async () => {
    const resized = await resizeImage(await png(), { width: 32, height: 48 });
    const meta = await sharp(resized).metadata();

    expect(meta.width).toBe(32);
    expect(meta.height).toBe(48);
  });

  test('convertToWebP switches the format', async () => {
    const webp = await convertToWebP(await png());

    expect((await sharp(webp).metadata()).format).toBe('webp');
  });

  test('processImage chains resize + webp', async () => {
    const out = await processImage(await png(64, 64), { width: 20, height: 20 });
    const meta = await sharp(out).metadata();

    expect(meta.format).toBe('webp');
    expect(meta.width).toBe(20);
  });

  test('generateThumbnail defaults to a 150px square and honors overrides', async () => {
    const thumb = await generateThumbnail(await png());
    const big = await generateThumbnail(await png(), 300);

    expect(await sharp(thumb).metadata()).toMatchObject({ format: 'webp', width: 150 });
    expect((await sharp(big).metadata()).width).toBe(300);
  });

  test('processImage wraps unexpected failures', async () => {
    await expect(processImage(Buffer.from('junk'), { width: 5, height: 5 })).rejects.toThrow(
      ImageProcessingException,
    );
  });
});
