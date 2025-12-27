'use client';

import { Settings } from 'lucide-react';

import { AccountLayout } from '@/components/account/AccountLayout';
import { ProfileLoading } from '@/components/account/ProfileLoading';
import { SettingsContent } from '@/components/account/SettingsContent';
import { useUserProfile } from '@/lib/api/hooks/use-user';

export default function SettingsPage() {
  const { data: user, isLoading, error } = useUserProfile();

  if (isLoading) {
    return <ProfileLoading />;
  }

  if (error || !user) {
    return (
      <AccountLayout
        icon={Settings}
        label="Tài khoản"
        title="Cài đặt"
        description="Quản lý cài đặt bảo mật và cấu hình tài khoản của bạn"
        error={{
          title: 'Không thể tải thông tin cài đặt',
          message: 'Vui lòng thử lại sau hoặc đăng nhập lại.',
        }}
      >
        <div />
      </AccountLayout>
    );
  }

  return (
    <AccountLayout
      icon={Settings}
      label="Tài khoản"
      title="Cài đặt"
      description="Quản lý cài đặt bảo mật và cấu hình tài khoản của bạn"
    >
      <SettingsContent />
    </AccountLayout>
  );
}
