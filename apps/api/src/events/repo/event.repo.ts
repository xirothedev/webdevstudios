import { EventType, Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma';

import { EventRow } from '../events.types';

const EVENT_SELECT = {
  id: true,
  title: true,
  description: true,
  startDate: true,
  endDate: true,
  location: true,
  type: true,
  organizer: true,
  attendees: true,
  surveyLink: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.EventSelect;

@Injectable()
export class EventRepo {
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
  }): Promise<EventRow> {
    return this.prisma.event.create({ data, select: EVENT_SELECT });
  }

  async findById(id: string): Promise<EventRow | null> {
    return this.prisma.event.findUnique({ where: { id }, select: EVENT_SELECT });
  }

  async findAll(filters?: {
    startDate?: Date;
    endDate?: Date;
    types?: EventType[];
  }): Promise<EventRow[]> {
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
      select: EVENT_SELECT,
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
    },
  ): Promise<EventRow> {
    return this.prisma.event.update({ where: { id }, data, select: EVENT_SELECT });
  }

  async delete(id: string): Promise<EventRow> {
    return this.prisma.event.delete({ where: { id }, select: EVENT_SELECT });
  }
}
