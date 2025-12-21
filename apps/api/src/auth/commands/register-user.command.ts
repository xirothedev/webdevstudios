import { Command } from '@nestjs/cqrs';

import { AuthUserDto } from '../dto/auth-user.dto';
import { RegisterDto } from '../dto/register.dto';

export class RegisterUserCommand extends Command<AuthUserDto> {
  constructor(public readonly dto: RegisterDto) {
    super();
  }
}
