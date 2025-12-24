'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

export function WDSHeader() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Về chúng tôi', href: '/about' },
    { label: 'Shop', href: '/shop' },
    { label: 'Thế hệ', href: '/generation' },
    { label: 'WDS chia sẻ', href: '/share' },
    { label: 'FAQ', href: '/faq' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-12 w-12">
            <Image
              src="/image/wds-logo.svg"
              alt=""
              aria-hidden="true"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-xl font-bold text-black">WebDev Studios</span>
        </Link>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink
                    asChild
                    className={cn(
                      navigationMenuTriggerStyle(),
                      'h-8 text-sm font-medium',
                      isActive
                        ? 'border-wds-accent rounded-none border-b-2 pb-1 text-black'
                        : 'text-gray-600 hover:text-black'
                    )}
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>

        <Link
          href="/auth/login"
          className="bg-wds-accent hover:bg-wds-accent/90 rounded-lg px-4 py-2 text-sm font-medium text-black transition-colors"
        >
          Đăng nhập
        </Link>
      </div>
    </header>
  );
}
