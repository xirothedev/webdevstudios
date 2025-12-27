'use client';

import { User } from 'lucide-react';

import { AccountLayout } from '@/components/account/AccountLayout';
import { ProfileForm } from '@/components/account/ProfileForm';
import { ProfileLoading } from '@/components/account/ProfileLoading';
import { useUserProfile } from '@/lib/api/hooks/use-user';

export default function ProfilePage() {
  const { data: user, isLoading, error } = useUserProfile();

  if (isLoading) {
    return <ProfileLoading />;
  }

  if (error || !user) {
    return (
      <AccountLayout
        icon={User}
        label="Tài khoản"
        title="Hồ sơ của tôi"
        description="Quản lý thông tin cá nhân và cài đặt tài khoản của bạn"
        error={{
          title: 'Không thể tải thông tin hồ sơ',
          message: 'Vui lòng thử lại sau hoặc đăng nhập lại.',
        }}
      >
        <div />
      </AccountLayout>
    );
  }

  return (
    <AccountLayout
      icon={User}
      label="Tài khoản"
      title="Hồ sơ của tôi"
      description="Quản lý thông tin cá nhân và cài đặt tài khoản của bạn"
    >
      <div className="bg-wds-accent/5 border-wds-accent/20 rounded-2xl border p-6 sm:p-8">
        <div className="mb-6">
          <span className="text-wds-accent text-sm font-semibold tracking-wide uppercase">
            Thông tin cá nhân
          </span>
        </div>
        <ProfileForm user={user} />
      </div>
    </AccountLayout>
  );
}
