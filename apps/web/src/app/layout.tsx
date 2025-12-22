import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'WebDev Studios | Câu lạc bộ lập trình web của sinh viên UIT',
  description:
    'WebDev Studios là nơi tập hợp các bạn sinh viên có niềm đam mê với Lập trình Web nhằm tạo ra một môi trường học tập và giải trí để các bạn có thể học hỏi, trau dồi kỹ năng và phát triển bản thân.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
