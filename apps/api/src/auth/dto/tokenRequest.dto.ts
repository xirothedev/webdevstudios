import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TokenRequestDto extends Request {
  @ApiProperty({
    description:
      'JWT token extracted from the request (may include "Bearer " prefix)',
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  userToken!: string;
}
