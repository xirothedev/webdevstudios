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
