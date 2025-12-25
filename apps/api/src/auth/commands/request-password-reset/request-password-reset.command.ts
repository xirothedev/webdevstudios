import { ICommand } from '@nestjs/cqrs';

export class RequestPasswordResetCommand implements ICommand {
  constructor(public readonly email: string) {}
}
