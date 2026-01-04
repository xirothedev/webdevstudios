/**
 * Copyright (c) 2026 Xiro The Dev <lethanhtrung.trungle@gmail.com>
 *
 * Source Available License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to:
 * - View and study the Software for educational purposes
 * - Fork this repository on GitHub for personal reference
 * - Share links to this repository
 *
 * THE FOLLOWING ARE PROHIBITED:
 * - Using the Software in production or commercial applications
 * - Copying substantial portions of the Software into other projects
 * - Distributing modified versions of the Software
 * - Removing or altering copyright notices
 *
 * For commercial licensing or usage permissions, contact: lethanhtrung.trungle@gmail.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

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
