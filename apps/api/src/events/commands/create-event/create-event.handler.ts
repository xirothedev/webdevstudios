import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { EventRepository } from '../../infrastructure/event.repository';
import { CreateEventCommand } from './create-event.command';

@CommandHandler(CreateEventCommand)
export class CreateEventHandler implements ICommandHandler<CreateEventCommand> {
  constructor(private readonly eventRepository: EventRepository) {}

  async execute(command: CreateEventCommand) {
    return this.eventRepository.create({
      title: command.title,
      description: command.description,
      startDate: command.startDate,
      endDate: command.endDate,
      location: command.location,
      type: command.type,
      organizer: command.organizer,
      attendees: command.attendees,
      surveyLink: command.surveyLink,
      createdBy: command.createdBy,
    });
  }
}
