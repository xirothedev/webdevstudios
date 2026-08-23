import { MFAMethod } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

import { PrismaService } from '@/prisma';

type TotpMethodRow = {
  id: string;
  secret: string | null;
  isVerified: boolean;
};

// Concept-level repo over userMFAMethod + mFABackupCode (+ the legacy
// User.mfaSecret column) — one MFA concept spans three tables.
@Injectable()
export class MfaRepo {
  constructor(private readonly prisma: PrismaService) {}

  async resolveSecret(userId: string): Promise<string | null> {
    const method = await this.findActiveTotp(userId);
    if (method?.secret) {
      return method.secret;
    }

    // Legacy fallback: accounts predating UserMFAMethod keep their TOTP secret on User
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { mfaSecret: true },
    });
    return user?.mfaSecret ?? null;
  }

  async findActiveTotp(userId: string): Promise<TotpMethodRow | null> {
    return this.prisma.userMFAMethod.findFirst({
      where: { userId, methodType: MFAMethod.TOTP, isActive: true },
      select: { id: true, secret: true, isVerified: true },
    });
  }

  async provisionTotp(userId: string, secret: string, backupCodeHashes: string[]): Promise<void> {
    await this.prisma.userMFAMethod.create({
      data: {
        userId,
        methodType: MFAMethod.TOTP,
        secret,
        isActive: false,
        isVerified: false,
      },
    });
    await this.prisma.mFABackupCode.createMany({
      data: backupCodeHashes.map((code) => ({ userId, code })),
    });
  }

  async activateTotp(id: string): Promise<void> {
    await this.prisma.userMFAMethod.update({
      where: { id },
      data: { isVerified: true, isActive: true },
    });
  }

  async verifyBackupCodeAndConsume(userId: string, code: string): Promise<boolean> {
    const candidates = await this.prisma.mFABackupCode.findMany({
      where: { userId, isUsed: false },
    });

    for (const candidate of candidates) {
      try {
        if (await argon2.verify(candidate.code, code)) {
          // ponytail: find-then-mark allows double-spend under concurrent verifies; conditional updateMany if that matters
          await this.prisma.mFABackupCode.update({
            where: { id: candidate.id },
            data: { isUsed: true, usedAt: new Date() },
          });
          return true;
        }
      } catch {
        // malformed stored hash — keep scanning the remaining codes
      }
    }

    return false;
  }
}
