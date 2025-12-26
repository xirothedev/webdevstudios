'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { OAuthRedirectHandler } from '@/components/auth/OAuthRedirectHandler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLogin } from '@/lib/api/hooks/use-auth';

// Validation schema với Zod
const loginSchema = z.object({
  email: z.email('Email không hợp lệ').min(1, 'Email là bắt buộc'),
  password: z
    .string()
    .min(1, 'Mật khẩu là bắt buộc')
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const loginMutation = useLogin();
  const rememberMe = watch('rememberMe');

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const isLoading = isSubmitting || loginMutation.isPending;

  return (
    <AuthLayout variant="login">
      <OAuthRedirectHandler />
      <div className="glass-card">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-white drop-shadow-lg">
            Đăng nhập
          </h2>
          <p className="mt-2 text-sm text-white/70">Chào mừng bạn quay lại</p>
        </div>

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

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white/90"
            >
              Mật khẩu
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Nhập mật khẩu của bạn"
              {...register('password')}
              disabled={isLoading}
              className="glass-input"
            />
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password.message}</p>
            )}
            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-white/70 transition-colors hover:text-white"
              >
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <label
              htmlFor="rememberMe"
              className="flex cursor-pointer items-center gap-3 text-sm text-white/80 transition-colors hover:text-white"
            >
              <div className="relative">
                <input
                  id="rememberMe"
                  type="checkbox"
                  {...register('rememberMe')}
                  disabled={isLoading}
                  className="sr-only"
                />
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${
                    rememberMe
                      ? 'border-orange-500 bg-orange-500'
                      : 'border-white/20 bg-white/5'
                  } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <svg
                    className={`h-3.5 w-3.5 text-black transition-opacity ${
                      rememberMe ? 'opacity-100' : 'opacity-0'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <span className="select-none">Ghi nhớ đăng nhập</span>
            </label>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="glass-button h-12 w-full text-base font-semibold"
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
