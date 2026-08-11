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

/// <reference types="node" />

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  console.log('Starting seed...');

  // Clean existing products
  await prisma.productSizeStock.deleteMany({});
  await prisma.product.deleteMany({});

  console.log('Seeding products...');

  // Create Áo thun WebDev Studios (with sizes)
  const aoThun = await prisma.product.create({
    data: {
      slug: 'AO_THUN',
      name: 'Áo Thun WebDev Studios',
      description: `Áo thun chất lượng cao từ WebDev Studios, được thiết kế đặc biệt cho cộng đồng lập trình viên.

Chất liệu: 100% Cotton, thoáng mát, thấm hút mồ hôi tốt.
Thiết kế: Form suông, phù hợp với mọi dáng người.
Đặc điểm: Logo WebDev Studios được in chất lượng cao, không bong tróc.

Size có sẵn: S, M, L, XL`,
      priceCurrent: 250000,
      priceOriginal: 300000,
      priceDiscount: 50000,
      stock: 0, // Stock will be calculated from sizeStocks
      hasSizes: true,
      badge: 'Best Seller',
      ratingValue: 4.5,
      ratingCount: 128,
      isPublished: true,
      sizeStocks: {
        create: [
          { size: 'S', stock: 50 },
          { size: 'M', stock: 45 },
          { size: 'L', stock: 30 },
          { size: 'XL', stock: 20 },
        ],
      },
    },
  });
  console.log(`Created product: ${aoThun.name}`);

  // Create Mouse Pad WebDev Studios (without sizes)
  const padChuot = await prisma.product.create({
    data: {
      slug: 'PAD_CHUOT',
      name: 'Pad Chuột WebDev Studios',
      description: `Pad chuột cao cấp từ WebDev Studios, được thiết kế để tối ưu hóa trải nghiệm làm việc.

Kích thước: 80cm x 30cm (Full size)
Chất liệu: Bề mặt vải mượt mà, đế cao su không trơn trượt.
Đặc điểm: Logo in công nghệ cao, bền màu theo thời gian.
Thích hợp: Gaming, công việc văn phòng, thiết kế đồ họa.

Màu sắc: Đen với logo WebDev Studios`,
      priceCurrent: 150000,
      priceOriginal: 180000,
      priceDiscount: 30000,
      stock: 100,
      hasSizes: false,
      badge: 'Popular',
      ratingValue: 4.8,
      ratingCount: 256,
      isPublished: true,
    },
  });
  console.log(`Created product: ${padChuot.name}`);

  // Create Lanyard WebDev Studios (without sizes)
  const dayDeo = await prisma.product.create({
    data: {
      slug: 'DAY_DEO',
      name: 'Dây Đeo Lanyard WebDev Studios',
      description: `Dây đeo thẻ cao cấp từ WebDev Studios, phụ kiện hoàn hảo cho lập trình viên.

Kích thước: 90cm (có thể điều chỉnh)
Chất liệu: Vải polyester bền đẹp, không gây kích ứng da.
Đặc điểm: Logo WebDev Studios in nổi bật, móc kim loại bền chắc.
Thích hợp: Đeo thẻ nhân viên, thẻ sinh viên, chùm chìa khóa.

Màu sắc: Xanh đen với logo bạc`,
      priceCurrent: 50000,
      priceOriginal: null,
      priceDiscount: null,
      stock: 200,
      hasSizes: false,
      badge: null,
      ratingValue: 4.3,
      ratingCount: 89,
      isPublished: true,
    },
  });
  console.log(`Created product: ${dayDeo.name}`);

  // Create Keychain WebDev Studios (without sizes)
  const mocKhoa = await prisma.product.create({
    data: {
      slug: 'MOC_KHOA',
      name: 'Móc Khóa WebDev Studios',
      description: `Móc khóa chất lượng cao từ WebDev Studios, phụ kiện nhỏ gọn nhưng đầy ý nghĩa.

Kích thước: 5cm x 5cm
Chất liệu: Acrylic cao cấp, in 2 mặt sắc nét.
Đặc điểm: Logo WebDev Studios nổi bật, dây đeo bền chắc.
Thích hợp: Trang trí chùm chìa khóa, balo, tặng bạn bè.

Màu sắc: Nhiều màu sắc với logo WebDev Studios`,
      priceCurrent: 25000,
      priceOriginal: 35000,
      priceDiscount: 10000,
      stock: 500,
      hasSizes: false,
      badge: 'Limited',
      ratingValue: 4.6,
      ratingCount: 312,
      isPublished: true,
    },
  });
  console.log(`Created product: ${mocKhoa.name}`);

  console.log('Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log('- Áo Thun: 4 sizes (S:50, M:45, L:30, XL:20)');
  console.log('- Pad Chuột: 100');
  console.log('- Dây Đeo: 200');
  console.log('- Móc Khóa: 500');
  console.log('\n💡 To seed user data, run: bun run prisma:seed:user');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
