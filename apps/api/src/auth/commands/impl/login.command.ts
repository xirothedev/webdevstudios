import { Command } from '@nestjs/cqrs';

import { AuthUserResponseDto } from '../../dto/auth-user.dto';
import { LoginDto } from '../../dto/login.dto';

export class LoginCommand extends Command<AuthUserResponseDto> {
  constructor(public readonly dto: LoginDto) {
    super();
  }
}
