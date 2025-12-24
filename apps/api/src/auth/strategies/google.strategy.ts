import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google-auth') {
  constructor(private readonly config: ConfigService) {
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
    access_token: string,
    refresh_token: string,
    profile: any,
    cb: VerifyCallback
  ) {
    const data = {
      ...profile,
      access_token,
      refresh_token,
    };

    cb(null, data);
  }
}
