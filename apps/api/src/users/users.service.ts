import { User } from '@generated/prisma';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  // constructor() {}

  async getProfile(user: User) {
    return {
      message: 'Profile retrieved successfully',
      data: user,
      timestamp: Date.now(),
    };
  }
}
