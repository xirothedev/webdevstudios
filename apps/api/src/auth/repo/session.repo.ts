import { Device, Session, SessionStatus, User } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma';

type SessionWithDevice = Session & {
  device: Device | null;
};

type SessionWithRelations = Session & {
  user: User;
  device: Device | null;
};

@Injectable()
export class SessionRepo {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: {
      userId: string;
      token: string;
      refreshToken?: string;
      deviceId?: string;
      ipAddress?: string;
      userAgent?: string;
      expiresAt: Date;
    },
    id?: string,
  ): Promise<Session> {
    return this.prisma.session.create({
      data: {
        ...(id ? { id } : {}),
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

  async findById(id: string): Promise<SessionWithRelations | null> {
    return this.prisma.session.findUnique({
      where: { id },
      include: {
        user: true,
        device: true,
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

  async findByRefreshToken(refreshToken: string): Promise<SessionWithRelations | null> {
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
