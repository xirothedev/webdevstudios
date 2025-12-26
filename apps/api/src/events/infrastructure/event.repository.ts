import { Event, EventType, Prisma } from '@generated/prisma';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class EventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    location?: string;
    type: EventType;
    organizer?: string;
    attendees?: number;
    surveyLink?: string;
    createdBy?: string;
  }): Promise<Event> {
    return this.prisma.event.create({
      data,
    });
  }

  async findById(id: string): Promise<Event | null> {
    return this.prisma.event.findUnique({
      where: { id },
    });
  }

  async findAll(filters?: {
    startDate?: Date;
    endDate?: Date;
    types?: EventType[];
  }): Promise<Event[]> {
    const where: Prisma.EventWhereInput = {};

    if (filters?.startDate || filters?.endDate) {
      where.OR = [];
      if (filters.startDate) {
        where.OR.push({
          endDate: { gte: filters.startDate },
        });
      }
      if (filters.endDate) {
        where.OR.push({
          startDate: { lte: filters.endDate },
        });
      }
    }

    if (filters?.types && filters.types.length > 0) {
      where.type = { in: filters.types };
    }

    return this.prisma.event.findMany({
      where,
      orderBy: { startDate: 'asc' },
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      startDate?: Date;
      endDate?: Date;
      location?: string;
      type?: EventType;
      organizer?: string;
      attendees?: number;
      surveyLink?: string;
    }
  ): Promise<Event> {
    return this.prisma.event.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Event> {
    return this.prisma.event.delete({
      where: { id },
    });
  }
}
