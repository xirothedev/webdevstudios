import { BadRequestException } from '@nestjs/common';
import { describe, expect, test } from 'bun:test';

import { FileTooLargeException, InvalidFileTypeException } from '../exceptions';
import { FileValidationPipe } from './file-validation.pipe';

const file = (overrides: Partial<Express.Multer.File> = {}) =>
  ({
    originalname: 'photo.png',
    mimetype: 'image/png',
    size: 1024,
    buffer: Buffer.from('png'),
    ...overrides,
  }) as Express.Multer.File;

describe('FileValidationPipe', () => {
  test('valid files pass through unchanged', () => {
    const pipe = new FileValidationPipe();
    const input = file();

    expect(pipe.transform(input)).toBe(input);
  });

  test('missing file throws BadRequest', () => {
    const pipe = new FileValidationPipe();

    expect(() => pipe.transform(undefined as never)).toThrow(BadRequestException);
  });

  test('oversized files throw FileTooLarge', () => {
    const pipe = new FileValidationPipe({ maxSize: 100 });

    expect(() => pipe.transform(file({ size: 101 }))).toThrow(FileTooLargeException);
  });

  test('disallowed extensions throw InvalidFileType regardless of mimetype', () => {
    const pipe = new FileValidationPipe();

    expect(() => pipe.transform(file({ originalname: 'evil.gif', mimetype: 'image/png' }))).toThrow(
      InvalidFileTypeException,
    );
    expect(() => pipe.transform(file({ originalname: 'noextension' }))).toThrow(
      InvalidFileTypeException,
    );
  });

  test('mimetype must match the extension allowlist too', () => {
    const pipe = new FileValidationPipe();

    expect(() =>
      pipe.transform(file({ originalname: 'photo.png', mimetype: 'application/zip' })),
    ).toThrow(InvalidFileTypeException);
  });

  test('custom option lists narrow the defaults', () => {
    const pipe = new FileValidationPipe({
      allowedTypes: ['webp'],
      allowedMimeTypes: ['image/webp'],
    });

    expect(pipe.transform(file({ originalname: 'ok.webp', mimetype: 'image/webp' })).size).toBe(
      1024,
    );
    expect(() => pipe.transform(file({ originalname: 'ok.png', mimetype: 'image/png' }))).toThrow(
      InvalidFileTypeException,
    );
  });
});
