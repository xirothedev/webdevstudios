import { Product } from '@/types/product';

export const mocKhoaProduct: Product = {
  id: 'moc-khoa-wds',
  name: 'Móc khóa WebDev Studios',
  slug: 'moc-khoa',
  description:
    'Móc khóa kim loại với logo WebDev Studios, thiết kế độc đáo và bền chắc. Phù hợp để treo chìa khóa, túi xách hoặc làm vật trang trí. Chất liệu kim loại cao cấp, bền đẹp theo thời gian.',
  images: [
    { src: '/shop/moc-khoa.webp', alt: 'Móc khóa WebDev Studios' },
    { src: '/shop/moc-khoa.webp', alt: 'Móc khóa WebDev Studios - Ảnh 2' },
    { src: '/shop/moc-khoa.webp', alt: 'Móc khóa WebDev Studios - Ảnh 3' },
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
    'Chất liệu kim loại cao cấp, bền chắc',
    'Logo WebDev Studios được khắc tinh xảo',
    'Thiết kế độc đáo, nhỏ gọn',
    'Phù hợp treo chìa khóa, túi xách',
    'Có thể dùng làm vật trang trí',
    'Sản phẩm độc quyền cho thành viên WDS',
  ],
  additionalInfo: {
    material: 'Kim loại cao cấp',
    color: 'Vàng đồng',
    origin: 'Việt Nam',
    warranty: 'Bảo hành 1 năm',
    size: 'Kích thước 5cm x 3cm',
  },
  stock: 25,
  hasSizes: false,
  badge: 'Official Merch',
};
