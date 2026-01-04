/**
 * Copyright (c) 2026 Xiro The Dev <lethanhtrung.trungle@gmail.com>
 *
 * Source Available License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to:
 * - View and study the Software for educational purposes
 * - Fork this repository on GitHub for personal reference
 * - Share links to this repository
 *
 * THE FOLLOWING ARE PROHIBITED:
 * - Using the Software in production or commercial applications
 * - Copying substantial portions of the Software into other projects
 * - Distributing modified versions of the Software
 * - Removing or altering copyright notices
 *
 * For commercial licensing or usage permissions, contact: lethanhtrung.trungle@gmail.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

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
