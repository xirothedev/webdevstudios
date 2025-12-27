'use client';

import { CheckCircle2, Info, Key, Shield } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { User } from '@/types/auth.types';

interface SecuritySettingsProps {
  user: User;
}

export function SecuritySettings({ user }: SecuritySettingsProps) {
  return (
    <div className="space-y-6">
      {/* 2FA Section */}
      <div className="bg-wds-accent/5 border-wds-accent/20 rounded-xl border p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="bg-wds-accent/20 flex h-10 w-10 items-center justify-center rounded-lg">
            <Shield className="text-wds-accent h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Xác thực hai yếu tố (2FA)
            </h3>
            <p className="text-xs text-gray-600">
              Bảo vệ tài khoản của bạn bằng mã xác thực
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-white p-4">
          <div className="flex items-center gap-3">
            {user.mfaEnabled ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Đã bật 2FA
                  </p>
                  <p className="text-xs text-gray-600">
                    Tài khoản của bạn đã được bảo vệ
                  </p>
                </div>
              </>
            ) : (
              <>
                <Info className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Chưa bật 2FA
                  </p>
                  <p className="text-xs text-gray-600">
                    Khuyến nghị bật để tăng cường bảo mật
                  </p>
                </div>
              </>
            )}
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className={cn(
              'border-gray-300',
              user.mfaEnabled
                ? 'text-gray-700 hover:bg-gray-50'
                : 'text-wds-accent border-wds-accent hover:bg-wds-accent/10'
            )}
          >
            <Link href="/auth/2fa">
              {user.mfaEnabled ? 'Quản lý' : 'Bật 2FA'}
            </Link>
          </Button>
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-wds-accent/5 border-wds-accent/20 rounded-xl border p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="bg-wds-accent/20 flex h-10 w-10 items-center justify-center rounded-lg">
            <Key className="text-wds-accent h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Mật khẩu</h3>
            <p className="text-xs text-gray-600">Thay đổi mật khẩu của bạn</p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-white p-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Mật khẩu</p>
            <p className="text-xs text-gray-600">Đã được thiết lập</p>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Link href="/auth/forgot-password">Đặt lại mật khẩu</Link>
          </Button>
        </div>
      </div>

      {/* Verification Status */}
      <div className="bg-wds-accent/5 border-wds-accent/20 rounded-xl border p-6">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-900">
            Trạng thái xác thực
          </h3>
          <p className="text-xs text-gray-600">
            Xác thực email và số điện thoại của bạn
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-white p-4">
            <div className="flex items-center gap-3">
              {user.emailVerified ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Email đã xác thực
                    </p>
                    <p className="text-xs text-gray-600">{user.email}</p>
                  </div>
                </>
              ) : (
                <>
                  <Info className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Email chưa xác thực
                    </p>
                    <p className="text-xs text-gray-600">{user.email}</p>
                  </div>
                </>
              )}
            </div>
            {!user.emailVerified && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Link href="/auth/verify-email">Xác thực</Link>
              </Button>
            )}
          </div>

          {user.phone && (
            <div className="flex items-center justify-between rounded-lg bg-white p-4">
              <div className="flex items-center gap-3">
                {user.phoneVerified ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Số điện thoại đã xác thực
                      </p>
                      <p className="text-xs text-gray-600">{user.phone}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Info className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Số điện thoại chưa xác thực
                      </p>
                      <p className="text-xs text-gray-600">{user.phone}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
