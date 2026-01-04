/**
 * Copyright (c) 2026 Xiro The Dev <lethanhtrung.trungle@gmail.com>
 *
 * Source Available License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to:
 * - View and study the Software for educational purposes
 * - Fork this repository on GitHub for personal reference
 * - Share links to this repository
 *
 * THE FOLLOWING ARE PROHIBITED:
 * - Using the Software in production or commercial applications
 * - Copying substantial portions of the Software into other projects
 * - Distributing modified versions of the Software
 * - Removing or altering copyright notices
 *
 * For commercial licensing or usage permissions, contact: lethanhtrung.trungle@gmail.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TokenStorageService } from '../../infrastructure/token-storage.service';
import { UserRepository } from '../../infrastructure/user.repository';
import { VerifyEmailCommand } from './verify-email.command';

@Injectable()
@CommandHandler(VerifyEmailCommand)
export class VerifyEmailHandler implements ICommandHandler<VerifyEmailCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenStorage: TokenStorageService
  ) {}

  async execute(command: VerifyEmailCommand): Promise<{ success: boolean }> {
    const { token } = command;

    // Get userId from Redis using token
    const userId = await this.tokenStorage.getEmailVerificationToken(token);

    if (!userId) {
      throw new NotFoundException('Invalid or expired verification token');
    }

    // Find user by ID
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is already verified
    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Verify email
    await this.userRepository.verifyEmail(user.id);

    // Delete token from Redis (one-time use)
    await this.tokenStorage.deleteEmailVerificationToken(token);

    return { success: true };
  }
}
