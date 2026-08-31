/**
 * Copyright (c) 2026 Xiro The Dev <lethanhtrung.trungle@gmail.com>
 *
 * Source Available License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to:
 * - View and study the Software for educational purposes
 * - Fork this repository on GitHub for personal reference
 * - Share links to this repository on GitHub
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

import { EventType } from '@/lib/events/types';

import { apiClient } from '../api-client';

export interface ApiEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  type: EventType;
  organizer?: string;
  attendees?: number;
  surveyLink?: string;
  createdAt: string;
  updatedAt: string;
}

export const eventsApi = {
  /**
   * Get all events
   */
  async getEvents(): Promise<ApiEvent[]> {
    const response = await apiClient.get<{ data: ApiEvent[] }>('/events');
    return response.data.data;
  },
};
