import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { MailService } from '@/mail/mail.service';

import { TokenService } from '../../infrastructure/token.service';
import { TokenStorageService } from '../../infrastructure/token-storage.service';
import { UserRepository } from '../../infrastructure/user.repository';
import { RequestPasswordResetCommand } from './request-password-reset.command';

@Injectable()
@CommandHandler(RequestPasswordResetCommand)
export class RequestPasswordResetHandler implements ICommandHandler<RequestPasswordResetCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly tokenStorage: TokenStorageService,
    private readonly mailService: MailService
  ) {}

  async execute(
    command: RequestPasswordResetCommand
  ): Promise<{ success: boolean }> {
    const { email } = command;

    // Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not (security best practice)
      // But for now, we'll return success anyway
      return { success: true };
    }

    // Generate reset token
    const resetToken = this.tokenService.generatePasswordResetToken();

    // Store token in Redis with TTL (automatically expires after configured time)
    await this.tokenStorage.storePasswordResetToken(resetToken, user.id);

    // Send password reset email
    await this.mailService.sendPasswordResetEmail(email, resetToken);

    return { success: true };
  }
}
