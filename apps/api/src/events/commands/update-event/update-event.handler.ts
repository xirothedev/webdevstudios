import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { EventRepository } from '../../infrastructure/event.repository';
import { UpdateEventCommand } from './update-event.command';

@CommandHandler(UpdateEventCommand)
export class UpdateEventHandler implements ICommandHandler<UpdateEventCommand> {
  constructor(private readonly eventRepository: EventRepository) {}

  async execute(command: UpdateEventCommand) {
    const event = await this.eventRepository.findById(command.id);
    if (!event) {
      throw new NotFoundException(`Event with ID ${command.id} not found`);
    }

    return this.eventRepository.update(command.id, {
      title: command.title,
      description: command.description,
      startDate: command.startDate,
      endDate: command.endDate,
      location: command.location,
      type: command.type,
      organizer: command.organizer,
      attendees: command.attendees,
      surveyLink: command.surveyLink,
    });
  }
}
