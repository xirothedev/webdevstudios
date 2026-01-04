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

import { DeviceType, MFAMethod } from '@generated/prisma';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as argon2 from 'argon2';
import * as UAParser from 'ua-parser-js';

import { PrismaService } from '../../../prisma/prisma.service';
import { SessionRepository } from '../../infrastructure/session.repository';
import { TokenService } from '../../infrastructure/token.service';
import { TokenStorageService } from '../../infrastructure/token-storage.service';
import { TotpService } from '../../infrastructure/totp.service';
import { UserRepository } from '../../infrastructure/user.repository';
import { Verify2FACommand } from './verify-2fa.command';

@Injectable()
@CommandHandler(Verify2FACommand)
export class Verify2FAHandler implements ICommandHandler<Verify2FACommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly totpService: TotpService,
    private readonly tokenService: TokenService,
    private readonly tokenStorage: TokenStorageService,
    private readonly prisma: PrismaService
  ) {}

  async execute(command: Verify2FACommand): Promise<{
    accessToken?: string;
    refreshToken?: string;
    user?: {
      id: string;
      email: string;
      fullName: string | null;
      emailVerified: boolean;
      mfaEnabled: boolean;
    };
    verified?: boolean;
  }> {
    const { userId, code, sessionId, ipAddress, userAgent } = command;

    // Find user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find MFA method
    const mfaMethod = await this.prisma.userMFAMethod.findFirst({
      where: {
        userId,
        methodType: MFAMethod.TOTP,
        isActive: true,
      },
    });

    if (!mfaMethod && !user.mfaSecret) {
      throw new BadRequestException('2FA is not enabled for this user');
    }

    const secret = mfaMethod?.secret || user.mfaSecret;
    if (!secret) {
      throw new BadRequestException('2FA secret not found');
    }

    // Verify TOTP code
    const isValidTotp = this.totpService.verifyCode(secret, code);

    // If TOTP is invalid, check backup codes
    if (!isValidTotp) {
      const backupCodes = await this.prisma.mFABackupCode.findMany({
        where: {
          userId,
          isUsed: false,
        },
      });

      let isValidBackup = false;
      let usedBackupCodeId: string | null = null;

      for (const backupCode of backupCodes) {
        try {
          const isValid = await argon2.verify(backupCode.code, code);
          if (isValid) {
            isValidBackup = true;
            usedBackupCodeId = backupCode.id;
            break;
          }
        } catch {
          // Continue checking other codes
        }
      }

      if (!isValidBackup) {
        throw new UnauthorizedException('Invalid 2FA code');
      }

      // Mark backup code as used
      if (usedBackupCodeId) {
        await this.prisma.mFABackupCode.update({
          where: { id: usedBackupCodeId },
          data: {
            isUsed: true,
            usedAt: new Date(),
          },
        });
      }
    }

    // If this is a login flow (sessionId provided), complete the login
    if (sessionId) {
      // This is a login flow - create session
      // Find the pending session or create a new one
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Create device record
      let deviceId: string | undefined;
      if (userAgent) {
        const parser = new UAParser.UAParser(userAgent);
        const result = parser.getResult();
        const deviceType = this.getDeviceType(result);
        const deviceName = this.getDeviceName(result);

        const device = await this.prisma.device.create({
          data: {
            userId: user.id,
            name: deviceName,
            type: deviceType,
            userAgent,
            ipAddress,
            fingerprint: this.generateFingerprint(userAgent, ipAddress),
          },
        });
        deviceId = device.id;
      }

      // Generate tokens
      const accessToken = this.tokenService.generateAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = this.tokenService.generateRefreshToken({
        sub: user.id,
      });

      // Create session
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      const session = await this.sessionRepository.create({
        userId: user.id,
        token: accessToken,
        refreshToken,
        deviceId,
        ipAddress,
        userAgent,
        expiresAt,
      });

      // Store MFA verification status in Redis with TTL matching session expiration
      const ttl = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
      await this.tokenStorage.storeSessionMfaVerified(session.id, ttl);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          emailVerified: user.emailVerified,
          mfaEnabled: user.mfaEnabled,
        },
      };
    }

    // This is a setup flow - mark MFA as verified and active
    if (mfaMethod && !mfaMethod.isVerified) {
      await this.prisma.userMFAMethod.update({
        where: { id: mfaMethod.id },
        data: {
          isVerified: true,
          isActive: true,
        },
      });

      await this.userRepository.update(userId, {
        mfaEnabled: true,
      });
    }

    return { verified: true };
  }

  private getDeviceType(parser: UAParser.IResult): DeviceType {
    const { device } = parser;
    if (device?.type === 'mobile') return DeviceType.MOBILE;
    if (device?.type === 'tablet') return DeviceType.TABLET;
    return DeviceType.DESKTOP;
  }

  private getDeviceName(parser: UAParser.IResult): string {
    const browser = parser.browser;
    const os = parser.os;
    const device = parser.device;

    const parts: string[] = [];
    if (device.vendor && device.model) {
      parts.push(`${device.vendor} ${device.model}`);
    }
    if (os.name) {
      parts.push(os.name);
    }
    if (browser.name) {
      parts.push(browser.name);
    }

    return parts.join(' - ') || 'Unknown Device';
  }

  private generateFingerprint(userAgent?: string, ipAddress?: string): string {
    const parts = [userAgent || '', ipAddress || ''];
    return Buffer.from(parts.join('|')).toString('base64').substring(0, 255);
  }
}
