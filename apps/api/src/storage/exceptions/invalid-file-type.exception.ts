import { BadRequestException } from '@nestjs/common';

export class InvalidFileTypeException extends BadRequestException {
  constructor(allowedTypes: string[]) {
    super(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }
}
