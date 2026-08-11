/**
 * Copyright (c) 2026 Xiro The Dev <lethanhtrung.trungle@gmail.com>
 *
 * Source Available License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to:
 * - View and study the Software for educational purposes
 * - Fork this repository on GitHub for personal reference
 * - Share links to this repository
 *
 * THE FOLLOWING ARE PROHIBITED:
 * - Using the Software in production or commercial applications
 * - Copying substantial portions of the Software into other projects
 * - Distributing modified versions of the Software
 * - Removing or altering copyright notices
 *
 * For commercial licensing or usage permissions, contact: lethanhtrung.trungle@gmail.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

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
