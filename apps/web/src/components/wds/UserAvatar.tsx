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

import { LogOut, Settings, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrentUser, useLogout } from '@/lib/api/hooks/use-auth';
import { cn } from '@/lib/utils';
import { getAvatarInitials } from '@/lib/utils/avatar';

interface UserAvatarProps {
  variant?: 'dark' | 'light';
}

export function UserAvatar({ variant = 'light' }: UserAvatarProps) {
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();
  const isDark = variant === 'dark';

  // Don't render if user is not loaded or doesn't exist
  if (isLoading || !user) {
    return null;
  }

  const initials = getAvatarInitials(user.fullName, user.email);

  const handleLogout = () => {
    logout.mutate('');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'focus:ring-wds-accent relative flex cursor-pointer items-center gap-2 rounded-full transition-all outline-none focus:ring-2 focus:ring-offset-2',
            isDark
              ? 'hover:bg-white/5 focus:ring-offset-black'
              : 'hover:bg-gray-100 focus:ring-offset-white'
          )}
          aria-label="User menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user.avatar || undefined}
              alt={user.fullName || user.email}
            />
            <AvatarFallback
              className={cn(
                'text-xs font-medium',
                isDark ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-700'
              )}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(
          'w-64 p-2',
          isDark
            ? 'border-white/10 bg-black/98 backdrop-blur-xl'
            : 'border-gray-200 bg-white'
        )}
      >
        {/* User Info Section */}
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-3',
            isDark ? 'bg-white/5' : 'bg-gray-50'
          )}
        >
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={user.avatar || undefined}
              alt={user.fullName || user.email}
            />
            <AvatarFallback
              className={cn(
                'text-sm font-semibold',
                isDark ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-700'
              )}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                'truncate text-sm font-semibold',
                isDark ? 'text-white' : 'text-gray-900'
              )}
            >
              {user.fullName || 'User'}
            </p>
            <p
              className={cn(
                'truncate text-xs',
                isDark ? 'text-white/60' : 'text-gray-500'
              )}
            >
              {user.email}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator className={isDark ? 'bg-white/10' : ''} />

        {/* Menu Items */}
        <div className="py-1">
          <DropdownMenuItem
            asChild
            className={cn(
              'cursor-pointer rounded-md px-4 py-3',
              isDark
                ? 'text-white/80 focus:bg-white/10 focus:text-white'
                : 'text-gray-700 focus:bg-gray-100 focus:text-gray-900'
            )}
          >
            <Link href="/account/profile" className="flex items-center gap-3">
              <User className="h-5 w-5 shrink-0" />
              <span className="text-sm font-medium">Hồ sơ</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className={cn(
              'cursor-pointer rounded-md px-4 py-3',
              isDark
                ? 'text-white/80 focus:bg-white/10 focus:text-white'
                : 'text-gray-700 focus:bg-gray-100 focus:text-gray-900'
            )}
          >
            <Link href="/orders" className="flex items-center gap-3">
              <ShoppingBag className="h-5 w-5 shrink-0" />
              <span className="text-sm font-medium">Đơn hàng</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className={cn(
              'cursor-pointer rounded-md px-4 py-3',
              isDark
                ? 'text-white/80 focus:bg-white/10 focus:text-white'
                : 'text-gray-700 focus:bg-gray-100 focus:text-gray-900'
            )}
          >
            <Link href="/account/settings" className="flex items-center gap-3">
              <Settings className="h-5 w-5 shrink-0" />
              <span className="text-sm font-medium">Cài đặt</span>
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className={isDark ? 'bg-white/10' : ''} />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          className={cn(
            'cursor-pointer rounded-md px-4 py-3',
            isDark
              ? 'text-red-400 focus:bg-red-500/10 focus:text-red-300'
              : 'text-red-600 focus:bg-red-50 focus:text-red-700'
          )}
        >
          <div className="flex items-center gap-3">
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">Đăng xuất</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
