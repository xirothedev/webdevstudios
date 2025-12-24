import { Footer } from '@/components/Footer';
import { LastUpdatedProvider } from '@/components/legal/last-updated-provider';
import { LegalLayout } from '@/components/legal/LegalLayout';
import { Navbar } from '@/components/Navbar';
import { getFileCommitDate } from '@/lib/git-utils';

import Content from './content.mdx';

const TOC_ITEMS = [
  { id: 'chinh-sach-quyen-rieng-tu', label: 'Chính sách quyền riêng tư' },
  { id: '1-gioi-thieu', label: '1. Giới thiệu' },
  {
    id: '2-thong-tin-chung-toi-thu-thap',
    label: '2. Thông tin chúng tôi thu thập',
  },
  {
    id: '3-cach-chung-toi-su-dung-thong-tin',
    label: '3. Cách chúng tôi sử dụng thông tin',
  },
  { id: '4-chia-se-thong-tin', label: '4. Chia sẻ thông tin' },
  { id: '5-bao-mat-thong-tin', label: '5. Bảo mật thông tin' },
  {
    id: '6-cookies-va-cong-nghe-theo-doi',
    label: '6. Cookies và công nghệ theo dõi',
  },
  { id: '7-quyen-cua-ban', label: '7. Quyền của bạn' },
  { id: '8-luu-tru-du-lieu', label: '8. Lưu trữ dữ liệu' },
  { id: '9-tre-em', label: '9. Trẻ em' },
  { id: '10-thay-doi-chinh-sach', label: '10. Thay đổi chính sách' },
  { id: '11-lien-he', label: '11. Liên hệ' },
  { id: '12-dong-y', label: '12. Đồng ý' },
];

export default function PrivacyPage() {
  const commitDate = getFileCommitDate(
    'apps/web/src/app/(legal)/privacy/content.mdx'
  );

  return (
    <div className="bg-wds-background text-wds-text selection:bg-wds-accent/30 selection:text-wds-text min-h-screen">
      <Navbar />

      <main className="py-20">
        <LastUpdatedProvider date={commitDate}>
          <LegalLayout title="Chính sách quyền riêng tư" toc={TOC_ITEMS}>
            <Content />
          </LegalLayout>
        </LastUpdatedProvider>
      </main>

      <Footer />
    </div>
  );
}
