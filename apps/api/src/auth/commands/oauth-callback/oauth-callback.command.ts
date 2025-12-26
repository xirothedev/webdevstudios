import { OAuthProvider } from '@generated/prisma';
import { ICommand } from '@nestjs/cqrs';

export class OAuthCallbackCommand implements ICommand {
  constructor(
    public readonly provider: OAuthProvider,
    public readonly code: string,
    public readonly state?: string,
    public readonly ipAddress?: string,
    public readonly userAgent?: string
  ) {}
}
