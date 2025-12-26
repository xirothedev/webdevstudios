import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as argon2 from 'argon2';
import { MFAMethod } from 'generated/prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { TotpService } from '../../infrastructure/totp.service';
import { UserRepository } from '../../infrastructure/user.repository';
import { Enable2FACommand } from './enable-2fa.command';

@Injectable()
@CommandHandler(Enable2FACommand)
export class Enable2FAHandler implements ICommandHandler<Enable2FACommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly totpService: TotpService,
    private readonly prisma: PrismaService
  ) {}

  async execute(command: Enable2FACommand): Promise<{
    qrCode: string;
    secret: string;
    backupCodes: string[];
  }> {
    const { userId } = command;

    // Find user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if 2FA is already enabled
    if (user.mfaEnabled) {
      throw new BadRequestException('2FA is already enabled');
    }

    // Get user email for QR code
    const email = user.email;

    // Generate TOTP secret
    const secret = this.totpService.generateSecret(email);

    // Generate QR code
    const qrCode = await this.totpService.generateQRCode(secret, email);

    // Generate backup codes
    const backupCodes = this.totpService.generateBackupCodes(10);

    // Hash backup codes before storing
    const hashedBackupCodes = await Promise.all(
      backupCodes.map((code) => argon2.hash(code))
    );

    // Store MFA method (but don't activate yet - user needs to verify first)
    await this.prisma.userMFAMethod.create({
      data: {
        userId,
        methodType: MFAMethod.TOTP,
        secret, // In production, encrypt this
        isActive: false, // Not active until verified
        isVerified: false,
      },
    });

    // Store backup codes
    await Promise.all(
      hashedBackupCodes.map((hashedCode) =>
        this.prisma.mFABackupCode.create({
          data: {
            userId,
            code: hashedCode,
          },
        })
      )
    );

    // Store secret in user (temporary, until verified)
    await this.userRepository.update(userId, {
      mfaSecret: secret, // In production, encrypt this
    });

    return {
      qrCode,
      secret, // Return plain secret for QR code generation (user should save this)
      backupCodes, // Return plain backup codes (user should save these)
    };
  }
}
