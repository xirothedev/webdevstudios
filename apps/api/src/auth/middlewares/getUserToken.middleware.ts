import { Injectable, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Response } from 'express';

import { TokenRequestDto } from '@/auth/dto/tokenRequest.dto';

@Injectable()
export class GetUserTokenMiddleware {
  use(req: TokenRequestDto, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    console.log(authHeader);

    if (!authHeader) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    req.userToken = token;
    next();
  }
}
