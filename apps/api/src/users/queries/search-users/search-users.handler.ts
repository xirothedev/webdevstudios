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
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { PrismaService } from '../../../prisma/prisma.service';
import { SearchUsersResponseDto } from '../../dtos/responses.dto';
import { PrivateUserDto, PublicUserDto } from '../../dtos/user.dto';
import { SearchUsersQuery } from './search-users.query';

@QueryHandler(SearchUsersQuery)
export class SearchUsersHandler implements IQueryHandler<SearchUsersQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: SearchUsersQuery): Promise<SearchUsersResponseDto> {
    const { query: searchQuery, page, limit, requesterRole } = query;

    const skip = (page - 1) * limit;

    // Privacy Logic:
    // - If requesterRole === ADMIN: Search by email and fullName, return PrivateUserDto
    // - Otherwise (regular users): Search by fullName only, return PublicUserDto (limited data)
    if (requesterRole === UserRole.ADMIN) {
      const where = {
        OR: [
          { email: { contains: searchQuery, mode: 'insensitive' as const } },
          { fullName: { contains: searchQuery, mode: 'insensitive' as const } },
        ],
      };

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.user.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      const userDtos: PrivateUserDto[] = users.map((user) => ({
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
      }));

      return {
        users: userDtos,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    }

    // Regular users: Search by fullName only, return PublicUserDto
    const where = {
      fullName: { contains: searchQuery, mode: 'insensitive' as const },
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const userDtos: PublicUserDto[] = users.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      avatar: user.avatar,
    }));

    return {
      users: userDtos,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}
