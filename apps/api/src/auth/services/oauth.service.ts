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

import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma';
import { UserRepo } from '@/users/repo';

import { SessionIssuer } from './session-issuer.service';
import { OAuthProfile } from '../strategies';

@Injectable()
export class OAuthService {
  constructor(
    private readonly userRepo: UserRepo,
    private readonly prisma: PrismaService,
    private readonly sessionIssuer: SessionIssuer,
  ) {}

  async handleOAuthCallback(
    oauthUser: OAuthProfile,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    ttlSeconds: number;
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
      // Update provider email to reflect current provider state
      await this.prisma.externalAccount.update({
        where: {
          provider_providerId: { provider, providerId },
        },
        data: { providerEmail: email },
      });
    } else {
      // Check if user with this email exists
      const existingUser = await this.userRepo.findByEmail(email);

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
        user = await this.userRepo.create({
          email,
          fullName: name,
          emailVerified: true,
        });

        await this.prisma.externalAccount.create({
          data: {
            provider,
            providerId,
            providerEmail: email,
            userId: user.id,
          },
        });

        // Set avatar only on creation if user has no avatar
        if (picture && !user.avatar) {
          await this.userRepo.update(user.id, { avatar: picture });
        }
      }
    }

    // OAuth authentication is treated as inherently stronger than password
    const ttlSeconds = 30 * 24 * 60 * 60;
    const { accessToken, refreshToken } = await this.sessionIssuer.issue(user.id, {
      ip: ipAddress,
      userAgent,
      mfaTrusted: true,
      ttlSeconds,
    });

    return {
      accessToken,
      refreshToken,
      ttlSeconds,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        emailVerified: user.emailVerified,
      },
    };
  }
}
