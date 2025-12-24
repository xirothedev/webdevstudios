'use client';

import { useState } from 'react';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: wire real auth
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsLoading(false);
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
            className="h-12 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-white/30"
          />
        </label>

        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-lg bg-white text-black hover:bg-white/90 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Đang xử lý...' : 'Continue'}
        </Button>
      </form>
    </AuthLayout>
  );
}
