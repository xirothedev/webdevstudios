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
