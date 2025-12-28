'use client';

import { useContext } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AuthContext } from '@/contexts/auth.context';

interface AdminHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function AdminHeader({ title, description, actions }: AdminHeaderProps) {
  const { user } = useContext(AuthContext) ?? {};

  return (
    <div className="border-wds-accent/20 bg-wds-background flex items-center justify-between border-b px-6 py-4">
      <div>
        <h1 className="text-wds-text text-2xl font-bold">{title}</h1>
        {description && (
          <p className="text-wds-text/70 mt-1 text-sm">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-4">
        {actions}
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-wds-text text-sm font-medium">
                {user.fullName || user.email}
              </p>
              <p className="text-wds-text/70 text-xs">Admin</p>
            </div>
            <Avatar>
              <AvatarImage
                src={user.avatar || undefined}
                alt={user.fullName || user.email}
              />
              <AvatarFallback className="bg-wds-accent text-black">
                {user.fullName
                  ? user.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                  : user.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </div>
  );
}
