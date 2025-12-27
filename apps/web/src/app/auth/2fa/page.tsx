'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthLoading } from '@/components/auth/AuthLoading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVerify2FA } from '@/lib/api/hooks/use-auth';

// Validation schema với Zod
const verify2FASchema = z.object({
  code: z
    .string()
    .min(1, 'Mã xác thực là bắt buộc')
    .regex(/^\d{6}$/, 'Mã xác thực phải có 6 chữ số'),
});

type Verify2FAFormData = z.infer<typeof verify2FASchema>;

function Verify2FAContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Verify2FAFormData>({
    resolver: zodResolver(verify2FASchema),
    defaultValues: {
      code: '',
    },
  });

  const verify2FAMutation = useVerify2FA();
  const code = watch('code');

  // Auto-submit when code has 6 digits
  useEffect(() => {
    if (code && code.length === 6 && !verify2FAMutation.isPending) {
      handleSubmit(onSubmit)();
    }
  }, [code, verify2FAMutation.isPending]);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const onSubmit = (data: Verify2FAFormData) => {
    verify2FAMutation.mutate({
      code: data.code,
      sessionId: sessionId || undefined,
    });
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setValue('code', value, { shouldValidate: true });
  };

  const isLoading = isSubmitting || verify2FAMutation.isPending;

  return (
    <AuthLayout variant="login">
      <div className="glass-card">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-white drop-shadow-lg">
            Xác thực 2FA
          </h2>
          <p className="mt-2 text-sm text-white/70">
            Nhập mã 6 chữ số từ ứng dụng xác thực của bạn
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="code"
              className="block text-sm font-medium text-white/90"
            >
              Mã xác thực
            </label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              placeholder="000000"
              maxLength={6}
              {...register('code')}
              onChange={handleCodeChange}
              disabled={isLoading}
              className="glass-input text-center text-2xl tracking-widest"
              ref={inputRef}
            />
            {errors.code && (
              <p className="text-sm text-red-400">{errors.code.message}</p>
            )}
          </div>

          {verify2FAMutation.isError && (
            <div className="rounded-lg bg-red-500/20 p-3 text-sm text-red-400">
              {verify2FAMutation.error instanceof Error
                ? verify2FAMutation.error.message
                : 'Mã xác thực không hợp lệ. Vui lòng thử lại.'}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="glass-button h-12 w-full text-base font-semibold"
          >
            {isLoading ? 'Đang xác thực...' : 'Xác thực'}
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

export default function Verify2FAPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout variant="login">
          <AuthLoading />
        </AuthLayout>
      }
    >
      <Verify2FAContent />
    </Suspense>
  );
}
