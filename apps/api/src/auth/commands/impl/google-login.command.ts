import { User } from '@generated/prisma';
import { Command } from '@nestjs/cqrs';

import { AuthUserResponseDto } from '../../dto/auth-user.dto';

export class GoogleLoginCommand extends Command<AuthUserResponseDto> {
  constructor(public readonly socialUser: User) {
    super();
  }
}
