'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { OAuthRedirectHandler } from '@/components/auth/OAuthRedirectHandler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRegister } from '@/lib/api/hooks/use-auth';

// Validation schema with Zod
const signupSchema = z
  .object({
    fullName: z.string().min(1, 'Vui lòng nhập họ và tên'),
    email: z.email('Email không hợp lệ').min(1, 'Email là bắt buộc'),
    password: z
      .string()
      .min(1, 'Mật khẩu là bắt buộc')
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
    phone: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      phone: '',
    },
  });

  const registerMutation = useRegister();

  const onSubmit = (data: SignupFormData) => {
    // Remove confirmPassword before sending to API
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate({
      ...registerData,
      phone: registerData.phone?.trim() || undefined,
    });
  };

  const isLoading = isSubmitting || registerMutation.isPending;

  return (
    <AuthLayout variant="signup">
      <OAuthRedirectHandler />
      <div className="glass-card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-white/90"
            >
              Họ và tên
            </label>
            <Input
              id="fullName"
              type="text"
              placeholder="Nhập họ và tên của bạn"
              {...register('fullName')}
              disabled={isLoading}
              className="glass-input"
            />
            {errors.fullName && (
              <p className="text-sm text-red-400">{errors.fullName.message}</p>
            )}
          </div>

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
              placeholder="Tối thiểu 8 ký tự"
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
              placeholder="Nhập lại mật khẩu"
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

          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-white/90"
            >
              Số điện thoại <span className="text-white/50">(tùy chọn)</span>
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="Nhập số điện thoại"
              {...register('phone')}
              disabled={isLoading}
              className="glass-input"
            />
            {errors.phone && (
              <p className="text-sm text-red-400">{errors.phone.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="glass-button h-12 w-full text-base font-semibold"
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
