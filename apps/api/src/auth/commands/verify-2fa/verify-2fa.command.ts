import { ICommand } from '@nestjs/cqrs';

export class Verify2FACommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly code: string,
    public readonly sessionId?: string,
    public readonly ipAddress?: string,
    public readonly userAgent?: string
  ) {}
}
