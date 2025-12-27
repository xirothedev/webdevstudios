'use client';

import { CheckCircle2, Info, Loader2 } from 'lucide-react';
import { useState } from 'react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { useUpdateProfile } from '@/lib/api/hooks/use-user';
import { cn } from '@/lib/utils';
import type { User } from '@/types/auth.types';

interface ProfileFormProps {
  user: User;
  className?: string;
}

// Light theme Input component for profile form
function LightInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'flex h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 transition-all placeholder:text-gray-400',
        'focus:border-wds-accent focus:ring-wds-accent/20 focus:ring-2 focus:outline-none',
        'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

// Label component
function Label({
  htmlFor,
  children,
  required,
  className,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('text-sm font-semibold text-gray-900', className)}
    >
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}

// Helper text component
function HelperText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn('text-xs text-gray-500', className)}>{children}</p>;
}

// Error text component
function ErrorText({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <p id={id} className={cn('text-xs text-red-600', className)}>
      {children}
    </p>
  );
}

// Verification badge component
function VerificationBadge({
  verified,
  label,
}: {
  verified: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {verified ? (
        <>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span className="text-xs font-medium text-green-600">{label}</span>
        </>
      ) : (
        <>
          <Info className="h-4 w-4 text-gray-400" />
          <span className="text-xs font-medium text-gray-500">
            Chưa {label.toLowerCase()}
          </span>
        </>
      )}
    </div>
  );
}

export function ProfileForm({ user, className }: ProfileFormProps) {
  const [fullName, setFullName] = useState(user.fullName || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [errors, setErrors] = useState<{
    fullName?: string;
    phone?: string;
  }>({});

  const updateProfile = useUpdateProfile();

  const validate = (): boolean => {
    const newErrors: { fullName?: string; phone?: string } = {};

    // Validate fullName
    if (!fullName.trim()) {
      newErrors.fullName = 'Họ tên là bắt buộc';
    } else if (fullName.trim().length > 100) {
      newErrors.fullName = 'Họ tên không được vượt quá 100 ký tự';
    }

    // Validate phone (optional but if provided, check format)
    if (phone && phone.length > 15) {
      newErrors.phone = 'Số điện thoại không được vượt quá 15 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    updateProfile.mutate({
      fullName: fullName.trim() || undefined,
      phone: phone.trim() || undefined,
    });
  };

  const hasChanges =
    fullName.trim() !== (user.fullName || '') ||
    phone.trim() !== (user.phone || '');

  const isLoading = updateProfile.isPending;

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* Email (Read-only) */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <LightInput
          id="email"
          type="email"
          value={user.email}
          disabled
          className="bg-gray-50 text-gray-600"
        />
        <div className="flex items-center justify-between">
          <HelperText>Email không thể thay đổi</HelperText>
          <VerificationBadge
            verified={user.emailVerified}
            label="Xác thực email"
          />
        </div>
      </div>

      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="fullName" required>
          Họ tên
        </Label>
        <LightInput
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (errors.fullName) {
              setErrors((prev) => ({ ...prev, fullName: undefined }));
            }
          }}
          placeholder="Nhập họ tên của bạn"
          maxLength={100}
          disabled={isLoading}
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? 'fullName-error' : undefined}
        />
        {errors.fullName ? (
          <ErrorText id="fullName-error">{errors.fullName}</ErrorText>
        ) : (
          <HelperText>Tối đa 100 ký tự</HelperText>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Số điện thoại</Label>
        <LightInput
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (errors.phone) {
              setErrors((prev) => ({ ...prev, phone: undefined }));
            }
          }}
          placeholder="Nhập số điện thoại của bạn"
          maxLength={15}
          disabled={isLoading}
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
        />
        {errors.phone ? (
          <ErrorText id="phone-error">{errors.phone}</ErrorText>
        ) : (
          <div className="flex items-center justify-between">
            <HelperText>Tối đa 15 ký tự</HelperText>
            <VerificationBadge
              verified={user.phoneVerified}
              label="Xác thực số điện thoại"
            />
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="submit"
          disabled={!hasChanges || isLoading}
          className="bg-wds-accent hover:bg-wds-accent/90 text-black"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang lưu...</span>
            </>
          ) : (
            'Lưu thay đổi'
          )}
        </Button>
      </div>
    </form>
  );
}
