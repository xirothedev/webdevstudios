import type { Metadata } from 'next';

import { createPageMetadata, SEO_IMAGES } from '@/lib/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Dây đeo WebDev Studios',
  description:
    'Dây đeo (lanyard) nằm ngang với branding WebDev Studios, tiện lợi cho thẻ nhân viên, thẻ hội viên hoặc keychain. Chất liệu bền chắc, thiết kế chuyên nghiệp.',
  path: '/shop/day-deo',
  image: SEO_IMAGES['/shop'],
  keywords: [
    'Dây đeo WDS',
    'Lanyard WebDev Studios',
    'Dây đeo thẻ nhân viên',
    'Merchandise UIT',
  ],
});

export default function DayDeoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
