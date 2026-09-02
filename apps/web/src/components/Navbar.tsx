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

import { Menu, X } from 'lucide-react';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSyncExternalStore, useState } from 'react';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { UserAvatar } from '@/components/wds/UserAvatar';
import { useCurrentUser } from '@/lib/api/hooks/use-auth';
import { cn } from '@/lib/utils';

interface NavbarProps {
  variant?: 'dark' | 'light';
}

export function Navbar({ variant = 'dark' }: NavbarProps) {
  const pathname = usePathname();
  const isDark = variant === 'dark';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const { data: user } = useCurrentUser();

  const navItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Về chúng tôi', href: '/about' },
    { label: 'Thành tích', href: '/achievements' },
    { label: 'Hoạt động', href: '/activities' },
    { label: 'Đối tác', href: '/partner' },
    { label: 'Blog', href: '/blog' },
    { label: 'Shop', href: '/shop' },
    { label: 'Lịch sự kiện', href: '/calendar' },
    { label: 'Thế hệ', href: '/generation' },
    { label: 'FAQ', href: '/faq' },
  ];

  return (
    <nav
      className={cn(
        'fixed top-0 right-0 left-0 z-50',
        isDark ? 'glass border-b border-white/5' : 'sticky border-b border-gray-200 bg-white',
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 md:h-16">
        <Link
          href="/"
          aria-label="WebDev Studios"
          className="group flex cursor-pointer items-center gap-2"
        >
          <div className="relative h-6 w-6">
            <Image
              src="/image/wds-logo.svg"
              alt="WebDev Studios"
              aria-hidden="true"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span
            className={cn(
              'hidden text-sm font-semibold tracking-tight lg:inline',
              isDark ? 'text-white' : 'text-black',
            )}
          >
            WebDev Studios
          </span>
        </Link>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="gap-2">
            {/* Main navigation items */}
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink
                    asChild
                    className={cn(
                      navigationMenuTriggerStyle(),
                      'h-8 text-xs font-medium',
                      isDark
                        ? isActive
                          ? 'text-wds-accent hover:bg-white/5 hover:text-white!'
                          : 'hover:text-wds-accent! text-white/70'
                        : cn(
                            'bg-transparent',
                            isActive
                              ? 'border-wds-accent rounded-none border-b-2 pb-1 text-black'
                              : 'text-gray-600 hover:text-black',
                          ),
                    )}
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-4">
          {mounted && user ? (
            <UserAvatar variant={isDark ? 'dark' : 'light'} />
          ) : (
            <Link
              href="/auth/login"
              className={cn(
                'hidden rounded-lg px-4 py-2 text-xs font-medium transition-colors sm:block',
                isDark
                  ? 'hover:text-wds-accent text-white/70 hover:bg-white/5'
                  : 'bg-wds-accent hover:bg-wds-accent/90 text-black',
              )}
            >
              Đăng nhập
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg transition-colors md:hidden',
              isDark
                ? 'text-white/70 hover:bg-white/5 hover:text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-black',
            )}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar — ponytail: entrance-only CSS anims; motion exit removed with the lib */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="animate-in fade-in-0 fixed inset-0 z-9998 bg-black/50 duration-300 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Sidebar */}
          <div
            className={cn(
              'animate-in slide-in-from-right fixed top-0 right-0 z-9999 h-full w-80 max-w-[85vw] overflow-y-auto shadow-2xl duration-300 md:hidden',
              isDark
                ? 'glass border-l border-white/10 bg-black/98 backdrop-blur-xl'
                : 'border-l border-gray-200 bg-white',
            )}
          >
            <div className="flex flex-col p-6">
              {/* Mobile Logo */}
              <div className="mb-8 flex items-center gap-2">
                <div className="relative h-10 w-10">
                  <Image
                    src="/image/wds-logo.svg"
                    alt="WebDev Studios"
                    fill
                    className="object-contain"
                  />
                </div>
                <span
                  className={cn(
                    'text-sm font-semibold tracking-tight',
                    isDark ? 'text-white' : 'text-black',
                  )}
                >
                  WebDev Studios
                </span>
              </div>

              {/* Navigation Items */}
              <nav className="flex flex-col gap-2">
                {navItems.map((item, index) => {
                  const isActive = pathname === item.href;
                  return (
                    <div
                      key={item.href}
                      className="animate-in fade-in-0 slide-in-from-right-4 fill-mode-backwards duration-300"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center rounded-lg px-4 py-3 text-base font-medium transition-colors',
                          isActive
                            ? isDark
                              ? 'text-wds-accent bg-white/10'
                              : 'bg-wds-accent/10 text-wds-accent'
                            : isDark
                              ? 'text-white/70 hover:bg-white/5 hover:text-white'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-black',
                        )}
                      >
                        {item.label}
                      </Link>
                    </div>
                  );
                })}
              </nav>

              {/* Mobile Actions */}
              <div className="mt-8 flex flex-col gap-3">
                {mounted && user ? (
                  <div
                    className="animate-in fade-in-0 slide-in-from-right-4 fill-mode-backwards duration-300"
                    style={{ animationDelay: `${navItems.length * 0.1}s` }}
                  >
                    <div className="flex justify-center">
                      <UserAvatar variant={isDark ? 'dark' : 'light'} />
                    </div>
                  </div>
                ) : (
                  <div
                    className="animate-in fade-in-0 slide-in-from-right-4 fill-mode-backwards duration-300"
                    style={{ animationDelay: `${navItems.length * 0.1}s` }}
                  >
                    <Link
                      href="/auth/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'flex w-full items-center justify-center rounded-lg px-4 py-3 text-base font-medium transition-colors',
                        'bg-wds-accent hover:bg-wds-accent/90 text-black',
                      )}
                    >
                      Đăng nhập
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
