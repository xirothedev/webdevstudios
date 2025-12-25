import { ConflictException, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as argon2 from 'argon2';

import { MailService } from '@/mail/mail.service';

import { TokenService } from '../../infrastructure/token.service';
import { TokenStorageService } from '../../infrastructure/token-storage.service';
import { UserRepository } from '../../infrastructure/user.repository';
import { RegisterCommand } from './register.command';

@Injectable()
@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly tokenStorage: TokenStorageService,
    private readonly mailService: MailService
  ) {}

  async execute(command: RegisterCommand): Promise<{ userId: string }> {
    const { email, password, fullName, phone } = command;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await argon2.hash(password);

    // Create user
    const user = await this.userRepository.create({
      email,
      password: hashedPassword,
      fullName,
      phone,
      emailVerified: false,
    });

    // Generate email verification token
    const verificationToken =
      this.tokenService.generateEmailVerificationToken();

    // Store token in Redis with TTL (automatically expires after configured time)
    await this.tokenStorage.storeEmailVerificationToken(
      verificationToken,
      user.id
    );

    // Send verification email
    await this.mailService.sendVerificationEmail(email, verificationToken);

    return { userId: user.id };
  }
}
