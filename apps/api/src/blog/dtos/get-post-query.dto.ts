import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class GetBlogPostQueryDto {
  @ApiPropertyOptional({
    description: 'Include markdown content',
    example: false,
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeContent?: boolean = false;
}
