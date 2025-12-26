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
            Chưa có tài khoản?{' '}
            <Link
              href="/auth/signup"
              className="text-white hover:text-white/80"
            >
              Đăng kí
            </Link>
          </>
        ) : (
          <>
            Đã có tài khoản?{' '}
            <Link href="/auth/login" className="text-white hover:text-white/80">
              Đăng nhập
            </Link>
          </>
        )}
      </div>

      <div className="text-center text-xs text-white/40">
        {variant === 'signup' ? (
          <>
            Bằng cách tạo tài khoản, bạn đồng ý với{' '}
            <Link href="/terms" className="hover:text-wds-accent text-white">
              Điều khoản dịch vụ
            </Link>{' '}
            và{' '}
            <Link href="/privacy" className="hover:text-wds-accent text-white">
              Chính sách bảo mật
            </Link>
          </>
        ) : (
          <>
            <Link href="/terms" className="hover:text-wds-accent text-white">
              Điều khoản dịch vụ
            </Link>{' '}
            và{' '}
            <Link href="/privacy" className="hover:text-wds-accent text-white">
              Chính sách bảo mật
            </Link>
          </>
        )}
      </div>
    </>
  );
}
