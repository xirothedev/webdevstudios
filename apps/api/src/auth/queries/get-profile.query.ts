import { Command } from '@nestjs/cqrs';

import { AuthUserDto } from '../dto/auth-user.dto';

export class GetProfileQuery extends Command<AuthUserDto> {
  constructor(public readonly userId: string) {
    super();
  }
}
