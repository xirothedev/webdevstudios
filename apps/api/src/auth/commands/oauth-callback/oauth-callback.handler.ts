import { DeviceType, OAuthProvider } from '@generated/prisma';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import axios from 'axios';
import * as UAParser from 'ua-parser-js';

import { PrismaService } from '../../../prisma/prisma.service';
import { SessionRepository } from '../../infrastructure/session.repository';
import { TokenService } from '../../infrastructure/token.service';
import { UserRepository } from '../../infrastructure/user.repository';
import { OAuthCallbackCommand } from './oauth-callback.command';

interface OAuthProfile {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

@Injectable()
@CommandHandler(OAuthCallbackCommand)
export class OAuthCallbackHandler implements ICommandHandler<OAuthCallbackCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly tokenService: TokenService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  async execute(command: OAuthCallbackCommand): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      fullName: string | null;
      emailVerified: boolean;
    };
  }> {
    const { provider, code, ipAddress, userAgent } = command;

    // Exchange code for access token and get user profile
    const profile = await this.getUserProfile(provider, code);

    // Find or create external account
    const externalAccount = await this.prisma.externalAccount.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId: profile.id,
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
      const existingUser = await this.userRepository.findByEmail(profile.email);

      if (existingUser) {
        // Link OAuth account to existing user
        user = existingUser;
        await this.prisma.externalAccount.create({
          data: {
            provider,
            providerId: profile.id,
            providerEmail: profile.email,
            userId: user.id,
          },
        });
      } else {
        // Create new user
        user = await this.userRepository.create({
          email: profile.email,
          fullName: profile.name,
          emailVerified: true, // OAuth emails are pre-verified
        });

        // Create external account
        await this.prisma.externalAccount.create({
          data: {
            provider,
            providerId: profile.id,
            providerEmail: profile.email,
            userId: user.id,
          },
        });

        // Update avatar if available
        if (profile.picture) {
          await this.userRepository.update(user.id, {
            avatar: profile.picture,
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
    await this.sessionRepository.create({
      userId: user.id,
      token: accessToken,
      refreshToken,
      deviceId,
      ipAddress,
      userAgent,
      expiresAt,
    });

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

  private async getUserProfile(
    provider: OAuthProvider,
    code: string
  ): Promise<OAuthProfile> {
    switch (provider) {
      case OAuthProvider.GOOGLE:
        return this.getGoogleProfile(code);
      case OAuthProvider.GITHUB:
        return this.getGitHubProfile(code);
      default:
        throw new UnauthorizedException(
          `Unsupported OAuth provider: ${provider}`
        );
    }
  }

  private async getGoogleProfile(code: string): Promise<OAuthProfile> {
    const clientId = this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.getOrThrow<string>(
      'GOOGLE_CLIENT_SECRET'
    );
    const redirectUri = this.configService.getOrThrow<string>(
      'GOOGLE_CALLBACK_URL'
    );

    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Get user profile
    const profileResponse = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return {
      id: profileResponse.data.id,
      email: profileResponse.data.email,
      name: profileResponse.data.name,
      picture: profileResponse.data.picture,
    };
  }

  private async getGitHubProfile(code: string): Promise<OAuthProfile> {
    const clientId = this.configService.getOrThrow<string>('GITHUB_CLIENT_ID');
    const clientSecret = this.configService.getOrThrow<string>(
      'GITHUB_CLIENT_SECRET'
    );
    const redirectUri = this.configService.getOrThrow<string>(
      'GITHUB_CALLBACK_URL'
    );

    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Get user profile
    const profileResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Get user email (might need separate call)
    let email = profileResponse.data.email;
    if (!email) {
      const emailsResponse = await axios.get(
        'https://api.github.com/user/emails',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const primaryEmail = emailsResponse.data.find((e: any) => e.primary);
      email = primaryEmail?.email || emailsResponse.data[0]?.email;
    }

    return {
      id: profileResponse.data.id.toString(),
      email,
      name: profileResponse.data.name || profileResponse.data.login,
      picture: profileResponse.data.avatar_url,
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
