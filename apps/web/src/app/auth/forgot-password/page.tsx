'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRequestPasswordReset } from '@/lib/api/hooks/use-auth';

// Validation schema với Zod
const forgotPasswordSchema = z.object({
  email: z.email('Email không hợp lệ').min(1, 'Email là bắt buộc'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const requestPasswordResetMutation = useRequestPasswordReset();

  const onSubmit = (data: ForgotPasswordFormData) => {
    requestPasswordResetMutation.mutate(data.email);
  };

  const isLoading = isSubmitting || requestPasswordResetMutation.isPending;
  const isSuccess = requestPasswordResetMutation.isSuccess;

  return (
    <AuthLayout variant="login">
      <div className="glass-card">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-white drop-shadow-lg">
            Quên mật khẩu
          </h2>
          <p className="mt-2 text-sm text-white/70">
            Nhập email của bạn để nhận link reset mật khẩu
          </p>
        </div>

        {isSuccess ? (
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
                Email đã được gửi!
              </h3>
              <p className="text-sm text-white/70">
                Vui lòng kiểm tra email để nhận link reset mật khẩu. Nếu không
                thấy email, vui lòng kiểm tra thư mục spam.
              </p>
            </div>
            <Link href="/auth/login">
              <Button className="glass-button h-12 w-full text-base font-semibold">
                Quay lại đăng nhập
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white/90"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Nhập địa chỉ email của bạn"
                {...register('email')}
                disabled={isLoading}
                className="glass-input"
              />
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="glass-button h-12 w-full text-base font-semibold"
            >
              {isLoading ? 'Đang gửi...' : 'Gửi link reset mật khẩu'}
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
        )}
      </div>
    </AuthLayout>
  );
}
