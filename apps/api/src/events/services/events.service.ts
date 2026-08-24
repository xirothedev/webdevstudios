import { Injectable, NotFoundException } from '@nestjs/common';
import { EventType } from '@prisma/client';

import { parseISO } from 'date-fns';

import { CreateEventDto, EventDto, UpdateEventDto } from '../dto';
import { EventRow } from '../events.types';
import { EventRepo } from '../repo';

@Injectable()
export class EventsService {
  constructor(private readonly eventRepository: EventRepo) {}

  async listEvents(filters?: {
    startDate?: Date;
    endDate?: Date;
    types?: EventType[];
  }): Promise<EventDto[]> {
    const events = await this.eventRepository.findAll(filters);
    return events.map((event) => this.toResponse(event));
  }

  async getEventById(id: string): Promise<EventDto> {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return this.toResponse(event);
  }

  async createEvent(dto: CreateEventDto, createdBy?: string): Promise<EventDto> {
    const event = await this.eventRepository.create({
      title: dto.title,
      description: dto.description,
      startDate: parseISO(dto.startDate),
      endDate: parseISO(dto.endDate),
      location: dto.location,
      type: dto.type,
      organizer: dto.organizer,
      attendees: dto.attendees,
      surveyLink: dto.surveyLink,
      createdBy,
    });
    return this.toResponse(event);
  }

  async updateEvent(id: string, dto: UpdateEventDto): Promise<EventDto> {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    const updated = await this.eventRepository.update(id, {
      title: dto.title,
      description: dto.description,
      startDate: dto.startDate ? parseISO(dto.startDate) : undefined,
      endDate: dto.endDate ? parseISO(dto.endDate) : undefined,
      location: dto.location,
      type: dto.type,
      organizer: dto.organizer,
      attendees: dto.attendees,
      surveyLink: dto.surveyLink,
    });
    return this.toResponse(updated);
  }

  async deleteEvent(id: string): Promise<EventDto> {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return this.toResponse(await this.eventRepository.delete(id));
  }

  // ponytail: null→undefined shaping can't come from a select; mirrors old EventDto.fromEntity
  private toResponse(event: EventRow): EventDto {
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
