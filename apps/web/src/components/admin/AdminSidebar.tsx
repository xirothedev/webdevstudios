'use client';

import {
  BarChart3,
  LogOut,
  Package,
  ShoppingCart,
  Users,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useLogout } from '@/lib/api/hooks/use-auth';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: BarChart3 },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Transactions', href: '/admin/transactions', icon: Wallet },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { mutate: logout } = useLogout();

  return (
    <div className="border-wds-accent/20 bg-wds-background flex h-screen w-64 flex-col border-r">
      <div className="border-wds-accent/20 flex h-16 items-center border-b px-6">
        <h1 className="text-wds-text text-xl font-bold">Admin Panel</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-wds-accent text-black'
                  : 'text-wds-text/70 hover:bg-wds-accent/10 hover:text-wds-text'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-wds-accent/20 border-t p-4">
        <button
          onClick={() => logout('')}
          className="group text-wds-text/70 hover:bg-wds-accent/10 hover:text-wds-text flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
