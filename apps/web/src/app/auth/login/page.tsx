'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login({
        email,
        password,
        rememberMe,
      });

      // Check if 2FA is required
      if (response.requires2FA) {
        toast.info('Vui lòng xác thực 2FA để tiếp tục');
        // TODO: Redirect to 2FA page when implemented
        router.push('/auth/2fa');
        return;
      }

      toast.success('Đăng nhập thành công!');
      router.push('/');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Đăng nhập thất bại. Vui lòng thử lại.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout variant="login">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="space-y-2 text-sm text-white/80">
          <span>Email</span>
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="h-12"
          />
        </label>

        <label className="space-y-2 text-sm text-white/80">
          <span>Password</span>
          <Input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="h-12"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isLoading}
            className="text-wds-accent focus:ring-wds-accent/20 h-4 w-4 rounded border-white/20 bg-white/5 focus:ring-2"
          />
          <span>Remember me</span>
        </label>

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
