import { OAuthProvider, Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma';
import { USER_SELECT, type UserRow } from '@/users/repo';

export type ExternalAccountRow = {
  id: string;
  provider: OAuthProvider;
  providerId: string;
  providerEmail: string | null;
  user: UserRow;
};

export type ExternalAccountIdentity = {
  provider: OAuthProvider;
  providerId: string;
};

@Injectable()
export class ExternalAccountRepo {
  constructor(private readonly prisma: PrismaService) {}

  async findByProvider(
    identity: ExternalAccountIdentity,
    tx?: Prisma.TransactionClient,
  ): Promise<ExternalAccountRow | null> {
    return (tx ?? this.prisma).externalAccount.findUnique({
      where: { provider_providerId: identity },
      include: { user: { select: USER_SELECT } },
    });
  }

  /**
   * Resolves the user behind an OAuth login in one atomic unit: returning
   * accounts only refresh providerEmail (avatar stays untouched), unknown
   * links attach to the exact-email match, otherwise a verified user is
   * created with the provider avatar.
   */
  async findOrLinkOrCreate(
    profile: {
      provider: OAuthProvider;
      providerId: string;
      email: string;
      name?: string;
      picture?: string;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<UserRow> {
    const run = (db: Prisma.TransactionClient): Promise<UserRow> => this.resolve(db, profile);
    return tx ? run(tx) : this.prisma.$transaction(run);
  }

  private async resolve(
    db: Prisma.TransactionClient,
    profile: {
      provider: OAuthProvider;
      providerId: string;
      email: string;
      name?: string;
      picture?: string;
    },
  ): Promise<UserRow> {
    const { provider, providerId, email, name, picture } = profile;
    const identity = { provider, providerId };

    const existing = await this.findByProvider(identity, db);

    if (existing) {
      await db.externalAccount.update({
        where: { provider_providerId: identity },
        data: { providerEmail: email },
      });
      return existing.user;
    }

    const linked = await db.user.findUnique({ where: { email }, select: USER_SELECT });
    if (linked) {
      await db.externalAccount.create({
        data: { provider, providerId, providerEmail: email, userId: linked.id },
      });
      return linked;
    }

    const created = await db.user.create({
      data: {
        email,
        fullName: name,
        emailVerified: true,
        ...(picture ? { avatar: picture } : {}),
      },
      select: USER_SELECT,
    });
    await db.externalAccount.create({
      data: { provider, providerId, providerEmail: email, userId: created.id },
    });
    return created;
  }
}
