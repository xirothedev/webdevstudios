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

import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma';
import { SessionRepo } from '../repo';
import { TokenStorageService } from '../infrastructure';

@Injectable()
export class MfaGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionRepo: SessionRepo,
    private readonly tokenStorage: TokenStorageService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has 2FA enabled
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { mfaEnabled: true },
    });

    if (!dbUser?.mfaEnabled) {
      throw new ForbiddenException('2FA is not enabled for this user');
    }

    // Resolve the session by its stable id (jti claim). Tokens minted before
    // this change carry no jti — fall back to token-string lookup.
    // ponytail: delete the fallback when the Session.token column is dropped
    const session = user.sessionId
      ? await this.sessionRepo.findById(user.sessionId)
      : await this.sessionRepo.findByToken(
          request.cookies?.['access_token'] ??
            (request.headers.authorization?.startsWith('Bearer ')
              ? request.headers.authorization.slice(7)
              : undefined) ??
            '',
        );
    if (!session || session.status !== 'ACTIVE') {
      throw new ForbiddenException('Invalid or expired session');
    }

    // Check Redis for MFA verification status
    const mfaVerified = await this.tokenStorage.getSessionMfaVerified(session.id);

    if (!mfaVerified) {
      throw new ForbiddenException('2FA verification required');
    }

    return true;
  }
}
