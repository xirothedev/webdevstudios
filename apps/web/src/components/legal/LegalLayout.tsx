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

import Link from 'next/link';
import { useEffect, useState } from 'react';

type TocItem = {
  id: string;
  label: string;
};

interface LegalLayoutProps {
  title: string;
  toc: TocItem[];
  children: React.ReactNode;
}

export function LegalLayout({ title, toc, children }: LegalLayoutProps) {
  const [activeId, setActiveId] = useState<string | null>(toc[0]?.id ?? null);

  useEffect(() => {
    if (!toc.length || typeof window === 'undefined') return;

    const headings = toc
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => !!el);

    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              (a.target as HTMLElement).offsetTop -
              (b.target as HTMLElement).offsetTop
          );

        if (visible[0]?.target) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: '-40% 0px -50% 0px',
        threshold: 0.1,
      }
    );

    headings.forEach((heading) => observer.observe(heading));

    return () => {
      observer.disconnect();
    };
  }, [toc]);

  const handleClickToc =
    (id: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      const el = document.getElementById(id);
      if (!el) return;

      const y = el.getBoundingClientRect().top + window.scrollY - 96;

      window.history.replaceState(null, '', `#${id}`);
      window.scrollTo({ top: y, behavior: 'smooth' });
    };

  return (
    <section className="mx-auto flex max-w-5xl gap-10 px-4 sm:px-6 lg:px-8">
      <article className="min-w-0 flex-1">
        <header className="mb-8 flex items-start justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <p className="text-wds-accent/80 text-[11px] font-semibold tracking-[0.25em] uppercase">
              Chính sách &amp; pháp lý
            </p>
            <h1 className="text-wds-text mt-3 text-2xl font-semibold">
              {title}
            </h1>
            <p className="mt-2 text-xs text-neutral-400">
              Vui lòng đọc kỹ các điều khoản sau trước khi tiếp tục sử dụng WDS
              Shop.
            </p>
          </div>

          <Link
            href="/"
            className="text-wds-text hover:border-wds-accent/60 hover:bg-wds-accent/20 hover:text-wds-accent hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur transition sm:inline-flex"
          >
            <span className="mr-1.5 text-base leading-none">&larr;</span>
            <span>Quay lại trang chủ</span>
          </Link>
        </header>

        <div className="space-y-5 text-sm leading-relaxed text-neutral-200">
          {children}
        </div>
      </article>

      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="sticky top-28 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-neutral-300 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur">
          <p className="text-wds-accent mb-3 text-[11px] font-semibold tracking-[0.25em] uppercase">
            Mục lục
          </p>
          <nav className="space-y-1.5">
            {toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={handleClickToc(item.id)}
                aria-current={activeId === item.id ? 'true' : undefined}
                className={`block rounded-md px-2 py-1.5 text-[13px] transition ${
                  activeId === item.id
                    ? 'bg-wds-accent/15 text-wds-text shadow-[0_0_0_1px_rgba(255,255,255,0.12)]'
                    : 'hover:text-wds-text text-neutral-300 hover:bg-white/5'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </aside>
    </section>
  );
}
