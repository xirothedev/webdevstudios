import { SocialButton } from './SocialButton';

export function AuthSocialButtons() {
  return (
    <div className="space-y-3">
      <SocialButton platform="google" label="Continue with Google" />
      <SocialButton platform="github" label="Continue with GitHub" />
    </div>
  );
}
