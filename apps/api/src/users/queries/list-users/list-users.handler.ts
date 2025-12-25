import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { PrismaService } from '@/prisma/prisma.service';

import { UserListResponseDto } from '../../dtos/responses.dto';
import { PrivateUserDto } from '../../dtos/user.dto';
import { ListUsersQuery } from './list-users.query';

@QueryHandler(ListUsersQuery)
export class ListUsersHandler implements IQueryHandler<ListUsersQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListUsersQuery): Promise<UserListResponseDto> {
    const { page, limit, role } = query;

    const skip = (page - 1) * limit;

    const where = role ? { role } : {};

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
}
