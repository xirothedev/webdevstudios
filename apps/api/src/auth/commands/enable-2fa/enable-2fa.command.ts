import { ICommand } from '@nestjs/cqrs';

export class Enable2FACommand implements ICommand {
  constructor(public readonly userId: string) {}
}
