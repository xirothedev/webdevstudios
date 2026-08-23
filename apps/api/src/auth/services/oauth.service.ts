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

import { ExternalAccountRepo } from '../repo';
import { SessionIssuer } from './session-issuer.service';
import { OAuthProfile } from '../strategies';

@Injectable()
export class OAuthService {
  constructor(
    private readonly externalAccountRepo: ExternalAccountRepo,
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
    const user = await this.externalAccountRepo.findOrLinkOrCreate(oauthUser);

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
