'use client';

import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  const [mounted, setMounted] = useState(false);
  const { data: user } = useCurrentUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Về chúng tôi', href: '/about' },
    { label: 'Đối tác', href: '/partner' },
    { label: 'Blog', href: '/blog' },
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
              'hidden lg:inline',
              isDark
                ? 'text-sm font-semibold tracking-tight text-white'
                : 'text-xl font-bold text-black'
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
                          ? 'text-wds-accent hover:bg-white/5 hover:text-white'
                          : 'hover:text-wds-accent text-white/70'
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
          {mounted && user ? (
            <UserAvatar variant={isDark ? 'dark' : 'light'} />
          ) : (
            <>
              {isDark ? (
                <>
                  <Link
                    href="/auth/login"
                    className={cn(
                      'hidden text-xs font-medium transition-colors sm:block',
                      'hover:text-wds-accent',
                      isDark
                        ? 'text-white/70'
                        : 'text-gray-600 hover:text-black'
                    )}
                  >
                    Đăng nhập
                  </Link>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="bg-wds-accent hover:bg-wds-accent/90 hidden rounded-lg px-4 py-2 text-sm font-medium text-black transition-colors sm:inline-block"
                >
                  Đăng nhập
                </Link>
              )}
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg transition-colors md:hidden',
              isDark
                ? 'text-white/70 hover:bg-white/5 hover:text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-black'
            )}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-9998 bg-black/50 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn(
                'fixed top-0 right-0 z-9999 h-full w-80 max-w-[85vw] overflow-y-auto shadow-2xl md:hidden',
                isDark
                  ? 'glass border-l border-white/10 bg-black/98 backdrop-blur-xl'
                  : 'border-l border-gray-200 bg-white'
              )}
            >
              <div className="flex flex-col p-6">
                {/* Mobile Logo */}
                <div className="mb-8 flex items-center gap-3">
                  <div className="relative h-10 w-10">
                    <Image
                      src="/image/wds-logo.svg"
                      alt="WebDev Studios"
                      fill
                      className="object-contain"
                    />
                  </div>
                  {!isDark && (
                    <span className="text-lg font-bold text-black">
                      WebDev Studios
                    </span>
                  )}
                </div>

                {/* Navigation Items */}
                <nav className="flex flex-col gap-2">
                  {navItems.map((item, index) => {
                    const isActive = pathname === item.href;
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: index * 0.1,
                          duration: 0.3,
                          ease: [0.6, -0.05, 0.01, 0.99],
                        }}
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
                                : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                          )}
                        >
                          {item.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>

                {/* Mobile Actions */}
                <div className="mt-8 flex flex-col gap-3">
                  {mounted && user ? (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: navItems.length * 0.1,
                        duration: 0.3,
                      }}
                    >
                      <div className="flex justify-center">
                        <UserAvatar variant={isDark ? 'dark' : 'light'} />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: navItems.length * 0.1,
                        duration: 0.3,
                      }}
                    >
                      <Link
                        href="/auth/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'flex w-full items-center justify-center rounded-lg px-4 py-3 text-base font-medium transition-colors',
                          'bg-wds-accent hover:bg-wds-accent/90 text-black'
                        )}
                      >
                        Đăng nhập
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
