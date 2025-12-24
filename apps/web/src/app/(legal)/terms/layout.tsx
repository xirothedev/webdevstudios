import type { Metadata } from 'next';

import { createPageMetadata, SEO_IMAGES } from '@/lib/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Điều khoản sử dụng',
  description:
    'Điều khoản sử dụng của WebDev Studios - Quy định và điều kiện khi sử dụng website và dịch vụ của chúng tôi.',
  path: '/terms',
  image: SEO_IMAGES['/'],
  keywords: [
    'Điều khoản sử dụng',
    'Terms of Service',
    'WebDev Studios',
    'Quy định',
  ],
});

export default function TermsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
