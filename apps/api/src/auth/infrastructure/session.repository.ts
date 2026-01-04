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

import { Device, Session, SessionStatus, User } from '@generated/prisma';
import { Injectable } from '@nestjs/common';

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
