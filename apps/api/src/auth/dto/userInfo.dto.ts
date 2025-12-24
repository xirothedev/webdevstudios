import { UserRole } from '@generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class userInfoDto {
  @ApiProperty({
    description: 'User ID',
    example: 'clx1234567890abcdef',
  })
  id!: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
    nullable: true,
  })
  fullName?: string | null;

  @ApiProperty({
    description: 'Avatar image URL',
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  avatar?: string | null;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.CUSTOMER,
  })
  role!: UserRole;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
    type: Date,
  })
  createdAt?: Date;
}
