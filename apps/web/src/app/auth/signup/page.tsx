'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const validateForm = (): boolean => {
    if (!fullName.trim()) {
      toast.error('Vui lòng nhập họ và tên');
      return false;
    }

    if (!email.trim()) {
      toast.error('Vui lòng nhập email');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Email không hợp lệ');
      return false;
    }

    if (password.length < 8) {
      toast.error('Mật khẩu phải có ít nhất 8 ký tự');
      return false;
    }

    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email,
        password,
        fullName,
        phone: phone.trim() || undefined,
      });

      toast.success(
        'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.'
      );
      router.push('/auth/login');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Đăng ký thất bại. Vui lòng thử lại.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout variant="signup">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="space-y-2 text-sm text-white/80">
          <span>Họ và tên</span>
          <Input
            type="text"
            placeholder="Nhập họ và tên của bạn"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={isLoading}
            className="h-12"
          />
        </label>

        <label className="space-y-2 text-sm text-white/80">
          <span>Email</span>
          <Input
            type="email"
            placeholder="Nhập địa chỉ email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="h-12"
          />
        </label>

        <label className="space-y-2 text-sm text-white/80">
          <span>Mật khẩu</span>
          <Input
            type="password"
            placeholder="Tối thiểu 8 ký tự"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            minLength={8}
            className="h-12"
          />
        </label>

        <label className="space-y-2 text-sm text-white/80">
          <span>Xác nhận mật khẩu</span>
          <Input
            type="password"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
            className="h-12"
          />
        </label>

        <label className="space-y-2 text-sm text-white/80">
          <span>Số điện thoại (tùy chọn)</span>
          <Input
            type="tel"
            placeholder="Nhập số điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isLoading}
            className="h-12"
          />
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
