// Port of apps/web src/lib/metadata.ts: Next `Metadata` objects → unhead head entries.
// Pages call usePageMeta({ title, description, path, image?, keywords? }) — same args as
// createPageMetadata in apps/web — to set title/description/canonical/OG/Twitter tags.
import { useHead, type UseHeadInput } from '@unhead/vue';

import { SITE_URL } from './constants';

export const siteUrl = SITE_URL;
const siteName = 'WebDev Studios';

// SEO Images mapping: route path → SEO image path
export const SEO_IMAGES: Record<string, string> = {
  '/': '/seo/landing.webp',
  '/about': '/seo/about.webp',
  '/shop': '/seo/shop.webp',
  '/shop/ao-thun': '/seo/shop/ao-thun.webp',
  '/shop/moc-khoa': '/seo/shop/moc-khoa.webp',
  '/shop/day-deo': '/seo/shop/day-deo.webp',
  '/shop/pad-chuot': '/seo/shop/pad-chuot.webp',
  '/cart': '/seo/shop.webp',
  '/generation': '/seo/generation.webp',
  '/faq': '/seo/faq.webp',
  '/terms': '/seo/legal/terms.webp',
  '/privacy': '/seo/legal/privacy.webp',
  '/refund': '/seo/legal/refund.webp',
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

// unhead has no Next-style title.template — createPageMetadata already computes "%s | WebDev Studios"
export const defaultMetadata: UseHeadInput = {
  title: `${siteName} | Câu lạc bộ lập trình web của sinh viên UIT`,
  meta: [
    { name: 'description', content: siteDescription },
    { name: 'keywords', content: siteKeywords.join(', ') },
    { name: 'author', content: siteName },
    { name: 'creator', content: siteName },
    { name: 'publisher', content: siteName },
    { name: 'category', content: 'Education' },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: 'vi_VN' },
    { property: 'og:url', content: siteUrl },
    { property: 'og:site_name', content: siteName },
    { property: 'og:title', content: `${siteName} | Câu lạc bộ lập trình web của sinh viên UIT` },
    { property: 'og:description', content: siteDescription },
    { property: 'og:image', content: `${siteUrl}/icon-512x512.png` },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: `${siteName} | Câu lạc bộ lập trình web của sinh viên UIT` },
    { name: 'twitter:description', content: siteDescription },
    { name: 'twitter:image', content: `${siteUrl}/icon-512x512.png` },
    { name: 'twitter:creator', content: '@webdevstudios' },
  ],
  link: [{ rel: 'canonical', href: siteUrl }],
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
}): UseHeadInput {
  const url = `${siteUrl}${path}`;
  const fullTitle = `${title} | ${siteName}`;
  const ogImage = `${siteUrl}${image ?? SEO_IMAGES[path] ?? '/icon-512x512.png'}`;

  return {
    title: fullTitle,
    meta: [
      { name: 'description', content: description },
      { name: 'keywords', content: (keywords || siteKeywords).join(', ') },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:image', content: ogImage },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: ogImage },
    ],
    link: [{ rel: 'canonical', href: url }],
  };
}

/** Page-level head: title/description/canonical/OG/Twitter for the current page. */
export function usePageMeta(opts: {
  title: string;
  description: string;
  path: string;
  image?: string;
  keywords?: string[];
}) {
  useHead(createPageMetadata(opts));
}
