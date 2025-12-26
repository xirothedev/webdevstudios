import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { EventRepository } from '../../infrastructure/event.repository';
import { DeleteEventCommand } from './delete-event.command';

@CommandHandler(DeleteEventCommand)
export class DeleteEventHandler implements ICommandHandler<DeleteEventCommand> {
  constructor(private readonly eventRepository: EventRepository) {}

  async execute(command: DeleteEventCommand) {
    const event = await this.eventRepository.findById(command.id);
    if (!event) {
      throw new NotFoundException(`Event with ID ${command.id} not found`);
    }

    return this.eventRepository.delete(command.id);
  }
}
