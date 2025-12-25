import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { StorageConfig } from './storage.config';
import { StorageService } from './storage.service';

@Module({
  imports: [ConfigModule],
  providers: [StorageService, StorageConfig],
  exports: [StorageService],
})
export class StorageModule {}
