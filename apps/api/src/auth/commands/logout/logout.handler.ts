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
