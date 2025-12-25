import { UserRole } from '@generated/prisma';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { PrismaService } from '@/prisma/prisma.service';

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
    // - Nếu requesterRole === ADMIN: Search by email và fullName, return PrivateUserDto
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
