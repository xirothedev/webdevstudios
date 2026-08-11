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

export interface FAQItem {
  question: string;
  answer: string;
}

export const faqItems: FAQItem[] = [
  {
    question: 'Làm thế nào để trở thành WebDev-ers?',
    answer:
      'Hàng năm, WebDev tổ chức chương trình tuyển dụng để tìm các bạn có niềm đam mê với lập trình web. Theo dõi fanpage để không bỏ lỡ mùa tuyển!',
  },
  {
    question: 'WebDev trực thuộc bộ phận nào của trường?',
    answer:
      'WebDev Studios là tổ chức trực thuộc Hội Sinh Viên trường Đại học Công nghệ thông tin, Đại học Quốc gia Thành phố Hồ Chí Minh.',
  },
  {
    question: 'Có bao nhiêu vị trí để ứng tuyển vào WebDev?',
    answer:
      'WebDev tuyển 4 vị trí chính: Bạn Lập trình, Bạn Truyền thông, Bạn Thiết kế và Bạn Quản lý dự án.',
  },
  {
    question: '"WebDev" nghĩa là gì?',
    answer:
      'WebDev là cụm từ viết tắt cho Web Developers, thể hiện mục tiêu xây dựng cộng đồng sinh viên lập trình web năng động và thực chiến.',
  },
  {
    question: 'WebDev bao nhiêu tuổi?',
    answer:
      'WebDev được thành lập ngày 6/11/2018. Đến nay, WebDev đã hơn 7 tuổi và tiếp tục phát triển cùng các thế hệ thành viên.',
  },
  {
    question: 'Chúng tôi là ai?',
    answer:
      'WebDev Studios là một câu lạc bộ học thuật lập trình web tại UIT, nơi các bạn sinh viên cùng học hỏi, xây dựng dự án và chia sẻ kiến thức.',
  },
  {
    question: 'Tôi có cần phải biết code không?',
    answer:
      'Không bắt buộc nhưng kỹ năng lập trình cơ bản sẽ giúp bạn hòa nhập nhanh hơn. WebDev luôn hỗ trợ các bạn mới.',
  },
  {
    question: 'Slogan của WebDev là gì?',
    answer: 'Khởi nguồn - Sáng tạo - Nắm bắt.',
  },
];
