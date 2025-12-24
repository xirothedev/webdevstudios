import type { Metadata } from 'next';

import { createPageMetadata, SEO_IMAGES } from '@/lib/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Chính sách đổi trả và hoàn tiền',
  description:
    'Chính sách đổi trả và hoàn tiền của WebDev Studios - Quy định và quy trình đổi trả sản phẩm.',
  path: '/refund',
  image: SEO_IMAGES['/'],
  keywords: [
    'Chính sách đổi trả',
    'Refund Policy',
    'WebDev Studios',
    'Hoàn tiền',
  ],
});

export default function RefundLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
