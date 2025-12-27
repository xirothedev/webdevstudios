import './globals.css';

import { QueryClientProvider } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import { Toaster } from 'sonner';

import { CsrfInitializer } from '@/components/csrf-initializer';
import { QueryDevtools } from '@/components/ReactQueryDevtools';
import { StructuredData } from '@/components/StructuredData';
import { AuthProvider } from '@/contexts/auth.context';
import { CartDrawerProvider } from '@/contexts/cart-drawer.context';
import {
  createPageMetadata,
  defaultMetadata,
  SEO_IMAGES,
} from '@/lib/metadata';
import { queryClient } from '@/lib/query-client';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
});

// Root layout metadata - applies to root page (/)
export const metadata: Metadata = {
  ...defaultMetadata,
  ...createPageMetadata({
    title: 'Trang chủ',
    description:
      'WebDev Studios - Câu lạc bộ lập trình web của sinh viên UIT. Nơi tập hợp các bạn sinh viên có niềm đam mê với Lập trình Web để học hỏi, trau dồi kỹ năng và phát triển bản thân.',
    path: '/',
    image: SEO_IMAGES['/'],
    keywords: [
      'WebDev Studios',
      'Câu lạc bộ lập trình web UIT',
      'Học lập trình web',
      'Cộng đồng lập trình viên',
    ],
  }),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'icon',
        url: '/favicon.ico',
      },
    ],
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'WebDev Studios',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className="dark scroll-smooth"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className={`${inter.variable} antialiased`}>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={null}>
            <AuthProvider>
              <CartDrawerProvider>
                <CsrfInitializer />
                <StructuredData />
                <main className="min-h-screen">{children}</main>
                <Toaster position="top-center" theme="dark" richColors />
              </CartDrawerProvider>
            </AuthProvider>
          </Suspense>
          <QueryDevtools />
        </QueryClientProvider>
      </body>
    </html>
  );
}
