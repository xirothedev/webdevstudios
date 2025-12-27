'use client';

import { Settings, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    href: '/account/profile',
    label: 'Hồ sơ',
    icon: User,
  },
  {
    href: '/account/settings',
    label: 'Cài đặt',
    icon: Settings,
  },
];

export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <nav className="bg-wds-accent/5 border-wds-accent/20 rounded-2xl border p-4">
      <ul className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-wds-accent text-black'
                    : 'hover:bg-wds-accent/10 text-gray-700 hover:text-gray-900'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
