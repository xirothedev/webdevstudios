'use client';

import { formatDistanceToNow } from 'date-fns';
import { LogOut, Monitor, Smartphone, Tablet } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useRevokeSession, useSessions } from '@/lib/api/hooks/use-settings';
import { cn } from '@/lib/utils';
import type { Session } from '@/types/auth.types';

function getDeviceIcon(type: string | null) {
  switch (type?.toUpperCase()) {
    case 'MOBILE':
      return Smartphone;
    case 'TABLET':
      return Tablet;
    case 'DESKTOP':
      return Monitor;
    default:
      return Monitor;
  }
}

function getDeviceTypeLabel(type: string | null): string {
  switch (type?.toUpperCase()) {
    case 'MOBILE':
      return 'Điện thoại';
    case 'TABLET':
      return 'Máy tính bảng';
    case 'DESKTOP':
      return 'Máy tính';
    default:
      return 'Thiết bị';
  }
}

interface SessionCardProps {
  session: Session;
  isCurrent: boolean;
  onRevoke: (sessionId: string) => void;
  isRevoking: boolean;
}

function SessionCard({
  session,
  isCurrent,
  onRevoke,
  isRevoking,
}: SessionCardProps) {
  const DeviceIcon = getDeviceIcon(session.device?.type || null);
  const deviceName =
    session.device?.name || getDeviceTypeLabel(session.device?.type || null);
  const lastSeen = session.device?.lastSeenAt
    ? formatDistanceToNow(new Date(session.device.lastSeenAt), {
        addSuffix: true,
      })
    : formatDistanceToNow(new Date(session.createdAt), {
        addSuffix: true,
      });

  return (
    <div
      className={cn(
        'bg-wds-accent/5 border-wds-accent/20 rounded-xl border p-4 transition-all',
        isCurrent && 'border-wds-accent/40 bg-wds-accent/10'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-wds-accent/20 flex h-10 w-10 items-center justify-center rounded-lg">
              <DeviceIcon className="text-wds-accent h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  {deviceName}
                </h3>
                {isCurrent && (
                  <span className="bg-wds-accent rounded-full px-2 py-0.5 text-xs font-bold text-black">
                    Phiên hiện tại
                  </span>
                )}
              </div>
              {session.userAgent && (
                <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                  {session.userAgent}
                </p>
              )}
            </div>
          </div>

          <div className="ml-13 space-y-1 text-xs text-gray-600">
            {session.ipAddress && (
              <p>
                <span className="font-medium">IP:</span> {session.ipAddress}
              </p>
            )}
            <p>
              <span className="font-medium">Hoạt động:</span> {lastSeen}
            </p>
            <p>
              <span className="font-medium">Trạng thái:</span>{' '}
              <span
                className={cn(
                  'font-semibold',
                  session.status === 'ACTIVE'
                    ? 'text-green-600'
                    : session.status === 'EXPIRED'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                )}
              >
                {session.status === 'ACTIVE'
                  ? 'Đang hoạt động'
                  : session.status === 'EXPIRED'
                    ? 'Đã hết hạn'
                    : 'Đã hủy'}
              </span>
            </p>
          </div>
        </div>

        {!isCurrent && session.status === 'ACTIVE' && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onRevoke(session.id)}
            disabled={isRevoking}
            className="border-gray-300 text-gray-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </Button>
        )}
      </div>
    </div>
  );
}

export function SessionsList() {
  const { data: sessions, isLoading, error } = useSessions();
  const revokeSession = useRevokeSession();

  const handleRevoke = (sessionId: string) => {
    if (!confirm('Bạn có chắc chắn muốn đăng xuất phiên làm việc này?')) {
      return;
    }
    revokeSession.mutate(sessionId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-gray-600">
          Đang tải danh sách phiên làm việc...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
        <p className="text-sm font-semibold text-gray-900">
          Không thể tải danh sách phiên làm việc
        </p>
        <p className="text-xs text-gray-600">Vui lòng thử lại sau</p>
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
        <p className="text-sm text-gray-600">Không có phiên làm việc nào</p>
      </div>
    );
  }

  // Get current session ID from localStorage or cookie (simplified - might need better detection)
  const currentSessionId = sessions.find((s) => s.status === 'ACTIVE')?.id;

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          isCurrent={session.id === currentSessionId}
          onRevoke={handleRevoke}
          isRevoking={revokeSession.isPending}
        />
      ))}
    </div>
  );
}
