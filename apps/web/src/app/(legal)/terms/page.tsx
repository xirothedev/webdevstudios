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
  { id: 'dieu-khoan-su-dung', label: 'Điều khoản sử dụng' },
  { id: '1-gioi-thieu', label: '1. Giới thiệu' },
  { id: '2-dinh-nghia', label: '2. Định nghĩa' },
  { id: '3-chap-nhan-dieu-khoan', label: '3. Chấp nhận điều khoản' },
  { id: '4-dang-ky-tai-khoan', label: '4. Đăng ký tài khoản' },
  { id: '5-su-dung-dich-vu', label: '5. Sử dụng dịch vụ' },
  { id: '6-mua-sam-va-thanh-toan', label: '6. Mua sắm và thanh toán' },
  { id: '7-so-huu-tri-tue', label: '7. Sở hữu trí tuệ' },
  { id: '8-noi-dung-nguoi-dung', label: '8. Nội dung người dùng' },
  { id: '9-tu-choi-trach-nhiem', label: '9. Từ chối trách nhiệm' },
  { id: '10-boi-thuong', label: '10. Bồi thường' },
  { id: '11-cham-dut', label: '11. Chấm dứt' },
  { id: '12-thay-doi-dieu-khoan', label: '12. Thay đổi điều khoản' },
  { id: '13-luat-ap-dung', label: '13. Luật áp dụng' },
  { id: '14-lien-he', label: '14. Liên hệ' },
];

export default function TermsPage() {
  const commitDate = getFileCommitDate(
    'apps/web/src/app/(legal)/terms/content.mdx'
  );

  return (
    <div className="bg-wds-background text-wds-text selection:bg-wds-accent/30 selection:text-wds-text min-h-screen">
      <Navbar />

      <main className="py-20">
        <LastUpdatedProvider date={commitDate}>
          <LegalLayout title="Điều khoản sử dụng" toc={TOC_ITEMS}>
            <Content />
          </LegalLayout>
        </LastUpdatedProvider>
      </main>

      <Footer />
    </div>
  );
}
