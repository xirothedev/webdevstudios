'use client';

import { User } from 'lucide-react';

import { AvatarUpload } from '@/components/account/AvatarUpload';
import { ProfileForm } from '@/components/account/ProfileForm';
import { ProfileLoading } from '@/components/account/ProfileLoading';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { useUserProfile } from '@/lib/api/hooks/use-user';

export default function ProfilePage() {
  const { data: user, isLoading, error } = useUserProfile();

  if (isLoading) {
    return <ProfileLoading />;
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar variant="light" />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-base font-semibold text-gray-900">
              Không thể tải thông tin hồ sơ
            </p>
            <p className="text-sm text-gray-600">
              Vui lòng thử lại sau hoặc đăng nhập lại.
            </p>
          </div>
        </div>
        <Footer variant="light" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="light" />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        {/* Background gradient */}
        <div className="via-wds-secondary/10 to-wds-secondary/20 absolute inset-0 bg-linear-to-b from-white" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          {/* Section header */}
          <div className="mb-12 flex flex-col gap-4 text-center sm:mb-16 sm:gap-6">
            <div className="inline-flex items-center justify-center gap-2">
              <User className="text-wds-accent h-5 w-5" />
              <span className="text-wds-accent text-sm font-bold tracking-widest uppercase">
                Tài khoản
              </span>
            </div>
            <h1 className="text-3xl leading-tight font-black text-balance text-black sm:text-4xl">
              Hồ sơ của tôi
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-pretty text-gray-600 sm:text-base">
              Quản lý thông tin cá nhân và cài đặt tài khoản của bạn
            </p>
          </div>
        </div>
      </section>

      {/* Profile Content Section */}
      <section className="relative">
        <div className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
            {/* Avatar Section */}
            <div className="shrink-0 lg:w-64">
              <div className="bg-wds-accent/5 border-wds-accent/20 rounded-2xl border p-6">
                <AvatarUpload user={user} />
              </div>
            </div>

            {/* Profile Form Section */}
            <div className="min-w-0 flex-1">
              <div className="bg-wds-accent/5 border-wds-accent/20 rounded-2xl border p-6 sm:p-8">
                <div className="mb-6">
                  <span className="text-wds-accent text-sm font-semibold tracking-wide uppercase">
                    Thông tin cá nhân
                  </span>
                </div>
                <ProfileForm user={user} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer variant="light" />
    </div>
  );
}
