/**
 * Copyright (c) 2026 Xiro The Dev <lethanhtrung.trungle@gmail.com>
 *
 * Source Available License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to:
 * - View and study the Software for educational purposes
 * - Fork this repository on GitHub for personal reference
 * - Share links to this repository
 *
 * THE FOLLOWING ARE PROHIBITED:
 * - Using the Software in production or commercial applications
 * - Copying substantial portions of the Software into other projects
 * - Distributing modified versions of the Software
 * - Removing or altering copyright notices
 *
 * For commercial licensing or usage permissions, contact: lethanhtrung.trungle@gmail.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { ProductSlug } from '@/lib/api/products';

export interface ProductImages {
  src: string;
  alt: string;
}

export interface ProductStaticContent {
  images: ProductImages[];
  features: string[];
  additionalInfo: Record<string, string>;
}

export const getProductStaticContent = (
  slug: ProductSlug
): ProductStaticContent => {
  const contentMap: Record<ProductSlug, ProductStaticContent> = {
    AO_THUN: {
      images: [
        { src: '/shop/ao-thun.webp', alt: 'Áo thun WebDev Studios' },
        { src: '/shop/ao-thun.webp', alt: 'Áo thun WebDev Studios - Ảnh 2' },
        { src: '/shop/ao-thun.webp', alt: 'Áo thun WebDev Studios - Ảnh 3' },
      ],
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
    },
    PAD_CHUOT: {
      images: [
        {
          src: '/shop/pad-chuot.webp',
          alt: 'Pad chuột WebDev Studios Limited Edition',
        },
        {
          src: '/shop/pad-chuot.webp',
          alt: 'Pad chuột WebDev Studios - Ảnh 2',
        },
        {
          src: '/shop/pad-chuot.webp',
          alt: 'Pad chuột WebDev Studios - Ảnh 3',
        },
      ],
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
    },
    DAY_DEO: {
      images: [
        { src: '/shop/day-deo.webp', alt: 'Dây đeo WebDev Studios' },
        { src: '/shop/day-deo.webp', alt: 'Dây đeo WebDev Studios - Ảnh 2' },
        { src: '/shop/day-deo.webp', alt: 'Dây đeo WebDev Studios - Ảnh 3' },
      ],
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
    },
    MOC_KHOA: {
      images: [
        { src: '/shop/moc-khoa.webp', alt: 'Móc khóa WebDev Studios' },
        { src: '/shop/moc-khoa.webp', alt: 'Móc khóa WebDev Studios - Ảnh 2' },
        { src: '/shop/moc-khoa.webp', alt: 'Móc khóa WebDev Studios - Ảnh 3' },
      ],
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
    },
  };

  return contentMap[slug];
};
