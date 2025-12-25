import { UserRole } from '@generated/prisma';

export class SearchUsersQuery {
  constructor(
    public readonly query: string,
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly requesterId?: string,
    public readonly requesterRole?: UserRole
  ) {}
}
