import { Command } from '@nestjs/cqrs';

import { AuthUserResponseDto } from '../../dto/auth-user.dto';
import { RegisterDto } from '../../dto/register.dto';

export class RegisterUserCommand extends Command<AuthUserResponseDto> {
  constructor(public readonly dto: RegisterDto) {
    super();
  }
}
