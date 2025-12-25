import { IQuery } from '@nestjs/cqrs';

export class GetSessionsQuery implements IQuery {
  constructor(public readonly userId: string) {}
}
