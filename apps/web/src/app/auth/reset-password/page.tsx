'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthLoading } from '@/components/auth/AuthLoading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useResetPassword } from '@/lib/api/hooks/use-auth';

// Validation schema với Zod
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Mật khẩu là bắt buộc')
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
    confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const resetPasswordMutation = useResetPassword();

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!token) {
      return;
    }
    resetPasswordMutation.mutate({
      token,
      newPassword: data.password,
    });
  };

  const isLoading = isSubmitting || resetPasswordMutation.isPending;
  const isSuccess = resetPasswordMutation.isSuccess;

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
    }
  }, [token, router]);

  if (!token) {
    return (
      <AuthLayout variant="login">
        <div className="glass-card">
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">
              Token không hợp lệ
            </h2>
            <p className="text-white/70">
              Link reset mật khẩu không hợp lệ hoặc đã hết hạn.
            </p>
            <Link href="/auth/login">
              <Button className="glass-button h-12 w-full text-base font-semibold">
                Quay lại đăng nhập
              </Button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout variant="login">
        <div className="glass-card">
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
              <svg
                className="h-8 w-8 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                Đặt lại mật khẩu thành công!
              </h3>
              <p className="text-sm text-white/70">
                Mật khẩu của bạn đã được cập nhật. Đang chuyển hướng đến trang
                đăng nhập...
              </p>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout variant="login">
      <div className="glass-card">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-white drop-shadow-lg">
            Đặt lại mật khẩu
          </h2>
          <p className="mt-2 text-sm text-white/70">
            Nhập mật khẩu mới của bạn
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white/90"
            >
              Mật khẩu mới
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
              {...register('password')}
              disabled={isLoading}
              className="glass-input"
            />
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-white/90"
            >
              Xác nhận mật khẩu
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              {...register('confirmPassword')}
              disabled={isLoading}
              className="glass-input"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {resetPasswordMutation.isError && (
            <div className="rounded-lg bg-red-500/20 p-3 text-sm text-red-400">
              {resetPasswordMutation.error instanceof Error
                ? resetPasswordMutation.error.message
                : 'Token không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.'}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="glass-button h-12 w-full text-base font-semibold"
          >
            {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </Button>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout variant="login">
          <AuthLoading />
        </AuthLayout>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
