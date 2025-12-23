import type { Metadata } from 'next';

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://webdevstudios.xirothedev.site/';
const siteName = 'WebDev Studios';

// SEO Images mapping: route path → SEO image path
export const SEO_IMAGES: Record<string, string> = {
  '/': '/seo/landing.png',
  '/about': '/seo/about.png',
  '/shop': '/seo/shop.png',
  '/generation': '/seo/generation.png',
  '/faq': '/seo/faq.png',
};
const siteDescription =
  'WebDev Studios là nơi tập hợp các bạn sinh viên có niềm đam mê với Lập trình Web nhằm tạo ra một môi trường học tập và giải trí để các bạn có thể học hỏi, trau dồi kỹ năng và phát triển bản thân.';
const siteKeywords = [
  'WebDev Studios',
  'Câu lạc bộ lập trình web',
  'UIT',
  'Sinh viên UIT',
  'Lập trình web',
  'Web development',
  'Frontend',
  'Backend',
  'Fullstack',
  'React',
  'Next.js',
  'JavaScript',
  'TypeScript',
  'Cộng đồng lập trình',
  'Học lập trình',
];

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | Câu lạc bộ lập trình web của sinh viên UIT`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: siteKeywords,
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: siteUrl,
    siteName,
    title: `${siteName} | Câu lạc bộ lập trình web của sinh viên UIT`,
    description: siteDescription,
    images: [
      {
        url: '/icon-512x512.png',
        width: 512,
        height: 512,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} | Câu lạc bộ lập trình web của sinh viên UIT`,
    description: siteDescription,
    images: ['/icon-512x512.png'],
    creator: '@webdevstudios',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
  alternates: {
    canonical: siteUrl,
  },
  category: 'Education',
};

export function createPageMetadata({
  title,
  description,
  path,
  image,
  keywords,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  keywords?: string[];
}): Metadata {
  const url = `${siteUrl}${path}`;
  const fullTitle = `${title} | ${siteName}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords || siteKeywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : defaultMetadata.openGraph?.images,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: image ? [image] : ['/icon-512x512.png'],
    },
  };
}
