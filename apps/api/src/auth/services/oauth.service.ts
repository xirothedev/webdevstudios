import { DeviceType, OAuthProvider } from '@generated/prisma';
import { Injectable } from '@nestjs/common';
import * as UAParser from 'ua-parser-js';

import { PrismaService } from '../../prisma/prisma.service';
import { SessionRepository } from '../infrastructure/session.repository';
import { TokenService } from '../infrastructure/token.service';
import { TokenStorageService } from '../infrastructure/token-storage.service';
import { UserRepository } from '../infrastructure/user.repository';

interface OAuthUser {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  name?: string;
  picture?: string;
}

@Injectable()
export class OAuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly tokenService: TokenService,
    private readonly tokenStorage: TokenStorageService,
    private readonly prisma: PrismaService
  ) {}

  async handleOAuthCallback(
    oauthUser: OAuthUser,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      fullName: string | null;
      emailVerified: boolean;
    };
  }> {
    const { provider, providerId, email, name, picture } = oauthUser;

    // Find or create external account
    const externalAccount = await this.prisma.externalAccount.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
      include: {
        user: true,
      },
    });

    let user;

    if (externalAccount) {
      // User exists - login
      user = externalAccount.user;
    } else {
      // Check if user with this email exists
      const existingUser = await this.userRepository.findByEmail(email);

      if (existingUser) {
        // Link OAuth account to existing user
        user = existingUser;
        await this.prisma.externalAccount.create({
          data: {
            provider,
            providerId,
            providerEmail: email,
            userId: user.id,
          },
        });
      } else {
        // Create new user
        user = await this.userRepository.create({
          email,
          fullName: name,
          emailVerified: true, // OAuth emails are pre-verified
        });

        // Create external account
        await this.prisma.externalAccount.create({
          data: {
            provider,
            providerId,
            providerEmail: email,
            userId: user.id,
          },
        });

        // Update avatar if available
        if (picture) {
          await this.userRepository.update(user.id, {
            avatar: picture,
          });
        }
      }
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
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const session = await this.sessionRepository.create({
      userId: user.id,
      token: accessToken,
      refreshToken,
      deviceId,
      ipAddress,
      userAgent,
      expiresAt,
    });

    // Mark MFA as verified (OAuth users don't need 2FA for OAuth login)
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
      },
    };
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
    if (device?.vendor && device?.model) {
      parts.push(`${device.vendor} ${device.model}`);
    }
    if (os?.name) {
      parts.push(os.name);
    }
    if (browser?.name) {
      parts.push(browser.name);
    }

    return parts.join(' - ') || 'Unknown Device';
  }

  private generateFingerprint(userAgent?: string, ipAddress?: string): string {
    const parts = [userAgent || '', ipAddress || ''];
    return Buffer.from(parts.join('|')).toString('base64').substring(0, 255);
  }
}
