import { Prisma } from '@prisma/client';

export type { EventRow } from '../events.types';

export const EVENT_SELECT = {
  id: true,
  title: true,
  description: true,
  startDate: true,
  endDate: true,
  location: true,
  type: true,
  organizer: true,
  attendees: true,
  surveyLink: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.EventSelect;
