import { Command } from '@nestjs/cqrs';

import { VerifiedUserResponseDto } from '@/auth/dto/auth-user.dto';

export class verifyUserCommand extends Command<VerifiedUserResponseDto> {
  constructor(public readonly dto: { verificationCode: string }) {
    super();
  }
}
