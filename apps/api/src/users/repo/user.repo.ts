import { UserRole } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma';
import { USER_AUTH_SELECT, USER_SELECT, type UserAuthRow, type UserRow } from './user.selects';

export type { UserRow } from './user.selects';

@Injectable()
export class UserRepo {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserAuthRow | null> {
    return this.prisma.user.findUnique({ where: { email }, select: USER_AUTH_SELECT });
  }

  async findById(id: string): Promise<UserRow | null> {
    return this.prisma.user.findUnique({ where: { id }, select: USER_SELECT });
  }

  async findByIdWithSecrets(id: string): Promise<UserAuthRow | null> {
    return this.prisma.user.findUnique({ where: { id }, select: USER_AUTH_SELECT });
  }

  async create(data: {
    email: string;
    password?: string;
    fullName?: string;
    phone?: string;
    emailVerified?: boolean;
  }): Promise<UserRow> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
        emailVerified: data.emailVerified ?? false,
      },
      select: USER_SELECT,
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
  ): Promise<UserRow> {
    return this.prisma.user.update({ where: { id }, data, select: USER_SELECT });
  }

  async searchByKeyword(
    keyword: string,
    page: number,
    limit: number,
    includeEmail: boolean,
  ): Promise<{ users: UserRow[]; total: number }> {
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
        select: USER_SELECT,
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
  ): Promise<{ users: UserRow[]; total: number }> {
    const where = role ? { role } : {};
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: USER_SELECT,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { users, total };
  }

  async remove(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
