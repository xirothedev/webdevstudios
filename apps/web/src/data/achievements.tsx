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

import {
  Calendar,
  Crown,
  Globe,
  Medal,
  Star,
  Target,
  Trophy,
} from 'lucide-react';
import type { ReactNode } from 'react';

export interface StatItem {
  id: number;
  label: string;
  value: string;
  icon: ReactNode;
}

export interface AwardItem {
  id: number;
  title: string;
  rank: string;
  organizer: string;
  description: string;
  icon: ReactNode;
}

export interface AwardYearGroup {
  year: number;
  items: AwardItem[];
}

export const STATS: StatItem[] = [
  {
    id: 1,
    label: 'Giải thưởng',
    value: '35+',
    icon: <Trophy size={20} />,
  },
  {
    id: 2,
    label: 'Năm hoạt động',
    value: '10',
    icon: <Calendar size={20} />,
  },
  {
    id: 3,
    label: 'Dự án Community',
    value: '50+',
    icon: <Target size={20} />,
  },
];

export const AWARDS: AwardYearGroup[] = [
  {
    year: 2024,
    items: [
      {
        id: 1,
        title: 'Vô địch Hackathon UIT 2024',
        rank: 'Giải Nhất',
        organizer: 'Trường ĐH Công nghệ Thông tin',
        description:
          'Dự án "Smart Campus" tích hợp AI hỗ trợ sinh viên khiếm thị, vượt qua 50 đội thi.',
        icon: <Trophy size={32} className="text-yellow-400" />,
      },
      {
        id: 2,
        title: 'Google Solution Challenge',
        rank: 'Top 10 Global',
        organizer: 'Google Developers',
        description:
          'Lọt vào vòng chung kết khu vực Đông Nam Á với giải pháp bảo vệ môi trường.',
        icon: <Globe size={32} className="text-blue-400" />,
      },
    ],
  },
  {
    year: 2023,
    items: [
      {
        id: 3,
        title: 'Olympic Tin học Sinh viên',
        rank: 'Giải Nhì (Khối Chuyên)',
        organizer: 'Hội Tin học Việt Nam',
        description:
          'Thành viên đội tuyển trường đạt thành tích cao tại kỳ thi quốc gia.',
        icon: <Medal size={32} className="text-gray-300" />,
      },
      {
        id: 4,
        title: 'CLB Học thuật Xuất sắc',
        rank: 'Danh hiệu',
        organizer: 'Đoàn trường ĐH CNTT',
        description:
          'Được vinh danh là CLB có đóng góp tích cực nhất cho phong trào học thuật.',
        icon: <Crown size={32} className="text-[#F7931E]" />,
      },
      {
        id: 5,
        title: 'Best Web Design Award',
        rank: 'Giải Ba',
        organizer: 'FPT Software',
        description: 'Cuộc thi thiết kế giao diện người dùng sáng tạo.',
        icon: <Star size={32} className="text-orange-300" />,
      },
    ],
  },
];
