import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Commands
import { CreateEventHandler } from './commands/create-event/create-event.handler';
import { DeleteEventHandler } from './commands/delete-event/delete-event.handler';
import { UpdateEventHandler } from './commands/update-event/update-event.handler';
// Controller
import { EventsController } from './events.controller';
// Repository
import { EventRepository } from './infrastructure/event.repository';
// Queries
import { GetEventByIdHandler } from './queries/get-event-by-id/get-event-by-id.handler';
import { ListEventsHandler } from './queries/list-events/list-events.handler';

const CommandHandlers = [
  CreateEventHandler,
  UpdateEventHandler,
  DeleteEventHandler,
];

const QueryHandlers = [ListEventsHandler, GetEventByIdHandler];

@Module({
  imports: [CqrsModule],
  controllers: [EventsController],
  providers: [...CommandHandlers, ...QueryHandlers, EventRepository],
  exports: [EventRepository],
})
export class EventsModule {}
