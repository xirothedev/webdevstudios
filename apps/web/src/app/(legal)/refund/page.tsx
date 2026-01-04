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

import { Footer } from '@/components/Footer';
import { LastUpdatedProvider } from '@/components/legal/last-updated-provider';
import { LegalLayout } from '@/components/legal/LegalLayout';
import { Navbar } from '@/components/Navbar';
import { getFileCommitDate } from '@/lib/git-utils';

import Content from './content.mdx';

const TOC_ITEMS = [
  {
    id: 'chinh-sach-doi-tra-va-hoan-tien',
    label: 'Chính sách đổi trả và hoàn tiền',
  },
  { id: '1-gioi-thieu', label: '1. Giới thiệu' },
  { id: '2-dieu-kien-doi-tra', label: '2. Điều kiện đổi trả' },
  { id: '3-quy-trinh-doi-tra', label: '3. Quy trình đổi trả' },
  { id: '4-cac-hinh-thuc-doi-tra', label: '4. Các hình thức đổi trả' },
  { id: '5-quy-trinh-hoan-tien', label: '5. Quy trình hoàn tiền' },
  {
    id: '6-san-pham-loi-hoac-khong-dung-mo-ta',
    label: '6. Sản phẩm lỗi hoặc không đúng mô tả',
  },
  { id: '7-huy-don-hang', label: '7. Hủy đơn hàng' },
  { id: '8-quy-dinh-dac-biet', label: '8. Quy định đặc biệt' },
  { id: '9-lien-he', label: '9. Liên hệ' },
  { id: '10-thay-doi-chinh-sach', label: '10. Thay đổi chính sách' },
  { id: '11-dong-y', label: '11. Đồng ý' },
];

export default function RefundPage() {
  const commitDate = getFileCommitDate(
    'apps/web/src/app/(legal)/refund/content.mdx'
  );

  return (
    <div className="bg-wds-background text-wds-text selection:bg-wds-accent/30 selection:text-wds-text min-h-screen">
      <Navbar />

      <main className="py-20">
        <LastUpdatedProvider date={commitDate}>
          <LegalLayout title="Chính sách đổi trả và hoàn tiền" toc={TOC_ITEMS}>
            <Content />
          </LegalLayout>
        </LastUpdatedProvider>
      </main>

      <Footer />
    </div>
  );
}
