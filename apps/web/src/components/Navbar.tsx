'use client';

import { Box, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

interface NavbarProps {
  variant?: 'dark' | 'light';
}

export function Navbar({ variant = 'dark' }: NavbarProps) {
  const pathname = usePathname();
  const isDark = variant === 'dark';

  const navItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Về chúng tôi', href: '/about' },
    { label: 'Shop', href: '/shop' },
    { label: 'Thế hệ', href: '/generation' },
    { label: 'WDS chia sẻ', href: '/share' },
    { label: 'FAQ', href: '/faq' },
  ];

  return (
    <nav
      className={cn(
        'fixed top-0 right-0 left-0 z-50',
        isDark
          ? 'glass border-b border-white/5'
          : 'sticky border-b border-gray-200 bg-white'
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 md:h-16">
        <Link
          href="/"
          className={cn(
            'group flex cursor-pointer items-center gap-2',
            isDark ? 'gap-2' : 'gap-3'
          )}
        >
          {isDark ? (
            <>
              <div className="bg-wds-accent flex h-6 w-6 items-center justify-center rounded-md text-black">
                <Box className="h-3.5 w-3.5" strokeWidth={2} />
              </div>
              <span className="text-wds-text text-sm font-semibold tracking-tight">
                WDS Shop
              </span>
            </>
          ) : (
            <>
              <div className="bg-wds-accent flex h-12 w-12 items-center justify-center rounded-lg">
                <span className="text-2xl font-bold text-white">W</span>
              </div>
              <span className="text-xl font-bold text-black">
                WebDev Studios
              </span>
            </>
          )}
        </Link>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="gap-2">
            {/* Shop dropdown - only show on shop page or when variant is dark */}
            {(isDark || pathname === '/shop') && (
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(
                    'hover:text-wds-accent data-[state=open]:text-wds-accent h-8 bg-transparent text-xs font-medium hover:bg-white/5 data-[state=open]:bg-white/5',
                    isDark
                      ? 'text-white/70'
                      : 'text-gray-600 hover:text-black data-[state=open]:text-black'
                  )}
                >
                  Sản phẩm
                </NavigationMenuTrigger>
                <NavigationMenuContent
                  className={cn(
                    'backdrop-blur-md',
                    isDark
                      ? 'glass bg-card/95 border border-white/10'
                      : 'border border-gray-200 bg-white shadow-lg'
                  )}
                >
                  <ul className="grid w-[200px] gap-1 p-2">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/shop"
                          className={cn(
                            'hover:text-wds-accent block rounded-sm px-3 py-2 text-xs transition-colors select-none hover:bg-white/5',
                            isDark ? 'text-white/70' : 'text-gray-600'
                          )}
                        >
                          Tất cả sản phẩm
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="#"
                          className={cn(
                            'hover:text-wds-accent block rounded-sm px-3 py-2 text-xs transition-colors select-none hover:bg-white/5',
                            isDark ? 'text-white/70' : 'text-gray-600'
                          )}
                        >
                          Áo thun
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="#"
                          className={cn(
                            'hover:text-wds-accent block rounded-sm px-3 py-2 text-xs transition-colors select-none hover:bg-white/5',
                            isDark ? 'text-white/70' : 'text-gray-600'
                          )}
                        >
                          Mũ & Phụ kiện
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="#"
                          className={cn(
                            'hover:text-wds-accent block rounded-sm px-3 py-2 text-xs transition-colors select-none hover:bg-white/5',
                            isDark ? 'text-white/70' : 'text-gray-600'
                          )}
                        >
                          Túi & Balo
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )}

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
                        ? cn(
                            'bg-transparent hover:bg-white/5',
                            isActive
                              ? 'text-wds-accent'
                              : 'hover:text-wds-accent text-white/70'
                          )
                        : cn(
                            'bg-transparent',
                            isActive
                              ? 'border-wds-accent rounded-none border-b-2 pb-1 text-black'
                              : 'text-gray-600 hover:text-black'
                          )
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
          {isDark ? (
            <>
              <Link
                href="/login"
                className={cn(
                  'hidden text-xs font-medium transition-colors sm:block',
                  'hover:text-wds-accent',
                  isDark ? 'text-white/70' : 'text-gray-600 hover:text-black'
                )}
              >
                Đăng nhập
              </Link>
              <Link
                href="/shop"
                className="focus:ring-wds-accent relative inline-flex h-8 overflow-hidden rounded-full p-px focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:outline-none"
              >
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#ffffff_0%,#f7931e_50%,#ffffff_100%)]" />
                <span className="bg-wds-accent hover:bg-wds-accent/90 inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full px-3 py-1 text-xs font-medium text-black backdrop-blur-3xl transition-colors">
                  Xem sản phẩm
                  <ChevronRight className="ml-1 h-3 w-3" />
                </span>
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-wds-accent hover:bg-wds-accent/90 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
