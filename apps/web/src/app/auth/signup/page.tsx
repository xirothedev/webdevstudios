'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRegister } from '@/lib/api/hooks/use-auth';

// Validation schema với Zod
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <label className="space-y-2 text-sm text-white/80">
          <span>Họ và tên</span>
          <Input
            type="text"
            placeholder="Nhập họ và tên của bạn"
            {...register('fullName')}
            disabled={isLoading}
            className="h-12"
          />
          {errors.fullName && (
            <p className="text-sm text-red-400">{errors.fullName.message}</p>
          )}
        </label>

        <label className="space-y-2 text-sm text-white/80">
          <span>Email</span>
          <Input
            type="email"
            placeholder="Nhập địa chỉ email của bạn"
            {...register('email')}
            disabled={isLoading}
            className="h-12"
          />
          {errors.email && (
            <p className="text-sm text-red-400">{errors.email.message}</p>
          )}
        </label>

        <label className="space-y-2 text-sm text-white/80">
          <span>Mật khẩu</span>
          <Input
            type="password"
            placeholder="Tối thiểu 8 ký tự"
            {...register('password')}
            disabled={isLoading}
            className="h-12"
          />
          {errors.password && (
            <p className="text-sm text-red-400">{errors.password.message}</p>
          )}
        </label>

        <label className="space-y-2 text-sm text-white/80">
          <span>Xác nhận mật khẩu</span>
          <Input
            type="password"
            placeholder="Nhập lại mật khẩu"
            {...register('confirmPassword')}
            disabled={isLoading}
            className="h-12"
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-400">
              {errors.confirmPassword.message}
            </p>
          )}
        </label>

        <label className="space-y-2 text-sm text-white/80">
          <span>Số điện thoại (tùy chọn)</span>
          <Input
            type="tel"
            placeholder="Nhập số điện thoại"
            {...register('phone')}
            disabled={isLoading}
            className="h-12"
          />
          {errors.phone && (
            <p className="text-sm text-red-400">{errors.phone.message}</p>
          )}
        </label>

        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-lg bg-white text-black hover:bg-white/90 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
        </Button>
      </form>
    </AuthLayout>
  );
}
