import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class Verify2FADto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'Code must be 6 digits' })
  code: string;

  @IsString()
  @IsOptional()
  sessionId?: string;
}
