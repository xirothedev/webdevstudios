import Link from 'next/link';

interface AuthFooterProps {
  variant?: 'login' | 'signup';
}

export function AuthFooter({ variant = 'login' }: AuthFooterProps) {
  return (
    <>
      <div className="text-center text-sm text-white/60">
        {variant === 'login' ? (
          <>
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/signup"
              className="text-white hover:text-white/80"
            >
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link href="/auth/login" className="text-white hover:text-white/80">
              Sign in
            </Link>
          </>
        )}
      </div>

      <div className="text-center text-xs text-white/40">
        {variant === 'signup' ? (
          <>
            By creating an account, you agree to the{' '}
            <Link href="/terms" className="hover:text-white/70">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="hover:text-white/70">
              Privacy Policy
            </Link>
          </>
        ) : (
          <>
            <Link href="/terms" className="hover:text-white/70">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="hover:text-white/70">
              Privacy Policy
            </Link>
          </>
        )}
      </div>
    </>
  );
}
