import type { User } from '@generated/prisma';
import { Controller, Get } from '@nestjs/common';

import { CurrentUser } from '@/common/decorators/current-user.decorator';

import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('@me')
  getProfile(@CurrentUser() user: User) {
    return this.usersService.getProfile(user);
  }
}
