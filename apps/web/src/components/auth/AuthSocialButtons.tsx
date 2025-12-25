'use client';

import { useOAuth, useRedirect } from '@/lib/api/hooks/use-auth';
import type { OAuthProvider } from '@/types/auth.types';

import { SocialButton } from './SocialButton';

export function AuthSocialButtons() {
  const { redirectUrl } = useRedirect();
  const { initiateOAuth, isLoading } = useOAuth();

  const handleOAuth = (provider: OAuthProvider) => {
    initiateOAuth(provider, redirectUrl);
  };

  return (
    <div className="space-y-3">
      <SocialButton
        platform="google"
        label="Continue with Google"
        onClick={() => handleOAuth('google')}
        disabled={isLoading}
      />
      <SocialButton
        platform="github"
        label="Continue with GitHub"
        onClick={() => handleOAuth('github')}
        disabled={isLoading}
      />
    </div>
  );
}
