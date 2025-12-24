import { ApiProperty } from '@nestjs/swagger';
import { OAuthProvider } from 'generated/prisma';

export class SocialUserDto {
  @ApiProperty({
    description: 'OAuth provider',
    enum: OAuthProvider,
    example: OAuthProvider.GOOGLE,
  })
  provider: OAuthProvider;

  @ApiProperty({
    description: 'Provider account ID',
    example: '123456789',
  })
  providerId: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    required: false,
    nullable: true,
  })
  email: string | null;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
    nullable: true,
  })
  firstName: string | null;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
    nullable: true,
  })
  lastName: string | null;

  @ApiProperty({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
    nullable: true,
  })
  avatar: string | null;

  @ApiProperty({
    description: 'OAuth access token',
    example: 'ya29.a0AfH6SMB...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'OAuth refresh token',
    example: '1//0g...',
    required: false,
    nullable: true,
  })
  refreshToken: string | null;
}
