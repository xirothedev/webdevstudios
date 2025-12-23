import type { Metadata } from 'next';

import { createPageMetadata, SEO_IMAGES } from '@/lib/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'FAQ',
  description:
    'Câu hỏi thường gặp về WebDev Studios: tuyển thành viên, hoạt động, cơ hội phát triển và cách tham gia câu lạc bộ.',
  path: '/faq',
  image: SEO_IMAGES['/faq'],
  keywords: ['FAQ WebDev Studios', 'Câu hỏi thường gặp', 'CLB lập trình web'],
});

export default function FAQLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
