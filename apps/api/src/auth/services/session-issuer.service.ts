import { DeviceType, Session } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import * as UAParser from 'ua-parser-js';

import { addSeconds } from 'date-fns';
import { randomUUID } from 'crypto';

import { PrismaService } from '@/prisma';
import { UserRepo } from '@/users/repo';

import { SessionRepo } from '../repo';
import { TokenService, TokenStorageService } from '../infrastructure';

export type IssueOptions = {
  ip?: string;
  userAgent?: string;
  mfaTrusted: boolean;
  ttlSeconds: number;
};

@Injectable()
export class SessionIssuer {
  constructor(
    private readonly userRepo: UserRepo,
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly sessionRepo: SessionRepo,
    private readonly tokenStorage: TokenStorageService,
  ) {}

  async issue(
    userId: string,
    options: IssueOptions,
  ): Promise<{ session: Session; accessToken: string; refreshToken: string }> {
    const { ip, userAgent, mfaTrusted, ttlSeconds } = options;

    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let deviceId: string | undefined;
    if (userAgent) {
      const parser = new UAParser.UAParser(userAgent);
      const result = parser.getResult();

      const device = await this.prisma.device.create({
        data: {
          userId,
          name: this.getDeviceName(result),
          type: this.getDeviceType(result),
          userAgent,
          ipAddress: ip,
          fingerprint: this.generateFingerprint(userAgent, ip),
        },
      });
      deviceId = device.id;
    }

    const sessionId = randomUUID();
    const accessToken = this.tokenService.generateAccessToken(
      {
        sub: userId,
        email: user.email,
        role: user.role,
      },
      sessionId,
    );

    const refreshToken = this.tokenService.generateRefreshToken({
      sub: userId,
    });

    const expiresAt = addSeconds(new Date(), ttlSeconds);
    const session = await this.sessionRepo.create(
      {
        userId,
        token: accessToken,
        refreshToken,
        deviceId,
        ipAddress: ip,
        userAgent,
        expiresAt,
      },
      sessionId,
    );

    if (mfaTrusted) {
      const ttl = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
      await this.tokenStorage.storeSessionMfaVerified(session.id, ttl);
    }

    return { session, accessToken, refreshToken };
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
