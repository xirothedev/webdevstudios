/**
 * Copyright (c) 2026 Xiro The Dev <lethanhtrung.trungle@gmail.com>
 *
 * Source Available License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to:
 * - View and study the Software for educational purposes
 * - Fork this repository on GitHub for personal reference
 * - Share links to this repository
 *
 * THE FOLLOWING ARE PROHIBITED:
 * - Using the Software in production or commercial applications
 * - Copying substantial portions of the Software into other projects
 * - Distributing modified versions of the Software
 * - Removing or altering copyright notices
 *
 * For commercial licensing or usage permissions, contact: lethanhtrung.trungle@gmail.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

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
