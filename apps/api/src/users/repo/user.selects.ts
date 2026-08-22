import { Prisma } from '@prisma/client';

export const USER_SELECT = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  avatar: true,
  role: true,
  mfaEnabled: true,
  emailVerified: true,
  phoneVerified: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

// ponytail: second select instead of leaking password/mfaSecret through the safe one
export const USER_AUTH_SELECT = {
  ...USER_SELECT,
  password: true,
  mfaSecret: true,
} satisfies Prisma.UserSelect;

export type UserRow = Prisma.UserGetPayload<{ select: typeof USER_SELECT }>;
export type UserAuthRow = Prisma.UserGetPayload<{ select: typeof USER_AUTH_SELECT }>;
