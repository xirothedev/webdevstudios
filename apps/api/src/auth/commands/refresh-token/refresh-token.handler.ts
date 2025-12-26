import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionStatus } from 'generated/prisma/client';

import { SessionRepository } from '../../infrastructure/session.repository';
import { TokenService } from '../../infrastructure/token.service';
import { TokenStorageService } from '../../infrastructure/token-storage.service';
import { RefreshTokenCommand } from './refresh-token.command';

@Injectable()
@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly tokenService: TokenService,
    private readonly tokenStorage: TokenStorageService
  ) {}

  async execute(command: RefreshTokenCommand): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const { refreshToken } = command;

    // Verify refresh token
    let payload;
    try {
      payload = this.tokenService.verifyToken(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Find session by refresh token
    const session =
      await this.sessionRepository.findByRefreshToken(refreshToken);
    if (!session || session.status !== SessionStatus.ACTIVE) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired');
    }

    // Generate new tokens
    const newAccessToken = this.tokenService.generateAccessToken({
      sub: payload.sub,
      email: session.user.email,
      role: session.user.role,
    });

    const newRefreshToken = this.tokenService.generateRefreshToken({
      sub: payload.sub,
    });

    // Update session with new refresh token (refresh token rotation)
    await this.sessionRepository.updateRefreshToken(
      session.id,
      newRefreshToken
    );

    // Copy MFA verification status to new session (if it exists)
    // Check if old session had MFA verified
    const mfaVerified = await this.tokenStorage.getSessionMfaVerified(
      session.id
    );
    if (mfaVerified) {
      // Calculate TTL from session expiration
      const ttl = Math.floor((session.expiresAt.getTime() - Date.now()) / 1000);
      if (ttl > 0) {
        // Store with same TTL as session
        await this.tokenStorage.storeSessionMfaVerified(session.id, ttl);
      }
    }

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
