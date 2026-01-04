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
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { SessionRepository } from '../../infrastructure/session.repository';
import { GetSessionsQuery } from './get-sessions.query';

@Injectable()
@QueryHandler(GetSessionsQuery)
export class GetSessionsHandler implements IQueryHandler<GetSessionsQuery> {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(query: GetSessionsQuery) {
    const { userId } = query;

    const sessions = await this.sessionRepository.findByUserId(userId);

    return sessions.map((session) => ({
      id: session.id,
      device: session.device
        ? {
            id: session.deviceId,
            name: session.device?.name,
            type: session.device?.type,
            lastSeenAt: session.device?.lastSeenAt,
          }
        : null,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      status: session.status,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    }));
  }
}
