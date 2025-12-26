import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { User } from 'generated/prisma/client';

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
