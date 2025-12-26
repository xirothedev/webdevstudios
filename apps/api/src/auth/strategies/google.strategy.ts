import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { OAuthProvider } from 'generated/prisma/client';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ): Promise<any> {
    const { id, emails, name, photos } = profile;
    const email = emails?.[0]?.value || '';
    const userName =
      name?.givenName && name?.familyName
        ? `${name.givenName} ${name.familyName}`
        : name?.givenName || name?.familyName || email;
    const user = {
      provider: OAuthProvider.GOOGLE,
      providerId: id,
      email,
      name: userName,
      picture: photos?.[0]?.value,
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}
