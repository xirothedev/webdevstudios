import { EventType } from '@generated/prisma';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class CreateEventDto {
  @ApiProperty({
    description: 'Tiêu đề sự kiện',
    example: 'Workshop: Next.js 16',
  })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ description: 'Mô tả sự kiện' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Ngày giờ bắt đầu',
    example: '2025-01-15T10:00:00Z',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Ngày giờ kết thúc',
    example: '2025-01-15T13:00:00Z',
  })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ description: 'Địa điểm', example: 'Phòng lab CNTT' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;

  @ApiProperty({
    description: 'Loại sự kiện',
    enum: EventType,
    example: EventType.WORKSHOP,
  })
  @IsEnum(EventType)
  type: EventType;

  @ApiPropertyOptional({
    description: 'Người tổ chức',
    example: 'Anh Minh - Tech Lead',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  organizer?: string;

  @ApiPropertyOptional({ description: 'Số người tham gia', example: 45 })
  @IsInt()
  @Min(0)
  @IsOptional()
  attendees?: number;

  @ApiPropertyOptional({
    description: 'Link khảo sát (Google Form) - chỉ dùng cho SURVEY type',
    example: 'https://forms.gle/example',
  })
  @IsUrl()
  @IsOptional()
  surveyLink?: string;
}
