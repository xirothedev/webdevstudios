import { OAuthProvider } from '@generated/prisma';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class OAuthCallbackDto {
  @ApiProperty({
    description: 'OAuth provider',
    enum: OAuthProvider,
    example: OAuthProvider.GOOGLE,
  })
  @IsEnum(OAuthProvider)
  @IsNotEmpty()
  provider: OAuthProvider;

  @ApiProperty({
    description: 'OAuth authorization code from provider',
    example: '4/0AeaYSHBw...',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({
    description: 'OAuth state parameter for CSRF protection',
    example: 'random-state-string',
  })
  @IsString()
  @IsOptional()
  state?: string;
}
