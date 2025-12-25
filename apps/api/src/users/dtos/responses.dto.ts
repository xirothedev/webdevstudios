import { UserRole } from '@generated/prisma';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PublicUserDto {
  @ApiProperty({
    description: 'User ID',
    example: 'clx1234567890',
  })
  id: string;

  @ApiPropertyOptional({
    description: 'User full name',
    example: 'John Doe',
    nullable: true,
  })
  fullName: string | null;

  @ApiPropertyOptional({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  avatar: string | null;
}

export class PrivateUserDto {
  @ApiProperty({
    description: 'User ID',
    example: 'clx1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'User full name',
    example: 'John Doe',
    nullable: true,
  })
  fullName: string | null;

  @ApiPropertyOptional({
    description: 'User phone number',
    example: '+84123456789',
    nullable: true,
  })
  phone: string | null;

  @ApiPropertyOptional({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  avatar: string | null;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.CUSTOMER,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Email verification status',
    example: true,
  })
  emailVerified: boolean;

  @ApiProperty({
    description: 'Phone verification status',
    example: false,
  })
  phoneVerified: boolean;

  @ApiProperty({
    description: '2FA enabled status',
    example: false,
  })
  mfaEnabled: boolean;

  @ApiProperty({
    description: 'Account creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class PaginationDto {
  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of items',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
  })
  totalPages: number;
}

export class UserListResponseDto {
  @ApiProperty({
    description: 'List of users',
    type: [PrivateUserDto],
  })
  users: PrivateUserDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationDto,
  })
  pagination: PaginationDto;
}

export class SearchUsersResponseDto {
  @ApiProperty({
    description:
      'List of users (public or private data based on requester role)',
    oneOf: [
      { type: 'array', items: { $ref: '#/components/schemas/PublicUserDto' } },
      { type: 'array', items: { $ref: '#/components/schemas/PrivateUserDto' } },
    ],
  })
  users: PublicUserDto[] | PrivateUserDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationDto,
  })
  pagination: PaginationDto;
}
