import { Loader2 } from 'lucide-react';

import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

export function ProfileLoading() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="light" />
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-wds-accent h-8 w-8 animate-spin" />
          <p className="text-sm text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
      <Footer variant="light" />
    </div>
  );
}
