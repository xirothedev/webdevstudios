import { Injectable } from '@nestjs/common';
import { User, UserRole } from 'generated/prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
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
    }>
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
}
