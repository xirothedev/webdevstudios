import { Injectable } from '@nestjs/common';
import { Device, Session, SessionStatus, User } from 'generated/prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

type SessionWithDevice = Session & {
  device: Device | null;
};

type SessionWithRelations = Session & {
  user: User;
  device: Device | null;
};

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId: string;
    token: string;
    refreshToken?: string;
    deviceId?: string;
    ipAddress?: string;
    userAgent?: string;
    expiresAt: Date;
  }): Promise<Session> {
    return this.prisma.session.create({
      data: {
        userId: data.userId,
        token: data.token,
        refreshToken: data.refreshToken,
        deviceId: data.deviceId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        expiresAt: data.expiresAt,
        status: SessionStatus.ACTIVE,
      },
    });
  }

  async findByToken(token: string): Promise<SessionWithRelations | null> {
    return this.prisma.session.findUnique({
      where: { token },
      include: {
        user: true,
        device: true,
      },
    });
  }

  async findByRefreshToken(
    refreshToken: string
  ): Promise<SessionWithRelations | null> {
    return this.prisma.session.findFirst({
      where: { refreshToken },
      include: {
        user: true,
        device: true,
      },
    });
  }

  async findByUserId(userId: string): Promise<SessionWithDevice[]> {
    return this.prisma.session.findMany({
      where: {
        userId,
        status: SessionStatus.ACTIVE,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        device: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async revoke(id: string): Promise<Session> {
    return this.prisma.session.update({
      where: { id },
      data: {
        status: SessionStatus.REVOKED,
        revokedAt: new Date(),
      },
    });
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: {
        userId,
        status: SessionStatus.ACTIVE,
      },
      data: {
        status: SessionStatus.REVOKED,
        revokedAt: new Date(),
      },
    });
  }

  async updateRefreshToken(id: string, refreshToken: string): Promise<Session> {
    return this.prisma.session.update({
      where: { id },
      data: { refreshToken },
    });
  }

  async cleanupExpired(): Promise<number> {
    const result = await this.prisma.session.updateMany({
      where: {
        status: SessionStatus.ACTIVE,
        expiresAt: {
          lt: new Date(),
        },
      },
      data: {
        status: SessionStatus.EXPIRED,
      },
    });
    return result.count;
  }
}
