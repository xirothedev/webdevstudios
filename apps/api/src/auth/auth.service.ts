import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthUserDto } from './dto/auth-user.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  async generateTokenFromUser(user: AuthUserDto): Promise<string> {
    return this.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
