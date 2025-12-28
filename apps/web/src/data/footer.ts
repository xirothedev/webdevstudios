export type FooterLink = {
  label: string;
  href: string;
  target?: '_blank';
  rel?: string;
};

export type FooterSection = {
  title: string;
  links: FooterLink[];
};

export type ContactInfo = {
  label: string;
  content: string;
  href?: string;
  target?: '_blank';
  rel?: string;
};

export const footerSections: FooterSection[] = [
  {
    title: 'VỀ CLB',
    links: [
      { label: 'Về chúng tôi', href: '/about' },
      { label: 'Thành tích', href: '/achievements' },
      { label: 'Hoạt động', href: '/activities' },
      { label: 'Đối tác', href: '/partner' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Thế hệ', href: '/generation' },
    ],
  },
  {
    title: 'ĐIỀU KHOẢN',
    links: [
      { label: 'Điều khoản sử dụng', href: '/terms' },
      { label: 'Chính sách quyền riêng tư', href: '/privacy' },
      // { label: 'Chính sách đổi trả', href: '/refund' },
    ],
  },
];

export const contactInfo: ContactInfo[] = [
  {
    label: 'Email:',
    content: 'webdevstudios.org@gmail.com',
    href: 'mailto:webdevstudios.org@gmail.com',
    target: '_blank',
    rel: 'noopener noreferrer',
  },
  {
    label: 'Chủ nhiệm:',
    content: 'Lâm Chí Dĩnh - 0794161275',
    href: 'tel:0794161275',
  },
  {
    label: 'Fanpage:',
    content: 'facebook.com/webdevstudios.org',
    href: 'https://facebook.com/webdevstudios.org',
    target: '_blank',
    rel: 'noopener noreferrer',
  },
  {
    label: 'Văn phòng:',
    content: 'B8.04, tòa B, trường Đại học Công nghệ Thông tin – ĐHQG TP.HCM.',
  },
];
