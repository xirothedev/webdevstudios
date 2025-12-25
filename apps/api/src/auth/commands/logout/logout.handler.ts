import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SessionRepository } from '../../infrastructure/session.repository';
import { LogoutCommand } from './logout.command';

@Injectable()
@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(command: LogoutCommand): Promise<{ success: boolean }> {
    const { userId, sessionId } = command;

    if (sessionId) {
      // Revoke specific session
      await this.sessionRepository.revoke(sessionId);
    } else {
      // Revoke all sessions for user
      await this.sessionRepository.revokeAllByUserId(userId);
    }

    return { success: true };
  }
}
