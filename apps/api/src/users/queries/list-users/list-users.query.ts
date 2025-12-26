import { UserRole } from '@generated/prisma';

export class ListUsersQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly role?: UserRole
  ) {}
}
