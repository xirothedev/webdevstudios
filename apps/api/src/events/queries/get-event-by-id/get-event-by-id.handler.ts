import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { EventRepository } from '../../infrastructure/event.repository';
import { GetEventByIdQuery } from './get-event-by-id.query';

@QueryHandler(GetEventByIdQuery)
export class GetEventByIdHandler implements IQueryHandler<GetEventByIdQuery> {
  constructor(private readonly eventRepository: EventRepository) {}

  async execute(query: GetEventByIdQuery) {
    const event = await this.eventRepository.findById(query.id);
    if (!event) {
      throw new NotFoundException(`Event with ID ${query.id} not found`);
    }
    return event;
  }
}
