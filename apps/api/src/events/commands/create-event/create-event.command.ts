import { EventType } from '@generated/prisma';

export class CreateEventCommand {
  constructor(
    public readonly title: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly type: EventType,
    public readonly description?: string,
    public readonly location?: string,
    public readonly organizer?: string,
    public readonly attendees?: number,
    public readonly surveyLink?: string,
    public readonly createdBy?: string
  ) {}
}
