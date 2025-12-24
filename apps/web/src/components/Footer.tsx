'use client';

import Image from 'next/image';
import Link from 'next/link';

interface FooterProps {
  variant?: 'dark' | 'light';
}

export function Footer({ variant = 'dark' }: FooterProps) {
  const isDark = variant === 'dark';

  return (
    <footer
      className={`${isDark ? 'bg-wds-background border-white/5' : 'border-gray-200 bg-white'} border-t py-12`}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="relative h-5 w-5">
                <Image
                  src="/image/wds-logo.svg"
                  alt="WDS Shop"
                  fill
                  className="object-contain"
                />
              </div>
              <span
                className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-black'}`}
              >
                WebDev Studios
              </span>
            </div>
            <p
              className={`mb-10 text-xs ${isDark ? 'text-white/70' : 'text-gray-600'}`}
            >
              WebDev Studios là nơi tập hợp các bạn sinh viên có niềm đam mê với
              Lập trình Web nhằm tạo ra một môi trường học tập và giải trí để
              các bạn có thể học hỏi, trau dồi kỹ năng và phát triển bản thân.
            </p>

            <div className="mb-4 flex items-center gap-2">
              <div className="relative h-5 w-5">
                <Image
                  src="/image/wds-logo.svg"
                  alt="WDS Shop"
                  fill
                  className="object-contain"
                />
              </div>
              <span
                className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-black'}`}
              >
                WDS Shop
              </span>
            </div>
            <p
              className={`text-xs ${isDark ? 'text-white/70' : 'text-gray-600'}`}
            >
              WebDev Studios Shop là nơi bán các sản phẩm chính thức của CLB.
            </p>
          </div>

          <div>
            <h3
              className={`mb-4 text-sm font-semibold ${isDark ? 'text-white' : 'text-black'}`}
            >
              SẢN PHẨM
            </h3>
            <ul
              className={`space-y-2 text-xs ${isDark ? 'text-white/70' : 'text-gray-600'}`}
            >
              {[
                { label: 'Áo thun', href: '/shop/ao-thun' },
                { label: 'Móc khóa', href: '/shop/moc-khoa' },
                { label: 'Dây đeo', href: '/shop/day-deo' },
                { label: 'Pad chuột', href: '/shop/pad-chuot' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="hover:text-wds-accent transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3
              className={`mb-4 text-sm font-semibold ${isDark ? 'text-white' : 'text-black'}`}
            >
              LIÊN HỆ
            </h3>
            <ul
              className={`space-y-2 text-xs ${isDark ? 'text-white/70' : 'text-gray-600'}`}
            >
              <li>
                <span className="font-medium">Email:</span>{' '}
                <Link
                  href="mailto:webdevstudios.org@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-wds-accent transition-colors"
                >
                  webdevstudios.org@gmail.com
                </Link>
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
                <Link
                  href="https://facebook.com/webdevstudios.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-wds-accent transition-colors"
                >
                  facebook.com/webdevstudios.org
                </Link>
              </li>
              <li>
                <span className="font-medium">Văn phòng:</span> B8.04, tòa B,
                trường Đại học Công nghệ Thông tin – ĐHQG TP.HCM.
              </li>
            </ul>
          </div>

          <div>
            <h3
              className={`mb-4 text-sm font-semibold ${isDark ? 'text-white' : 'text-black'}`}
            >
              VỀ CLB
            </h3>
            <ul
              className={`space-y-2 text-xs ${isDark ? 'text-white/70' : 'text-gray-600'}`}
            >
              <li>
                <Link
                  href="/about"
                  className="hover:text-wds-accent transition-colors"
                >
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-wds-accent transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-wds-accent transition-colors"
                >
                  Chính sách đổi trả
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-10 text-center text-xs text-gray-500">
        © 2025 WebDev Studios. All rights reserved.
      </div>
    </footer>
  );
}
