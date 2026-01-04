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

import { User } from '@generated/prisma';
import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  serializeUser(user: User, done: (err: any, user?: User) => void) {
    done(null, user);
  }

  async deserializeUser(
    user: User,
    done: (err: any, user?: User | null) => void
  ) {
    try {
      const data = await this.prisma.user.findUnique({
        where: { id: user.id },
      });
      done(null, data);
    } catch (error) {
      done(error);
    }
  }
}
