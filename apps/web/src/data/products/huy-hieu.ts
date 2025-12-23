import { Product } from '@/types/product';

export const huyHieuProduct: Product = {
  id: 'huy-hieu-wds',
  name: 'Huy hiệu WebDev Studios',
  slug: 'huy-hieu',
  description:
    'Huy hiệu kim loại với logo WebDev Studios, phù hợp gắn balo, áo khoác hoặc túi laptop cho member WDS. Thiết kế tinh xảo, chất liệu kim loại cao cấp, bền đẹp theo thời gian.',
  images: [
    { src: '/shop/huy-hieu.webp', alt: 'Huy hiệu WebDev Studios' },
    { src: '/shop/huy-hieu.webp', alt: 'Huy hiệu WebDev Studios - Ảnh 2' },
    { src: '/shop/huy-hieu.webp', alt: 'Huy hiệu WebDev Studios - Ảnh 3' },
  ],
  price: {
    current: 99000,
    original: 149000,
    discount: 50000,
  },
  rating: {
    value: 4.9,
    count: 89,
  },
  features: [
    'Chất liệu kim loại cao cấp, bền đẹp',
    'Logo WebDev Studios được khắc tinh xảo',
    'Thiết kế nhỏ gọn, dễ gắn',
    'Phù hợp gắn balo, áo khoác, túi laptop',
    'Sản phẩm độc quyền cho thành viên WDS',
  ],
  additionalInfo: {
    material: 'Kim loại cao cấp',
    color: 'Vàng đồng',
    origin: 'Việt Nam',
    warranty: 'Bảo hành 1 năm',
    size: 'Đường kính 3cm',
  },
  stock: 25,
  hasSizes: false,
  badge: 'Official Merch',
};
