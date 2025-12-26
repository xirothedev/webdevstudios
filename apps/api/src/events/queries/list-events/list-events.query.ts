import { EventType } from '@generated/prisma';

export class ListEventsQuery {
  constructor(
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly types?: EventType[]
  ) {}
}
