import { OAuthProvider } from '@generated/prisma';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import axios from 'axios';
import { Profile, Strategy } from 'passport-github2';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GITHUB_CALLBACK_URL'),
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user: any) => void
  ): Promise<any> {
    const { id, displayName, username, photos } = profile;

    // Get user email (might need separate call)
    let email = profile.emails?.[0]?.value;
    if (!email) {
      try {
        const emailsResponse = await axios.get(
          'https://api.github.com/user/emails',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const primaryEmail = emailsResponse.data.find((e: any) => e.primary);
        email = primaryEmail?.email || emailsResponse.data[0]?.email;
      } catch {
        email = `${username}@users.noreply.github.com`;
      }
    }

    const user = {
      provider: OAuthProvider.GITHUB,
      providerId: id.toString(),
      email: email || `${username}@users.noreply.github.com`,
      name: displayName || username,
      picture: photos?.[0]?.value,
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}
