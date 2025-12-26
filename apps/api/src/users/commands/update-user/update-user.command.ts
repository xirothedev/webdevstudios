import { UserRole } from 'generated/prisma/client';

export class UpdateUserCommand {
  constructor(
    public readonly targetUserId: string,
    public readonly fullName?: string,
    public readonly phone?: string,
    public readonly avatar?: string,
    public readonly role?: UserRole
  ) {}
}
