import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { SessionRepository } from '../infrastructure/session.repository';
import { TokenStorageService } from '../infrastructure/token-storage.service';

@Injectable()
export class MfaGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionRepository: SessionRepository,
    private readonly tokenStorage: TokenStorageService
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

    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new ForbiddenException('Authorization header missing');
    }

    const token = authHeader.replace('Bearer ', '');

    // Find session by token
    const session = await this.sessionRepository.findByToken(token);
    if (!session || session.status !== 'ACTIVE') {
      throw new ForbiddenException('Invalid or expired session');
    }

    // Check Redis for MFA verification status
    const mfaVerified = await this.tokenStorage.getSessionMfaVerified(
      session.id
    );

    if (!mfaVerified) {
      throw new ForbiddenException('2FA verification required');
    }

    return true;
  }
}
