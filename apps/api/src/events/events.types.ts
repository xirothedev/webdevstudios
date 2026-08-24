import { Event } from '@prisma/client';

// ponytail: repo selects every Event column, so the row is just the model
export type EventRow = Event;
