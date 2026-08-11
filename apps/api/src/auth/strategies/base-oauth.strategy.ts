import { Injectable } from '@nestjs/common';

export interface OAuthProfile {
  provider: string;
  providerId: string;
  email: string;
  name?: string;
  picture?: string;
}

@Injectable()
export abstract class BaseOAuthStrategy {
  protected normalizeEmail(email: string): string {
    return email?.trim().toLowerCase();
  }

  protected requireEmail(email: string, provider: string): void {
    if (!email) {
      throw new Error(`OAuth provider ${provider} did not return an email`);
    }
  }
}
