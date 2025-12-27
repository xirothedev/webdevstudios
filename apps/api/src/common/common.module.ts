import { Global, Module } from '@nestjs/common';

import { SecurityLoggerService } from './services/security-logger.service';

/**
 * Common module for shared services
 * Exports SecurityLoggerService for use across modules
 */
@Global()
@Module({
  providers: [SecurityLoggerService],
  exports: [SecurityLoggerService],
})
export class CommonModule {}
