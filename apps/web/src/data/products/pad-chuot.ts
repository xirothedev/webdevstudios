import { Product } from '@/types/product';

export const padChuotProduct: Product = {
  id: 'pad-chuot-wds-limited',
  name: 'Pad chuột WebDev Studios Limited Edition',
  slug: 'pad-chuot',
  description:
    'Pad chuột cỡ lớn phiên bản giới hạn với thiết kế WebDev Studios, tối ưu cho developer và designer thường xuyên dùng chuột. Bề mặt mịn màng, độ nhạy cao, chống mài mòn tốt.',
  images: [
    {
      src: '/shop/pad-chuot.webp',
      alt: 'Pad chuột WebDev Studios Limited Edition',
    },
    { src: '/shop/pad-chuot.webp', alt: 'Pad chuột WebDev Studios - Ảnh 2' },
    { src: '/shop/pad-chuot.webp', alt: 'Pad chuột WebDev Studios - Ảnh 3' },
  ],
  price: {
    current: 199000,
    original: 249000,
    discount: 50000,
  },
  rating: {
    value: 4.7,
    count: 156,
  },
  features: [
    'Phiên bản Limited Edition độc quyền',
    'Kích thước lớn phù hợp cho developer',
    'Bề mặt mịn màng, độ nhạy cao',
    'Chống mài mòn, bền đẹp theo thời gian',
    'Thiết kế WebDev Studios độc đáo',
    'Tối ưu cho gaming và design work',
  ],
  additionalInfo: {
    material: 'Cao su cao cấp + vải',
    color: 'Đen với logo cam',
    origin: 'Việt Nam',
    warranty: 'Bảo hành 6 tháng',
    size: '800mm x 300mm',
    thickness: '3mm',
  },
  stock: 12,
  hasSizes: false,
  badge: 'Limited Edition',
};
