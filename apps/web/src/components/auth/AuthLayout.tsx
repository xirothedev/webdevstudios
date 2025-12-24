import { AuthFooter } from './AuthFooter';
import { AuthHeader } from './AuthHeader';
import { AuthSocialButtons } from './AuthSocialButtons';
import { AuthWelcome } from './AuthWelcome';

interface AuthLayoutProps {
  children: React.ReactNode;
  variant?: 'login' | 'signup';
}

export function AuthLayout({ children, variant = 'login' }: AuthLayoutProps) {
  return (
    <div className="bg-[#0b0a05] text-white">
      <AuthHeader />

      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-[520px] space-y-8">
          <AuthWelcome />
          <AuthSocialButtons />
          {children}
          <AuthFooter variant={variant} />
        </div>
      </main>
    </div>
  );
}
