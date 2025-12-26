import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { EventRepository } from '../../infrastructure/event.repository';
import { ListEventsQuery } from './list-events.query';

@QueryHandler(ListEventsQuery)
export class ListEventsHandler implements IQueryHandler<ListEventsQuery> {
  constructor(private readonly eventRepository: EventRepository) {}

  async execute(query: ListEventsQuery) {
    return this.eventRepository.findAll({
      startDate: query.startDate,
      endDate: query.endDate,
      types: query.types,
    });
  }
}
