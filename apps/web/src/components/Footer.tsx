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
                WDS Shop
              </span>
            </div>
            <p
              className={`text-xs ${isDark ? 'text-white/70' : 'text-gray-600'}`}
            >
              © 2025 WebDev Studios. Vật phẩm chính thức của CLB.
            </p>
          </div>

          <div>
            <h4
              className={`mb-4 text-sm font-semibold ${isDark ? 'text-white' : 'text-black'}`}
            >
              SẢN PHẨM
            </h4>
            <ul
              className={`space-y-2 text-xs ${isDark ? 'text-white/70' : 'text-gray-600'}`}
            >
              <li>
                <a href="#" className="hover:text-wds-accent transition-colors">
                  Áo thun
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-wds-accent transition-colors">
                  Mũ & Phụ kiện
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-wds-accent transition-colors">
                  Túi & Balo
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-wds-accent transition-colors">
                  Bộ sưu tập đặc biệt
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4
              className={`mb-4 text-sm font-semibold ${isDark ? 'text-white' : 'text-black'}`}
            >
              LIÊN HỆ
            </h4>
            <ul
              className={`space-y-2 text-xs ${isDark ? 'text-white/70' : 'text-gray-600'}`}
            >
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
                0794161275
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
            <h4
              className={`mb-4 text-sm font-semibold ${isDark ? 'text-white' : 'text-black'}`}
            >
              VỀ CLB
            </h4>
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
                <a href="#" className="hover:text-wds-accent transition-colors">
                  Chính sách đổi trả
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
