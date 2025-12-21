import { Command } from '@nestjs/cqrs';

import { AuthUserDto } from '../dto/auth-user.dto';
import { LoginDto } from '../dto/login.dto';

export class LoginCommand extends Command<AuthUserDto> {
  constructor(public readonly dto: LoginDto) {
    super();
  }
}
