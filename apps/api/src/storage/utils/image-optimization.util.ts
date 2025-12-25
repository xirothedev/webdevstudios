import sharp from 'sharp';

import { ImageProcessingException } from '../exceptions/image-processing.exception';

export interface ImageValidationResult {
  isValid: boolean;
  width: number;
  height: number;
  format: string;
}

export interface ResizeOptions {
  width: number;
  height: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

/**
 * Validate image file
 */
export async function validateImage(
  buffer: Buffer
): Promise<ImageValidationResult> {
  try {
    const metadata = await sharp(buffer).metadata();
    return {
      isValid: true,
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
    };
  } catch {
    throw new ImageProcessingException('Invalid image file');
  }
}

/**
 * Resize image to specified dimensions
 */
export async function resizeImage(
  buffer: Buffer,
  options: ResizeOptions
): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .resize(options.width, options.height, {
        fit: options.fit || 'cover',
      })
      .toBuffer();
  } catch {
    throw new ImageProcessingException('Failed to resize image');
  }
}

/**
 * Convert image to WebP format
 */
export async function convertToWebP(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(buffer).webp({ quality: 85 }).toBuffer();
  } catch {
    throw new ImageProcessingException('Failed to convert image to WebP');
  }
}

/**
 * Process image: resize and convert to WebP
 */
export async function processImage(
  buffer: Buffer,
  options: ResizeOptions
): Promise<Buffer> {
  try {
    const resized = await resizeImage(buffer, options);
    return await convertToWebP(resized);
  } catch (error) {
    if (error instanceof ImageProcessingException) {
      throw error;
    }
    throw new ImageProcessingException('Failed to process image');
  }
}

/**
 * Generate thumbnail from image
 */
export async function generateThumbnail(
  buffer: Buffer,
  size: number = 150
): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .resize(size, size, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    throw new ImageProcessingException('Failed to generate thumbnail');
  }
}
