'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { useVerifyEmail } from '@/lib/api/hooks/use-auth';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const verifyEmailMutation = useVerifyEmail();

  useEffect(() => {
    if (
      token &&
      !verifyEmailMutation.isPending &&
      !verifyEmailMutation.isSuccess &&
      !verifyEmailMutation.isError
    ) {
      verifyEmailMutation.mutate(token);
    }
  }, [token, verifyEmailMutation]);

  if (!token) {
    return (
      <AuthLayout variant="login">
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-semibold text-white">
            Token không hợp lệ
          </h2>
          <p className="text-white/60">
            Link xác thực email không hợp lệ hoặc đã hết hạn.
          </p>
          <Button
            onClick={() => router.push('/auth/login')}
            className="h-12 w-full rounded-lg bg-white text-black hover:bg-white/90"
          >
            Quay lại đăng nhập
          </Button>
        </div>
      </AuthLayout>
    );
  }

  if (verifyEmailMutation.isSuccess) {
    return (
      <AuthLayout variant="login">
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-semibold text-white">
            Xác thực thành công!
          </h2>
          <p className="text-white/60">
            Email của bạn đã được xác thực. Đang chuyển hướng đến trang đăng
            nhập...
          </p>
        </div>
      </AuthLayout>
    );
  }

  if (verifyEmailMutation.isError) {
    const errorMessage =
      verifyEmailMutation.error instanceof Error
        ? verifyEmailMutation.error.message
        : 'Token không hợp lệ hoặc đã hết hạn';

    return (
      <AuthLayout variant="login">
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-semibold text-white">
            Xác thực thất bại
          </h2>
          <p className="text-white/60">{errorMessage}</p>
          <Button
            onClick={() => router.push('/auth/login')}
            className="h-12 w-full rounded-lg bg-white text-black hover:bg-white/90"
          >
            Quay lại đăng nhập
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout variant="login">
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-semibold text-white">
          Đang xác thực email...
        </h2>
        <p className="text-white/60">
          Vui lòng đợi trong khi chúng tôi xác thực email của bạn.
        </p>
        {verifyEmailMutation.isPending && (
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout variant="login">
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-semibold text-white">Đang tải...</h2>
          </div>
        </AuthLayout>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
