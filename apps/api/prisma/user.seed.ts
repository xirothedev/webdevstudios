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
import * as argon2 from 'argon2';

import {
  Order,
  OrderStatus,
  PaymentStatus,
  PrismaClient,
  ProductSize,
  ProductSlug,
  UserRole,
} from '../generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  console.log('Starting user seed...');

  // Hash password
  const hashedPassword = await argon2.hash('admin123@');

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'admin@wds.org' },
  });

  let user;
  if (existingUser) {
    console.log('User admin@wds.org already exists, updating...');
    user = await prisma.user.update({
      where: { email: 'admin@wds.org' },
      data: {
        password: hashedPassword,
        fullName: 'Admin WebDev Studios',
        phone: '0901234567',
        role: UserRole.ADMIN,
        emailVerified: true,
      },
    });
  } else {
    // Create user
    user = await prisma.user.create({
      data: {
        email: 'admin@wds.org',
        password: hashedPassword,
        fullName: 'Admin WebDev Studios',
        phone: '0901234567',
        role: UserRole.ADMIN,
        emailVerified: true,
      },
    });
    console.log(`Created user: ${user.email}`);
  }

  // Get all products
  const products = await prisma.product.findMany({
    include: {
      sizeStocks: true,
    },
  });

  if (products.length === 0) {
    console.log(
      'No products found. Please run seed.ts first to create products.'
    );
    return;
  }

  const aoThun = products.find((p) => p.slug === ProductSlug.AO_THUN);
  const padChuot = products.find((p) => p.slug === ProductSlug.PAD_CHUOT);
  const dayDeo = products.find((p) => p.slug === ProductSlug.DAY_DEO);
  const mocKhoa = products.find((p) => p.slug === ProductSlug.MOC_KHOA);

  // Clean existing addresses and orders for this user
  await prisma.order.deleteMany({
    where: { userId: user.id },
  });
  await prisma.address.deleteMany({
    where: { userId: user.id },
  });

  // Create addresses
  const address1 = await prisma.address.create({
    data: {
      userId: user.id,
      recipient: 'Admin WebDev Studios',
      phone: '0901234567',
      street: '123 Đường ABC',
      city: 'Hồ Chí Minh',
      district: 'Quận 1',
      ward: 'Phường Bến Nghé',
      isDefault: true,
    },
  });

  const address2 = await prisma.address.create({
    data: {
      userId: user.id,
      recipient: 'Admin WebDev Studios',
      phone: '0901234567',
      street: '456 Đường XYZ',
      city: 'Hà Nội',
      district: 'Quận Hoàn Kiếm',
      ward: 'Phường Hàng Bông',
      isDefault: false,
    },
  });

  console.log('Created addresses');

  // Helper function to generate order code
  const generateOrderCode = (index: number): string => {
    const num = (1000 + index).toString().padStart(4, '0');
    return `#ORD-${num}`;
  };

  // Create orders with different statuses
  const orders: Order[] = [];

  // 1. PENDING order (not yet paid)
  if (aoThun) {
    const shippingAddress1 = await prisma.shippingAddress.create({
      data: {
        fullName: address1.recipient,
        phone: address1.phone,
        addressLine1: address1.street,
        addressLine2: null,
        city: address1.city,
        district: address1.district,
        ward: address1.ward,
        postalCode: '700000',
      },
    });

    const order1 = await prisma.order.create({
      data: {
        code: generateOrderCode(1),
        userId: user.id,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        totalAmount: 250000,
        shippingFee: 0,
        discountValue: 0,
        shippingAddressId: shippingAddress1.id,
        items: {
          create: [
            {
              productId: aoThun.id,
              productSlug: ProductSlug.AO_THUN,
              productName: aoThun.name,
              size: ProductSize.M,
              price: 250000,
              quantity: 1,
            },
          ],
        },
      },
    });
    orders.push(order1);
    console.log(`Created order: ${order1.code} (PENDING)`);
  }

  // 2. CONFIRMED order (confirmed, paid)
  if (padChuot) {
    const shippingAddress2 = await prisma.shippingAddress.create({
      data: {
        fullName: address1.recipient,
        phone: address1.phone,
        addressLine1: address1.street,
        addressLine2: 'Tầng 5',
        city: address1.city,
        district: address1.district,
        ward: address1.ward,
        postalCode: '700000',
      },
    });

    const order2 = await prisma.order.create({
      data: {
        code: generateOrderCode(2),
        userId: user.id,
        status: OrderStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PAID,
        totalAmount: 150000,
        shippingFee: 0,
        discountValue: 0,
        shippingAddressId: shippingAddress2.id,
        items: {
          create: [
            {
              productId: padChuot.id,
              productSlug: ProductSlug.PAD_CHUOT,
              productName: padChuot.name,
              size: null,
              price: 150000,
              quantity: 1,
            },
          ],
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
    });
    orders.push(order2);
    console.log(`Created order: ${order2.code} (CONFIRMED)`);
  }

  // 3. PROCESSING order (packaging)
  if (aoThun && dayDeo) {
    const shippingAddress3 = await prisma.shippingAddress.create({
      data: {
        fullName: address2.recipient,
        phone: address2.phone,
        addressLine1: address2.street,
        addressLine2: null,
        city: address2.city,
        district: address2.district,
        ward: address2.ward,
        postalCode: '100000',
      },
    });

    const order3 = await prisma.order.create({
      data: {
        code: generateOrderCode(3),
        userId: user.id,
        status: OrderStatus.PROCESSING,
        paymentStatus: PaymentStatus.PAID,
        totalAmount: 300000,
        shippingFee: 30000,
        discountValue: 0,
        shippingAddressId: shippingAddress3.id,
        items: {
          create: [
            {
              productId: aoThun.id,
              productSlug: ProductSlug.AO_THUN,
              productName: aoThun.name,
              size: ProductSize.L,
              price: 250000,
              quantity: 1,
            },
            {
              productId: dayDeo.id,
              productSlug: ProductSlug.DAY_DEO,
              productName: dayDeo.name,
              size: null,
              price: 50000,
              quantity: 1,
            },
          ],
        },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
    });
    orders.push(order3);
    console.log(`Created order: ${order3.code} (PROCESSING)`);
  }

  // 4. SHIPPING order (shipping)
  if (mocKhoa) {
    const shippingAddress4 = await prisma.shippingAddress.create({
      data: {
        fullName: address1.recipient,
        phone: address1.phone,
        addressLine1: address1.street,
        addressLine2: null,
        city: address1.city,
        district: address1.district,
        ward: address1.ward,
        postalCode: '700000',
      },
    });

    const order4 = await prisma.order.create({
      data: {
        code: generateOrderCode(4),
        userId: user.id,
        status: OrderStatus.SHIPPING,
        paymentStatus: PaymentStatus.PAID,
        totalAmount: 25000,
        shippingFee: 0,
        discountValue: 10000,
        shippingAddressId: shippingAddress4.id,
        items: {
          create: [
            {
              productId: mocKhoa.id,
              productSlug: ProductSlug.MOC_KHOA,
              productName: mocKhoa.name,
              size: null,
              price: 25000,
              quantity: 1,
            },
          ],
        },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    });
    orders.push(order4);
    console.log(`Created order: ${order4.code} (SHIPPING)`);
  }

  // 5. DELIVERED order (delivered)
  if (aoThun && padChuot && dayDeo) {
    const shippingAddress5 = await prisma.shippingAddress.create({
      data: {
        fullName: address1.recipient,
        phone: address1.phone,
        addressLine1: address1.street,
        addressLine2: 'Tầng 10, Phòng 1001',
        city: address1.city,
        district: address1.district,
        ward: address1.ward,
        postalCode: '700000',
      },
    });

    const order5 = await prisma.order.create({
      data: {
        code: generateOrderCode(5),
        userId: user.id,
        status: OrderStatus.DELIVERED,
        paymentStatus: PaymentStatus.PAID,
        totalAmount: 450000,
        shippingFee: 0,
        discountValue: 50000,
        shippingAddressId: shippingAddress5.id,
        items: {
          create: [
            {
              productId: aoThun.id,
              productSlug: ProductSlug.AO_THUN,
              productName: aoThun.name,
              size: ProductSize.XL,
              price: 250000,
              quantity: 1,
            },
            {
              productId: padChuot.id,
              productSlug: ProductSlug.PAD_CHUOT,
              productName: padChuot.name,
              size: null,
              price: 150000,
              quantity: 1,
            },
            {
              productId: dayDeo.id,
              productSlug: ProductSlug.DAY_DEO,
              productName: dayDeo.name,
              size: null,
              price: 50000,
              quantity: 1,
            },
          ],
        },
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      },
    });
    orders.push(order5);
    console.log(`Created order: ${order5.code} (DELIVERED)`);
  }

  // 6. CANCELLED order (cancelled)
  if (dayDeo) {
    const shippingAddress6 = await prisma.shippingAddress.create({
      data: {
        fullName: address2.recipient,
        phone: address2.phone,
        addressLine1: address2.street,
        addressLine2: null,
        city: address2.city,
        district: address2.district,
        ward: address2.ward,
        postalCode: '100000',
      },
    });

    const order6 = await prisma.order.create({
      data: {
        code: generateOrderCode(6),
        userId: user.id,
        status: OrderStatus.CANCELLED,
        paymentStatus: PaymentStatus.PENDING,
        totalAmount: 50000,
        shippingFee: 0,
        discountValue: 0,
        shippingAddressId: shippingAddress6.id,
        items: {
          create: [
            {
              productId: dayDeo.id,
              productSlug: ProductSlug.DAY_DEO,
              productName: dayDeo.name,
              size: null,
              price: 50000,
              quantity: 1,
            },
          ],
        },
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      },
    });
    orders.push(order6);
    console.log(`Created order: ${order6.code} (CANCELLED)`);
  }

  // 7. Another DELIVERED order with multiple items
  if (aoThun && mocKhoa) {
    const shippingAddress7 = await prisma.shippingAddress.create({
      data: {
        fullName: address1.recipient,
        phone: address1.phone,
        addressLine1: address1.street,
        addressLine2: null,
        city: address1.city,
        district: address1.district,
        ward: address1.ward,
        postalCode: '700000',
      },
    });

    const order7 = await prisma.order.create({
      data: {
        code: generateOrderCode(7),
        userId: user.id,
        status: OrderStatus.DELIVERED,
        paymentStatus: PaymentStatus.PAID,
        totalAmount: 275000,
        shippingFee: 0,
        discountValue: 0,
        shippingAddressId: shippingAddress7.id,
        items: {
          create: [
            {
              productId: aoThun.id,
              productSlug: ProductSlug.AO_THUN,
              productName: aoThun.name,
              size: ProductSize.S,
              price: 250000,
              quantity: 1,
            },
            {
              productId: mocKhoa.id,
              productSlug: ProductSlug.MOC_KHOA,
              productName: mocKhoa.name,
              size: null,
              price: 25000,
              quantity: 1,
            },
          ],
        },
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      },
    });
    orders.push(order7);
    console.log(`Created order: ${order7.code} (DELIVERED)`);
  }

  // 8. PENDING order with failed payment
  if (padChuot && dayDeo) {
    const shippingAddress8 = await prisma.shippingAddress.create({
      data: {
        fullName: address1.recipient,
        phone: address1.phone,
        addressLine1: address1.street,
        addressLine2: null,
        city: address1.city,
        district: address1.district,
        ward: address1.ward,
        postalCode: '700000',
      },
    });

    const order8 = await prisma.order.create({
      data: {
        code: generateOrderCode(8),
        userId: user.id,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.FAILED,
        totalAmount: 200000,
        shippingFee: 0,
        discountValue: 0,
        shippingAddressId: shippingAddress8.id,
        items: {
          create: [
            {
              productId: padChuot.id,
              productSlug: ProductSlug.PAD_CHUOT,
              productName: padChuot.name,
              size: null,
              price: 150000,
              quantity: 1,
            },
            {
              productId: dayDeo.id,
              productSlug: ProductSlug.DAY_DEO,
              productName: dayDeo.name,
              size: null,
              price: 50000,
              quantity: 1,
            },
          ],
        },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
    });
    orders.push(order8);
    console.log(`Created order: ${order8.code} (PENDING - FAILED)`);
  }

  console.log('\n✅ User seed completed successfully!');
  console.log(`\n📊 Summary:`);
  console.log(`- User: ${user.email} (${user.role})`);
  console.log(`- Addresses: 2`);
  console.log(`- Orders: ${orders.length}`);
  console.log(
    `  - PENDING: ${orders.filter((o) => o.status === OrderStatus.PENDING).length}`
  );
  console.log(
    `  - CONFIRMED: ${orders.filter((o) => o.status === OrderStatus.CONFIRMED).length}`
  );
  console.log(
    `  - PROCESSING: ${orders.filter((o) => o.status === OrderStatus.PROCESSING).length}`
  );
  console.log(
    `  - SHIPPING: ${orders.filter((o) => o.status === OrderStatus.SHIPPING).length}`
  );
  console.log(
    `  - DELIVERED: ${orders.filter((o) => o.status === OrderStatus.DELIVERED).length}`
  );
  console.log(
    `  - CANCELLED: ${orders.filter((o) => o.status === OrderStatus.CANCELLED).length}`
  );
}

main()
  .catch((e) => {
    console.error('Error during user seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
