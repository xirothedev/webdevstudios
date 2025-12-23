import Link from 'next/link';

import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { faqItems } from '@/data/faq';

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="light" />

      <section className="to-wds-secondary/30 bg-linear-to-b from-white via-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pt-20 pb-16">
          <div className="flex flex-col gap-4 text-center">
            <span className="text-wds-accent text-sm font-semibold tracking-wide uppercase">
              FAQ
            </span>
            <h1 className="text-3xl leading-tight font-bold text-balance text-black sm:text-4xl">
              Giải đáp nhanh những câu hỏi về WebDev Studios
            </h1>
            <p className="text-base text-pretty text-gray-600 sm:text-lg">
              Tất cả thông tin về tuyển thành viên, hoạt động, cơ hội học tập và
              dự án. Nếu bạn còn câu hỏi khác, hãy liên hệ để được hỗ trợ ngay.
            </p>

            <div className="mx-auto flex flex-wrap items-center justify-center gap-3">
              <Link
                href="mailto:webdevstudios.org@gmail.com"
                className="bg-wds-accent hover:bg-wds-accent/90 shadow-wds-accent/30 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-black transition hover:shadow-md"
              >
                Gửi email
              </Link>
              <Link
                href="https://facebook.com/webdevstudios.org"
                target="_blank"
                rel="noopener noreferrer"
                className="border-wds-accent text-wds-accent hover:bg-wds-accent/10 inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition"
              >
                Nhắn tin fanpage
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {faqItems.map((item) => (
              <article
                key={item.question}
                className="group bg-wds-accent/10 border-wds-accent/30 hover:border-wds-accent/60 shadow-wds-accent/10 hover:shadow-wds-accent/20 relative flex flex-col gap-3 rounded-2xl border px-5 py-4 transition-shadow duration-200"
              >
                <h2 className="text-base leading-snug font-semibold text-black">
                  {item.question}
                </h2>
                <p className="text-sm leading-relaxed text-gray-700">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>

          <div className="border-wds-accent/30 shadow-wds-accent/20 relative flex flex-col gap-3 rounded-2xl border bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-black">
                Cần hỗ trợ thêm? Chúng tôi luôn sẵn sàng.
              </p>
              <p className="text-sm text-gray-600">
                Gọi trực tiếp Chủ nhiệm:{' '}
                <span className="font-semibold">0794161275</span> hoặc email:{' '}
                <span className="font-semibold">
                  webdevstudios.org@gmail.com
                </span>
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="tel:0794161275"
                className="bg-wds-accent hover:bg-wds-accent/90 inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-black transition"
              >
                Gọi ngay
              </Link>
              <Link
                href="/about"
                className="border-wds-accent text-wds-accent hover:bg-wds-accent/10 inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition"
              >
                Về chúng tôi
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer variant="light" />
    </div>
  );
}
