import { UserRole } from '@generated/prisma';
import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { UserRepository } from '../../../auth/infrastructure/user.repository';
import { PrivateUserDto, PublicUserDto } from '../../dtos/user.dto';
import { GetUserByIdQuery } from './get-user-by-id.query';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    query: GetUserByIdQuery
  ): Promise<PublicUserDto | PrivateUserDto> {
    const { userId, requesterId, requesterRole } = query;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Privacy Logic:
    // - If requesterId === userId: Return PrivateUserDto (full data)
    // - If requesterRole === ADMIN: Return PrivateUserDto (full data)
    // - Otherwise: Return PublicUserDto (limited: id, fullName, avatar only)
    if (requesterId === userId || requesterRole === UserRole.ADMIN) {
      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        mfaEnabled: user.mfaEnabled,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    }

    return {
      id: user.id,
      fullName: user.fullName,
      avatar: user.avatar,
    };
  }
}
