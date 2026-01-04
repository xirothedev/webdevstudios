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

import { SecuritySettings } from '@/components/account/SecuritySettings';
import { SessionsList } from '@/components/account/SessionsList';
import { useUserProfile } from '@/lib/api/hooks/use-user';

export function SettingsContent() {
  const { data: user, isLoading, error } = useUserProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-gray-600">Đang tải...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
        <p className="text-sm font-semibold text-gray-900">
          Không thể tải thông tin cài đặt
        </p>
        <p className="text-xs text-gray-600">Vui lòng thử lại sau</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Security Settings Section */}
      <div>
        <div className="mb-6">
          <span className="text-wds-accent text-sm font-semibold tracking-wide uppercase">
            Bảo mật
          </span>
        </div>
        <SecuritySettings user={user} />
      </div>

      {/* Active Sessions Section */}
      <div>
        <div className="mb-6">
          <span className="text-wds-accent text-sm font-semibold tracking-wide uppercase">
            Phiên làm việc đang hoạt động
          </span>
          <p className="mt-2 text-xs text-gray-600">
            Quản lý các phiên đăng nhập của bạn trên các thiết bị khác nhau
          </p>
        </div>
        <SessionsList />
      </div>
    </div>
  );
}
