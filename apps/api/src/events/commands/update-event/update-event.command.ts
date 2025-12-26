import { EventType } from '@generated/prisma';

export class UpdateEventCommand {
  constructor(
    public readonly id: string,
    public readonly title?: string,
    public readonly description?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly location?: string,
    public readonly type?: EventType,
    public readonly organizer?: string,
    public readonly attendees?: number,
    public readonly surveyLink?: string
  ) {}
}
