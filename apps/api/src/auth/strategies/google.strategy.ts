import { User } from '@generated/prisma';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google-auth') {
  constructor(readonly config: ConfigService) {
    const options = {
      clientID: config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: config.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
      prompt: 'consent',
      accessType: 'offline',
    };
    super(options);
  }

  authorizationParams(): { [key: string]: string } {
    return {
      access_type: 'offline',
      prompt: 'consent',
    };
  }

  async validate(
    _access_token: string,
    _refresh_token: string,
    profile: Profile,
    cb: VerifyCallback
  ) {
    const user = {
      id: profile.id, // Google user ID - needed for providerId
      email: profile.emails![0].value,
      fullName:
        `${profile.name?.givenName || ''} ${profile.name?.middleName || ''} ${profile.name?.familyName || ''}`.trim() ||
        undefined,
      avatar: profile.photos![0].value,
      role: 'CUSTOMER' as const,
      emailVerified: true,
    };

    cb(null, user as unknown as User);
  }
}
