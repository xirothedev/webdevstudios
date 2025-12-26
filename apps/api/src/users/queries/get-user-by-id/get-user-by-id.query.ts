import { UserRole } from 'generated/prisma/client';

export class GetUserByIdQuery {
  constructor(
    public readonly userId: string,
    public readonly requesterId?: string,
    public readonly requesterRole?: UserRole
  ) {}
}
