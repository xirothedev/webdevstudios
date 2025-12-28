'use client';

import { useRouter } from 'next/navigation';
import { useContext, useEffect } from 'react';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AuthContext } from '@/contexts/auth.context';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useContext(AuthContext) ?? {};
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.push('/auth/login');
      return;
    }

    if (user.role !== 'ADMIN') {
      router.push('/');
      return;
    }
  }, [user, isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="bg-wds-background flex min-h-screen items-center justify-center">
        <div className="text-wds-text">Đang tải...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="bg-wds-background flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
