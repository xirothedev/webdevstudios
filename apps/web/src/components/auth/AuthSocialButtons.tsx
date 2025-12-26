'use client';

import { useOAuth } from '@/lib/api/hooks/use-auth';
import type { OAuthProvider } from '@/types/auth.types';

import { SocialButton } from './SocialButton';

export function AuthSocialButtons() {
  const { initiateOAuth, isLoading } = useOAuth();

  const handleOAuth = (provider: OAuthProvider) => {
    initiateOAuth(provider);
  };

  return (
    <div className="space-y-3">
      <SocialButton
        platform="google"
        label="Tiếp tục với Google"
        onClick={() => handleOAuth('google')}
        disabled={isLoading}
      />
      <SocialButton
        platform="github"
        label="Tiếp tục với GitHub"
        onClick={() => handleOAuth('github')}
        disabled={isLoading}
      />
    </div>
  );
}
