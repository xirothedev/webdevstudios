import { OAuthProvider } from '@generated/prisma';
import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { hash } from 'argon2';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

import { PrismaService } from '@/prisma/prisma.service';

import { Payload } from './auth.interface';

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService
  ) {}

  async generateTokenFromUser(
    user: Payload,
    tokenType: TokenType
  ): Promise<string> {
    const options: JwtSignOptions = {
      secret: this.config.getOrThrow<string>(
        tokenType === TokenType.ACCESS
          ? 'JWT_SECRET_KEY'
          : 'JWT_REFRESH_TOKEN_SECRET_KEY'
      ),
      expiresIn: this.config.getOrThrow<number>(
        tokenType === TokenType.ACCESS
          ? 'JWT_ACCESS_TOKEN_EXPIRES_IN'
          : 'JWT_REFRESH_TOKEN_EXPIRES_IN'
      ),
    };
    return this.jwt.sign(
      {
        sub: user.sub,
        email: user.email,
        role: user.role,
      },
      options
    );
  }

  async extractUserFromToken(
    token: string,
    tokenType: TokenType
  ): Promise<Payload> {
    const options: JwtVerifyOptions = {
      secret: this.config.getOrThrow<string>(
        tokenType === TokenType.ACCESS
          ? 'JWT_SECRET_KEY'
          : 'JWT_REFRESH_TOKEN_SECRET_KEY'
      ),
    };

    return this.jwt.verify(token, options);
  }

  async createUserSession(user: Payload, refreshToken: string) {
    await this.prisma.session.create({
      data: {
        userId: user.sub,
        token: await hash(crypto.randomUUID()),
        expiresAt: new Date(
          Date.now() +
            1000 *
              this.config.getOrThrow<number>('JWT_REFRESH_TOKEN_EXPIRES_IN')
        ),
        refreshToken: await hash(refreshToken),
      },
    });
  }

  async updateUserSession(user: Payload, refreshToken: string) {
    this.prisma.session.updateMany({
      where: { userId: user.sub },
      data: {
        refreshToken: await hash(refreshToken),
      },
    });
  }

  async deleteUserSession(userId: string) {
    this.prisma.session.deleteMany({
      where: { userId },
    });
  }

  async findUserById(userId: string, email: string) {
    return this.prisma.user.findUnique({
      where: { id: userId, email },
    });
  }

  async createUser(email: string, password?: string) {
    const hashedPassword = password ? await hash(password) : undefined;

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return user;
  }

  async findExternalAccount(provider: OAuthProvider, providerId: string) {
    return this.prisma.externalAccount.findFirst({
      where: {
        provider,
        providerId,
      },
      include: {
        user: true,
      },
    });
  }

  async createExternalAccount(req: any) {
    const { access_token, refresh_token, ...AuthInfo } = req.user;

    console.log(AuthInfo);

    const account = await this.findExternalAccount(
      AuthInfo.provider.toUpperCase(),
      AuthInfo.id
    );

    if (account) {
      return account;
    }
    console.log(1);

    const tokenInfo: AxiosResponse = await firstValueFrom(
      this.httpService.get(
        `https://oauth2.googleapis.com/tokeninfo?access_token=${access_token}`
      )
    );
    console.log(AuthInfo.provider);
    console.log(tokenInfo.data);

    let user = await this.findUserById(
      AuthInfo.userId,
      AuthInfo.emails[0].value
    );

    if (!user) {
      try {
        user = await this.createUser(AuthInfo.emails[0].value);
      } catch {
        throw new InternalServerErrorException('Internal Server Error');
      }
    }

    const payload: any = {
      provider: 'GOOGLE',
      providerId: AuthInfo.id,
      providerEmail: AuthInfo.emails[0].value,
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: new Date(parseInt(tokenInfo.data.exp) * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: user.id,
    };

    const ExternalAccount = await this.prisma.externalAccount.create({
      data: payload,
    });

    return ExternalAccount;
  }
}
