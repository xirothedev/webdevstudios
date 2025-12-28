'use client';

import { ChevronRight, Mail } from 'lucide-react';

export function NewsletterCTA() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Placeholder - no API integration
    console.log('Newsletter subscription placeholder');
  };

  return (
    <section className="mt-32 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#111] px-6 py-16 text-center md:px-20 md:py-24">
          <div className="pointer-events-none absolute top-0 right-0 p-12 opacity-5">
            <Mail size={300} className="text-wds-accent" />
          </div>

          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="mb-4 text-3xl font-bold text-white">
              Đừng bỏ lỡ sự kiện tiếp theo!
            </h2>
            <p className="mb-8 text-gray-400">
              Đăng ký nhận thông báo về các Workshop, Hackathon và sự kiện tuyển
              thành viên mới nhất từ WebDev Studios.
            </p>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                placeholder="Nhập email sinh viên của bạn..."
                className="focus:border-wds-accent flex-1 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-white transition-all focus:bg-white/10 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-wds-accent flex items-center justify-center gap-2 rounded-full px-8 py-3 font-bold text-black transition-colors hover:bg-white"
              >
                Đăng ký <ChevronRight size={18} />
              </button>
            </form>

            <p className="mt-4 text-xs text-gray-600">
              *Chúng tôi cam kết không spam. Bạn có thể hủy đăng ký bất cứ lúc
              nào.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
