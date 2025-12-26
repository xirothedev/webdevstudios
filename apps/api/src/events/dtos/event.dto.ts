import { Event, EventType } from '@generated/prisma';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EventDto {
  @ApiProperty({ description: 'ID sự kiện' })
  id: string;

  @ApiProperty({ description: 'Tiêu đề sự kiện' })
  title: string;

  @ApiPropertyOptional({ description: 'Mô tả sự kiện' })
  description?: string;

  @ApiProperty({ description: 'Ngày giờ bắt đầu' })
  startDate: Date;

  @ApiProperty({ description: 'Ngày giờ kết thúc' })
  endDate: Date;

  @ApiPropertyOptional({ description: 'Địa điểm' })
  location?: string;

  @ApiProperty({ description: 'Loại sự kiện', enum: EventType })
  type: EventType;

  @ApiPropertyOptional({ description: 'Người tổ chức' })
  organizer?: string;

  @ApiPropertyOptional({ description: 'Số người tham gia' })
  attendees?: number;

  @ApiPropertyOptional({ description: 'Link khảo sát (Google Form)' })
  surveyLink?: string;

  @ApiPropertyOptional({ description: 'ID người tạo' })
  createdBy?: string;

  @ApiProperty({ description: 'Ngày tạo' })
  createdAt: Date;

  @ApiProperty({ description: 'Ngày cập nhật' })
  updatedAt: Date;

  static fromEntity(event: Event): EventDto {
    return {
      id: event.id,
      title: event.title,
      description: event.description ?? undefined,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location ?? undefined,
      type: event.type,
      organizer: event.organizer ?? undefined,
      attendees: event.attendees ?? undefined,
      surveyLink: event.surveyLink ?? undefined,
      createdBy: event.createdBy ?? undefined,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }
}
