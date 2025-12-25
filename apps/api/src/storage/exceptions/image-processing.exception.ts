import { InternalServerErrorException } from '@nestjs/common';

export class ImageProcessingException extends InternalServerErrorException {
  constructor(message?: string) {
    super(message || 'Failed to process image');
  }
}
