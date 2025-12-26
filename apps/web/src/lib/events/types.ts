export enum EventType {
  MEETING = 'MEETING',
  WORKSHOP = 'WORKSHOP',
  SOCIAL = 'SOCIAL',
  COMPETITION = 'COMPETITION',
  SURVEY = 'SURVEY',
  OTHER = 'OTHER',
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  type: EventType;
  organizer?: string;
  attendees?: number;
  surveyLink?: string; // For SURVEY type events
}
