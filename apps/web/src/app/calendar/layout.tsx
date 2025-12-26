import type { Metadata } from 'next';

import { createPageMetadata } from '@/lib/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Lịch sự kiện',
  description:
    'Xem lịch các sự kiện, workshop, cuộc họp và khảo sát của WebDev Studios. Không bỏ lỡ bất kỳ hoạt động nào của câu lạc bộ.',
  path: '/calendar',
  keywords: [
    'lịch sự kiện',
    'calendar',
    'workshop',
    'cuộc họp',
    'khảo sát',
    'WebDev Studios',
  ],
});

export default function CalendarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
