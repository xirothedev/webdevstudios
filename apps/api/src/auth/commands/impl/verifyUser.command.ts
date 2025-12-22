import { Command } from '@nestjs/cqrs';

import { AuthUserResponseDto } from '@/auth/dto/auth-user.dto';

export class verifyUserCommand extends Command<AuthUserResponseDto> {
  constructor(public readonly dto: any) {
    super();
  }
}
