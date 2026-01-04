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
