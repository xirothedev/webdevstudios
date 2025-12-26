import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PrismaService } from '../../../prisma/prisma.service';
import { DeleteUserCommand } from './delete-user.command';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeleteUserCommand): Promise<{ success: boolean }> {
    const { userId } = command;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hard delete - remove user and all related data (cascade)
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { success: true };
  }
}
