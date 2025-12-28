'use client';

import Image from 'next/image';
import Link from 'next/link';

import { contactInfo, footerSections } from '@/data/footer';

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
                  alt="WebDev Studios"
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
              className={`text-xs ${isDark ? 'text-white/70' : 'text-gray-600'}`}
            >
              WebDev Studios là nơi tập hợp các bạn sinh viên có niềm đam mê với
              Lập trình Web nhằm tạo ra một môi trường học tập và giải trí để
              các bạn có thể học hỏi, trau dồi kỹ năng và phát triển bản thân.
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3
                className={`mb-4 text-sm font-semibold ${isDark ? 'text-white' : 'text-black'}`}
              >
                {section.title}
              </h3>
              <ul
                className={`space-y-2 text-xs ${isDark ? 'text-white/70' : 'text-gray-600'}`}
              >
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={link.target}
                      rel={link.rel}
                      className="hover:text-wds-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3
              className={`mb-4 text-sm font-semibold ${isDark ? 'text-white' : 'text-black'}`}
            >
              LIÊN HỆ
            </h3>
            <ul
              className={`space-y-2 text-xs ${isDark ? 'text-white/70' : 'text-gray-600'}`}
            >
              {contactInfo.map((item, index) => (
                <li key={index}>
                  {item.href ? (
                    <>
                      <span className="font-medium">{item.label}</span>{' '}
                      <Link
                        href={item.href}
                        target={item.target}
                        rel={item.rel}
                        className="hover:text-wds-accent transition-colors"
                      >
                        {item.content}
                      </Link>
                    </>
                  ) : (
                    <>
                      <span className="font-medium">{item.label}</span>{' '}
                      {item.content}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-10 space-y-2 text-center text-xs text-gray-500">
        <div>© 2025 WebDev Studios. All rights reserved.</div>
        <div className="flex items-center justify-center gap-2">
          <span>Developed & Designed by</span>
          <Link
            href="mailto:working@xirothedev.site"
            className="hover:text-wds-accent transition-colors"
          >
            Xiro The Dev
          </Link>
          <span>•</span>
          <Link
            href="https://github.com/xirothedev"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-wds-accent transition-colors"
          >
            github/xirothedev
          </Link>
        </div>
      </div>
    </footer>
  );
}
