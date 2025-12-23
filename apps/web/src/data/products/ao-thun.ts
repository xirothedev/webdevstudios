import { Product } from '@/types/product';

export const aoThunProduct: Product = {
  id: 'ao-thun-wds',
  name: 'Áo thun WebDev Studios',
  slug: 'ao-thun',
  description:
    'Áo thun chất lượng cao với logo WebDev Studios được in công nghệ cao, size đa dạng phù hợp với mọi thành viên. Thiết kế độc đáo, chất liệu cotton 100% mềm mại, thấm hút mồ hôi tốt.',
  images: [
    { src: '/shop/ao-thun.webp', alt: 'Áo thun WebDev Studios' },
    { src: '/shop/ao-thun.webp', alt: 'Áo thun WebDev Studios - Ảnh 2' },
    { src: '/shop/ao-thun.webp', alt: 'Áo thun WebDev Studios - Ảnh 3' },
  ],
  price: {
    current: 299000,
    original: 399000,
    discount: 100000,
  },
  rating: {
    value: 4.8,
    count: 127,
  },
  features: [
    'Chất liệu cotton 100% mềm mại',
    'Logo in công nghệ cao, bền màu',
    'Size đa dạng từ S đến XL',
    'Thiết kế độc quyền WebDev Studios',
  ],
  additionalInfo: {
    material: 'Cotton 100%',
    color: 'Đen với logo cam',
    origin: 'Việt Nam',
    warranty: 'Đổi trả trong 7 ngày',
  },
  stock: 15,
  hasSizes: true,
  sizes: ['S', 'M', 'L', 'XL'],
  badge: 'Official Merch',
};
