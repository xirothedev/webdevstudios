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
