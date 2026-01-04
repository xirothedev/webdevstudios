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

import { siteUrl } from './metadata';

export interface OrganizationSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs?: string[];
  contactPoint?: {
    '@type': string;
    contactType: string;
    email?: string;
    url?: string;
  };
}

export interface WebSiteSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  description: string;
  potentialAction?: {
    '@type': string;
    target: {
      '@type': string;
      urlTemplate: string;
    };
    'query-input': string;
  };
}

export interface BreadcrumbSchema {
  '@context': string;
  '@type': string;
  itemListElement: Array<{
    '@type': string;
    position: number;
    name: string;
    item?: string;
  }>;
}

export function getOrganizationSchema(): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'WebDev Studios',
    url: siteUrl,
    logo: `${siteUrl}/icons/icon-512x512.png`,
    description:
      'WebDev Studios là nơi tập hợp các bạn sinh viên có niềm đam mê với Lập trình Web nhằm tạo ra một môi trường học tập và giải trí để các bạn có thể học hỏi, trau dồi kỹ năng và phát triển bản thân.',
    sameAs: [
      // Add social media links here
      // 'https://www.facebook.com/webdevstudios',
      // 'https://twitter.com/webdevstudios',
      // 'https://github.com/webdevstudios',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      // email: 'contact@webdevstudios.org',
      // url: `${siteUrl}/contact`,
    },
  };
}

export function getWebSiteSchema(): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'WebDev Studios',
    url: siteUrl,
    description:
      'WebDev Studios là nơi tập hợp các bạn sinh viên có niềm đam mê với Lập trình Web nhằm tạo ra một môi trường học tập và giải trí để các bạn có thể học hỏi, trau dồi kỹ năng và phát triển bản thân.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function getBreadcrumbSchema(
  items: Array<{ name: string; url?: string }>
): BreadcrumbSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url && { item: item.url }),
    })),
  };
}

export function getPageSchema({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
}: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url,
    ...(image && {
      image: image.startsWith('http') ? image : `${siteUrl}${image}`,
    }),
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    publisher: getOrganizationSchema(),
  };
}
