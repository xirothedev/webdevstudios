import { Loader2 } from 'lucide-react';

export function AuthLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="text-wds-accent h-8 w-8 animate-spin" />
        <p className="text-sm text-white/80">Đang tải...</p>
      </div>
    </div>
  );
}
