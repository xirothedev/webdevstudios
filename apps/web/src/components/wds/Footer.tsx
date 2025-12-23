'use client';

import Link from 'next/link';

export function WDSFooter() {
  return (
    <footer className="bg-black py-12 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-xl font-bold">WebDev Studios</h3>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">LIÊN HỆ</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <span className="font-medium">Email:</span>{' '}
                <a
                  href="mailto:webdevstudios.org@gmail.com"
                  className="hover:text-wds-accent transition-colors"
                >
                  webdevstudios.org@gmail.com
                </a>
              </li>
              <li>
                <span className="font-medium">Chủ nhiệm:</span> Lâm Chí Dĩnh -
                <Link
                  href="tel:0794161275"
                  className="hover:text-wds-accent transition-colors"
                >
                  {' '}
                  0794161275
                </Link>
              </li>
              <li>
                <span className="font-medium">Fanpage:</span>{' '}
                <a
                  href="https://facebook.com/webdevstudios.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-wds-accent transition-colors"
                >
                  facebook.com/webdevstudios.org
                </a>
              </li>
              <li>
                <span className="font-medium">Văn phòng:</span> B8.04, tòa B,
                trường Đại học Công nghệ Thông tin – ĐHQG TP.HCM.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">VỀ CLB</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="hover:text-wds-accent text-sm text-gray-300 transition-colors"
                >
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-wds-accent text-sm text-gray-300 transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
