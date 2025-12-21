import { Injectable, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { PrismaService } from '@/prisma/prisma.service';

import { userInfoDto } from '../dto/userInfo.dto';
import { GetProfileQuery } from '../queries/get-profile.query';

@Injectable()
@QueryHandler(GetProfileQuery)
export class GetProfileHandler implements IQueryHandler<
  GetProfileQuery,
  userInfoDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetProfileQuery): Promise<userInfoDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: query.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
