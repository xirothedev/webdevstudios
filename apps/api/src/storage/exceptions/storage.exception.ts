import { InternalServerErrorException } from '@nestjs/common';

export class StorageException extends InternalServerErrorException {
  constructor(message?: string) {
    super(message || 'Storage operation failed');
  }
}
