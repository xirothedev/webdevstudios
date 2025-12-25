'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthLayout } from '@/components/auth/AuthLayout';
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <label className="space-y-2 text-sm text-white/80">
          <span>Email</span>
          <Input
            type="email"
            placeholder="Your email address"
            {...register('email')}
            disabled={isLoading}
            className="h-12"
          />
          {errors.email && (
            <p className="text-sm text-red-400">{errors.email.message}</p>
          )}
        </label>

        <label className="space-y-2 text-sm text-white/80">
          <span>Password</span>
          <Input
            type="password"
            placeholder="Your password"
            {...register('password')}
            disabled={isLoading}
            className="h-12"
          />
          {errors.password && (
            <p className="text-sm text-red-400">{errors.password.message}</p>
          )}
        </label>

        <div className="mt-2 flex items-center justify-between">
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
                    ? 'border-wds-accent bg-wds-accent'
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
            <span className="select-none">Remember me</span>
          </label>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-lg bg-white text-black hover:bg-white/90 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
        </Button>
      </form>
    </AuthLayout>
  );
}
