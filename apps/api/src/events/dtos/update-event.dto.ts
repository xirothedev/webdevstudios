import { EventType } from '@generated/prisma';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateEventDto {
  @ApiPropertyOptional({ description: 'Tiêu đề sự kiện' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Mô tả sự kiện' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Ngày giờ bắt đầu' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Ngày giờ kết thúc' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Địa điểm' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({ description: 'Loại sự kiện', enum: EventType })
  @IsEnum(EventType)
  @IsOptional()
  type?: EventType;

  @ApiPropertyOptional({ description: 'Người tổ chức' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  organizer?: string;

  @ApiPropertyOptional({ description: 'Số người tham gia' })
  @IsInt()
  @Min(0)
  @IsOptional()
  attendees?: number;

  @ApiPropertyOptional({ description: 'Link khảo sát (Google Form)' })
  @IsUrl()
  @IsOptional()
  surveyLink?: string;
}
