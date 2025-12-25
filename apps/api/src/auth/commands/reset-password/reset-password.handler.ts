import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as argon2 from 'argon2';

import { SessionRepository } from '../../infrastructure/session.repository';
import { TokenStorageService } from '../../infrastructure/token-storage.service';
import { UserRepository } from '../../infrastructure/user.repository';
import { ResetPasswordCommand } from './reset-password.command';

@Injectable()
@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly tokenStorage: TokenStorageService
  ) {}

  async execute(command: ResetPasswordCommand): Promise<{ success: boolean }> {
    const { token, newPassword } = command;

    // Get userId from Redis using token
    const userId = await this.tokenStorage.getPasswordResetToken(token);

    if (!userId) {
      throw new NotFoundException('Invalid or expired reset token');
    }

    // Find user by ID
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash new password
    const hashedPassword = await argon2.hash(newPassword);

    // Update password
    await this.userRepository.update(user.id, {
      password: hashedPassword,
    });

    // Revoke all sessions (security best practice)
    await this.sessionRepository.revokeAllByUserId(user.id);

    // Delete token from Redis (one-time use)
    await this.tokenStorage.deletePasswordResetToken(token);

    return { success: true };
  }
}
