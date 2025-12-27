'use client';

import { type LucideIcon } from 'lucide-react';

import { AccountHero } from '@/components/account/AccountHero';
import { AccountSidebar } from '@/components/account/AccountSidebar';
import { AvatarUpload } from '@/components/account/AvatarUpload';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { useUserProfile } from '@/lib/api/hooks/use-user';

interface AccountLayoutProps {
  title: string;
  description: string;
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
  error?: {
    title: string;
    message: string;
  };
}

export function AccountLayout({
  title,
  description,
  icon,
  label,
  children,
  error,
}: AccountLayoutProps) {
  const { data: user } = useUserProfile();

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar variant="light" />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-base font-semibold text-gray-900">
              {error.title}
            </p>
            <p className="text-sm text-gray-600">{error.message}</p>
          </div>
        </div>
        <Footer variant="light" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="light" />
      <AccountHero
        icon={icon}
        label={label}
        title={title}
        description={description}
      />
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-8">
            {/* Left Sidebar: Avatar & Navigation */}
            <div className="shrink-0 lg:w-64">
              <div className="space-y-6">
                {/* Avatar Section */}
                {user && (
                  <div className="bg-wds-accent/5 border-wds-accent/20 rounded-2xl border p-6">
                    <AvatarUpload user={user} />
                  </div>
                )}

                {/* Navigation Sidebar */}
                <AccountSidebar />
              </div>
            </div>

            {/* Main Content */}
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </div>
      </section>
      <Footer variant="light" />
    </div>
  );
}
