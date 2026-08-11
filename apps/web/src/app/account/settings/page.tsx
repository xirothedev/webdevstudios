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
