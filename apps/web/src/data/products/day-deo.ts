import { Product } from '@/types/product';

export const dayDeoProduct: Product = {
  id: 'day-deo-wds',
  name: 'Dây đeo WebDev Studios',
  slug: 'day-deo',
  description:
    'Dây đeo (lanyard) nằm ngang với branding WebDev Studios, tiện lợi cho thẻ nhân viên, thẻ hội viên hoặc keychain. Chất liệu bền chắc, thiết kế chuyên nghiệp, phù hợp cho mọi thành viên WDS.',
  images: [
    {
      src: '/shop/day-deo.webp',
      alt: 'Dây đeo WebDev Studios',
    },
    { src: '/shop/day-deo.webp', alt: 'Dây đeo WebDev Studios - Ảnh 2' },
    { src: '/shop/day-deo.webp', alt: 'Dây đeo WebDev Studios - Ảnh 3' },
  ],
  price: {
    current: 79000,
    original: 99000,
    discount: 20000,
  },
  rating: {
    value: 4.6,
    count: 98,
  },
  features: [
    'Thiết kế nằm ngang với branding WebDev Studios',
    'Chất liệu polyester cao cấp, bền chắc',
    'Phù hợp cho thẻ nhân viên, thẻ hội viên',
    'Có thể dùng làm keychain tiện lợi',
    'Màu sắc chuyên nghiệp, dễ phối hợp',
    'Sản phẩm độc quyền cho thành viên WDS',
  ],
  additionalInfo: {
    material: 'Polyester cao cấp',
    color: 'Đen với logo cam',
    origin: 'Việt Nam',
    warranty: 'Bảo hành 3 tháng',
    width: '25mm',
    length: '90cm',
  },
  stock: 30,
  hasSizes: false,
  badge: 'Official Merch',
};
