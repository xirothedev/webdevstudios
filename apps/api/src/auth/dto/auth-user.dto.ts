import { UserRole } from '@generated/prisma';
import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
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
    description: 'User full name',
    example: 'John Doe',
    nullable: true,
  })
  fullName!: string | null;

  @ApiProperty({
    description: 'User avatar',
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  avatar!: string | null;

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
  createdAt!: Date;
}

export class AuthUserResponseDto {
  @ApiProperty({
    description: 'Message',
    example: 'User registered successfully',
  })
  message!: string;

  @ApiProperty({
    description: 'User data',
    type: AuthUserDto,
  })
  data!: AuthUserDto;

  @ApiProperty({
    description: 'Timestamp',
    example: 1719000000000,
    type: Number,
  })
  timestamp!: number;

  [x: string]: any;
}

export class GoogleAuthDto {}

export class VerifiedUserResponseDto {
  @ApiProperty({
    description: 'Message',
    example: 'User registered successfully',
  })
  message!: string;

  data!: null;

  @ApiProperty({
    description: 'Timestamp',
    example: 1719000000000,
    type: Number,
  })
  timestamp!: number;

  [x: string]: any;
}
