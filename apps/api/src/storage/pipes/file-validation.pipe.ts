/**
 * Copyright (c) 2026 Xiro The Dev <lethanhtrung.trungle@gmail.com>
 *
 * Source Available License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to:
 * - View and study the Software for educational purposes
 * - Fork this repository on GitHub for personal reference
 * - Share links to this repository
 *
 * THE FOLLOWING ARE PROHIBITED:
 * - Using the Software in production or commercial applications
 * - Copying substantial portions of the Software into other projects
 * - Distributing modified versions of the Software
 * - Removing or altering copyright notices
 *
 * For commercial licensing or usage permissions, contact: lethanhtrung.trungle@gmail.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import { FileTooLargeException } from '../exceptions/file-too-large.exception';
import { InvalidFileTypeException } from '../exceptions/invalid-file-type.exception';

export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  allowedMimeTypes?: string[];
}

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly maxSize: number;
  private readonly allowedTypes: string[];
  private readonly allowedMimeTypes: string[];

  constructor(options: FileValidationOptions = {}) {
    this.maxSize = options.maxSize || 5 * 1024 * 1024; // 5MB default
    this.allowedTypes = options.allowedTypes || ['jpg', 'jpeg', 'png', 'webp'];
    this.allowedMimeTypes = options.allowedMimeTypes || [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];
  }

  transform(value: Express.Multer.File): Express.Multer.File {
    if (!value) {
      throw new BadRequestException('File is required');
    }

    // Check file size
    if (value.size > this.maxSize) {
      throw new FileTooLargeException(this.maxSize);
    }

    // Check file type by extension
    const fileExtension = value.originalname.split('.').pop()?.toLowerCase();

    if (!fileExtension || !this.allowedTypes.includes(fileExtension)) {
      throw new InvalidFileTypeException(this.allowedTypes);
    }

    // Check MIME type
    if (!this.allowedMimeTypes.includes(value.mimetype)) {
      throw new InvalidFileTypeException(this.allowedTypes);
    }

    return value;
  }
}
