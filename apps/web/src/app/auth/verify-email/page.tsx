'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

function VerifyEmailContent() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const { verifyEmail } = useAuth();
  const router = useRouter();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Token không hợp lệ');
      return;
    }

    const handleVerify = async () => {
      setIsVerifying(true);
      setError(null);

      try {
        await verifyEmail(token);
        setIsVerified(true);
        toast.success('Email đã được xác thực thành công!');
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Token không hợp lệ hoặc đã hết hạn';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsVerifying(false);
      }
    };

    handleVerify();
  }, [token, verifyEmail, router]);

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

  if (isVerified) {
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

  if (error) {
    return (
      <AuthLayout variant="login">
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-semibold text-white">
            Xác thực thất bại
          </h2>
          <p className="text-white/60">{error}</p>
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
        {isVerifying && (
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
