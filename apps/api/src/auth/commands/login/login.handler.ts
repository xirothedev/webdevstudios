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

import { DeviceType } from '@generated/prisma';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as argon2 from 'argon2';
import * as UAParser from 'ua-parser-js';

import { PrismaService } from '../../../prisma/prisma.service';
import { SessionRepository } from '../../infrastructure/session.repository';
import { TokenService } from '../../infrastructure/token.service';
import { TokenStorageService } from '../../infrastructure/token-storage.service';
import { UserRepository } from '../../infrastructure/user.repository';
import { LoginCommand } from './login.command';

@Injectable()
@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly tokenService: TokenService,
    private readonly tokenStorage: TokenStorageService,
    private readonly prisma: PrismaService
  ) {}

  async execute(command: LoginCommand): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      fullName: string | null;
      emailVerified: boolean;
      mfaEnabled: boolean;
    };
    requires2FA?: boolean;
  }> {
    const { email, password, rememberMe, ipAddress, userAgent } = command;

    // Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user has password (OAuth users might not have password)
    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check email verification
    if (!user.emailVerified) {
      throw new BadRequestException(
        'Please verify your email before logging in'
      );
    }

    // Check if 2FA is enabled
    if (user.mfaEnabled) {
      // Return 2FA challenge - don't create session yet
      return {
        accessToken: '', // No token until 2FA is verified
        refreshToken: '', // No token until 2FA is verified
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          emailVerified: user.emailVerified,
          mfaEnabled: user.mfaEnabled,
        },
        requires2FA: true,
      };
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

    // Calculate expiration
    const expiresIn = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // 30 days or 7 days
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // Create session
    const session = await this.sessionRepository.create({
      userId: user.id,
      token: accessToken,
      refreshToken,
      deviceId,
      ipAddress,
      userAgent,
      expiresAt,
    });

    // If user doesn't have 2FA enabled, mark MFA as verified (no verification needed)
    // If user has 2FA, this will be set to true after 2FA verification in Verify2FAHandler
    if (!user.mfaEnabled) {
      const ttl = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
      await this.tokenStorage.storeSessionMfaVerified(session.id, ttl);
    }

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

  private getDeviceType(parser: UAParser.IResult): DeviceType {
    const { device } = parser;
    if (device.type === 'mobile') return DeviceType.MOBILE;
    if (device.type === 'tablet') return DeviceType.TABLET;
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
    // Simple fingerprint generation
    // In production, use a more sophisticated method
    const parts = [userAgent || '', ipAddress || ''];
    return Buffer.from(parts.join('|')).toString('base64').substring(0, 255);
  }
}
