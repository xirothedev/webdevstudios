import { BadRequestException } from '@nestjs/common';

export class FileTooLargeException extends BadRequestException {
  constructor(maxSize: number) {
    super(`File size exceeds maximum allowed size of ${maxSize} bytes`);
  }
}
