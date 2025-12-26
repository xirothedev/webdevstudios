import type { Metadata } from 'next';

import { createPageMetadata, SEO_IMAGES } from '@/lib/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Giỏ hàng',
  description:
    'Xem và quản lý giỏ hàng của bạn tại WebDev Studios. Kiểm tra sản phẩm, số lượng và tổng tiền trước khi thanh toán.',
  path: '/cart',
  image: SEO_IMAGES['/cart'],
  keywords: [
    'Giỏ hàng',
    'Shopping cart',
    'Mua sắm',
    'WebDev Studios',
    'E-commerce',
    'Thương mại điện tử',
  ],
});

export default function CartLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
