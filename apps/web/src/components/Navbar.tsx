'use client';

import { Box, ChevronRight } from 'lucide-react';
import Link from 'next/link';

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

export function Navbar() {
  return (
    <nav className="glass fixed top-0 right-0 left-0 z-50 border-b border-white/5">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="group flex cursor-pointer items-center gap-2">
          <div className="bg-wds-accent flex h-6 w-6 items-center justify-center rounded-md text-black">
            <Box className="h-3.5 w-3.5" strokeWidth={2} />
          </div>
          <span className="text-wds-text text-sm font-semibold tracking-tight">
            Savi
          </span>
        </Link>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="gap-2">
            <NavigationMenuItem>
              <NavigationMenuTrigger className="hover:text-wds-accent data-[state=open]:text-wds-accent h-8 bg-transparent text-xs font-medium text-white/70 hover:bg-white/5 data-[state=open]:bg-white/5">
                Collections
              </NavigationMenuTrigger>
              <NavigationMenuContent className="glass bg-card/95 border border-white/10 backdrop-blur-md">
                <ul className="grid w-[200px] gap-1 p-2">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="#"
                        className="hover:text-wds-accent block rounded-sm px-3 py-2 text-xs text-white/70 transition-colors select-none hover:bg-white/5"
                      >
                        All Collections
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="#"
                        className="hover:text-wds-accent block rounded-sm px-3 py-2 text-xs text-white/70 transition-colors select-none hover:bg-white/5"
                      >
                        New Arrivals
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="#"
                        className="hover:text-wds-accent block rounded-sm px-3 py-2 text-xs text-white/70 transition-colors select-none hover:bg-white/5"
                      >
                        Featured
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="hover:text-wds-accent data-[state=open]:text-wds-accent h-8 bg-transparent text-xs font-medium text-white/70 hover:bg-white/5 data-[state=open]:bg-white/5">
                Analytics
              </NavigationMenuTrigger>
              <NavigationMenuContent className="glass bg-card/95 border border-white/10 backdrop-blur-md">
                <ul className="grid w-[200px] gap-1 p-2">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="#"
                        className="hover:text-wds-accent block rounded-sm px-3 py-2 text-xs text-white/70 transition-colors select-none hover:bg-white/5"
                      >
                        Dashboard
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="#"
                        className="hover:text-wds-accent block rounded-sm px-3 py-2 text-xs text-white/70 transition-colors select-none hover:bg-white/5"
                      >
                        Reports
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        href="#"
                        className="hover:text-wds-accent block rounded-sm px-3 py-2 text-xs text-white/70 transition-colors select-none hover:bg-white/5"
                      >
                        Insights
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={cn(
                  navigationMenuTriggerStyle(),
                  'hover:text-wds-accent h-8 bg-transparent text-xs font-medium text-white/70 hover:bg-white/5'
                )}
              >
                <Link href="#">Inventory</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={cn(
                  navigationMenuTriggerStyle(),
                  'hover:text-wds-accent h-8 bg-transparent text-xs font-medium text-white/70 hover:bg-white/5'
                )}
              >
                <Link href="#">Customers</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-4">
          <button className="hover:text-wds-accent hidden text-xs font-medium text-white/70 transition-colors sm:block">
            Log in
          </button>
          <button className="focus:ring-wds-accent relative inline-flex h-8 overflow-hidden rounded-full p-px focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:outline-none">
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#ffffff_0%,#f7931e_50%,#ffffff_100%)]" />
            <span className="bg-wds-accent hover:bg-wds-accent/90 inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full px-3 py-1 text-xs font-medium text-black backdrop-blur-3xl transition-colors">
              Start Trial
              <ChevronRight className="ml-1 h-3 w-3" />
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
