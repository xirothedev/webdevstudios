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

'use client';

import { Package } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

export function OrdersEmpty() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mb-6 rounded-full bg-white/5 p-6">
        <Package className="h-16 w-16 text-white/20" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-white">
        Bạn chưa có đơn hàng nào
      </h2>
      <p className="mb-8 text-center text-white/60">
        Hãy khám phá các sản phẩm của chúng tôi và tạo đơn hàng đầu tiên
      </p>
      <Button
        onClick={() => router.push('/shop')}
        className="bg-wds-accent hover:bg-wds-accent/90 font-semibold text-black"
      >
        Tiếp tục mua sắm
      </Button>
    </div>
  );
}
