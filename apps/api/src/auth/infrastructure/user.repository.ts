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

import { User, UserRole } from '@generated/prisma';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        fullName: true,
        phone: true,
        avatar: true,
        role: true,
        mfaEnabled: true,
        mfaSecret: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: {
    email: string;
    password?: string;
    fullName?: string;
    phone?: string;
    emailVerified?: boolean;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
        emailVerified: data.emailVerified ?? false,
      },
    });
  }

  async update(
    id: string,
    data: Partial<{
      password: string;
      fullName: string;
      phone: string;
      emailVerified: boolean;
      phoneVerified: boolean;
      mfaEnabled: boolean;
      mfaSecret: string;
      avatar: string;
      role: UserRole;
    }>,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async verifyEmail(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { emailVerified: true },
    });
  }

  async searchByKeyword(
    keyword: string,
    page: number,
    limit: number,
    includeEmail: boolean,
  ): Promise<{ users: User[]; total: number }> {
    const where = includeEmail
      ? {
          OR: [
            { email: { contains: keyword, mode: 'insensitive' as const } },
            { fullName: { contains: keyword, mode: 'insensitive' as const } },
          ],
        }
      : { fullName: { contains: keyword, mode: 'insensitive' as const } };

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { users, total };
  }

  async list(
    page: number,
    limit: number,
    role?: UserRole,
  ): Promise<{ users: User[]; total: number }> {
    const where = role ? { role } : {};
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { users, total };
  }

  async remove(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
