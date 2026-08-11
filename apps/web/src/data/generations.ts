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

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  isLeader?: boolean;
}

export interface Generation {
  gen: number;
  period: string;
  members: TeamMember[];
}

export const generations: Generation[] = [
  {
    gen: 1,
    period: '2018 - 2019',
    members: [
      {
        id: '1-1',
        name: 'Nguyễn Minh Đức',
        role: 'Founder, Chủ nhiệm, Trưởng ban Lập trình',
        avatar: '/avatars/gen-1/nguyen-minh-duc.webp',
        isLeader: true,
      },
      {
        id: '1-2',
        name: 'Nguyễn Tiến Khang',
        role: 'Phó chủ nhiệm, Trưởng ban Nhân sự',
        avatar: '/avatars/gen-1/nguyen-tien-khang.webp',
        isLeader: true,
      },
      {
        id: '1-3',
        name: 'Nguyễn Thành Luân',
        role: 'Phó chủ nhiệm',
        avatar: '/avatars/gen-1/nguyen-thanh-luan.webp',
        isLeader: true,
      },
      {
        id: '1-4',
        name: 'Mạc Huy Tú',
        role: 'Trưởng Ban Truyền Thông',
        avatar: '/avatars/gen-1/mac-huy-tu.webp',
      },
      {
        id: '1-5',
        name: 'Nguyễn Hồng Phi',
        role: 'Trưởng Ban Đào Tạo',
        avatar: '/avatars/gen-1/nguyen-hong-phi.webp',
      },
      {
        id: '1-6',
        name: 'To Thúy Hàng',
        role: 'Trưởng ban Đối ngoại',
        avatar: '/avatars/gen-1/to-thuy-hang.webp',
      },
      {
        id: '1-7',
        name: 'Nguyễn Trần Ngọc Anh',
        role: 'Trưởng Ban Quản Lý Dự Án',
        avatar: '/avatars/gen-1/nguyen-tran-ngoc-anh.webp',
      },
    ],
  },
  {
    gen: 2,
    period: '2019 - 2020',
    members: [
      {
        id: '2-1',
        name: 'Nguyễn Minh Đức',
        role: 'Founder, Chủ nhiệm',
        avatar: '/avatars/gen-2/nguyen-minh-duc.webp',
        isLeader: true,
      },
      {
        id: '2-2',
        name: 'Hoàng Công Minh',
        role: 'Phó chủ nhiệm, trưởng ban Quản lý dự án',
        avatar: '/avatars/gen-2/hoang-cong-minh.webp',
        isLeader: true,
      },
      {
        id: '2-3',
        name: 'Cao Quyết Chiến',
        role: 'Phó chủ nhiệm',
        avatar: '/avatars/gen-2/cao-quyet-chien.webp',
        isLeader: true,
      },
      {
        id: '2-4',
        name: 'Hồ Trần Thiện Đạt',
        role: 'Trưởng ban Đối ngoại',
        avatar: '/avatars/gen-2/ho-tran-thien-dat.webp',
      },
      {
        id: '2-5',
        name: 'Võ Phi Nhật Duy',
        role: 'Trưởng ban Lập trình',
        avatar: '/avatars/gen-2/vo-phi-nhat-duy.webp',
      },
      {
        id: '2-6',
        name: 'Nguyễn Nữ Châu Giang',
        role: 'Trưởng ban Truyền thông',
        avatar: '/avatars/gen-2/nguyen-nu-chau-giang.webp',
      },
      {
        id: '2-7',
        name: 'Tô Thúy Hằng',
        role: 'Thư Ký CLB',
        avatar: '/avatars/gen-2/to-thuy-hang.webp',
      },
      {
        id: '2-8',
        name: 'Nguyễn Yến Chi',
        role: 'Trưởng ban Nhân sự',
        avatar: '/avatars/gen-2/nguyen-yen-chi.webp',
      },
      {
        id: '2-9',
        name: 'Võ Văn Tài Triển',
        role: 'Trưởng ban Marketing, phó ban Truyền thông',
        avatar: '/avatars/gen-2/vo-van-tai-trien.webp',
      },
    ],
  },
  {
    gen: 3,
    period: '2020 - 2021',
    members: [
      {
        id: '3-1',
        name: 'Trần Đức Hoàng',
        role: 'Chủ nhiệm',
        avatar: '/avatars/gen-3/tran-duc-hoang.webp',
        isLeader: true,
      },
      {
        id: '3-2',
        name: 'Vương Đức Quân',
        role: 'Phó Chủ nhiệm',
        avatar: '/avatars/gen-3/vuong-duc-quan.webp',
        isLeader: true,
      },
      {
        id: '3-3',
        name: 'Phạm Hoàng Phúc',
        role: 'Phó Chủ nhiệm CLB, Trưởng ban Lập trình',
        avatar: '/avatars/gen-3/pham-hoang-phuc.webp',
        isLeader: true,
      },
      {
        id: '3-4',
        name: 'Nguyễn Thị Mỹ Dung',
        role: 'Trưởng ban Truyền thông',
        avatar: '/avatars/gen-3/nguyen-thi-my-dung.webp',
      },
      {
        id: '3-5',
        name: 'Lữ Thị Ngọc Hiền',
        role: 'Trưởng Ban Quản lý dự án',
        avatar: '/avatars/gen-3/lu-thi-ngoc-hien.webp',
      },
      {
        id: '3-6',
        name: 'Nguyễn Yến Chi',
        role: 'Trưởng ban Sự kiện',
        avatar: '/avatars/gen-3/nguyen-yen-chi.webp',
      },
    ],
  },
  {
    gen: 4,
    period: '2021 - 2022',
    members: [
      {
        id: '4-1',
        name: 'Nguyễn Duy Tùng',
        role: 'Chủ nhiệm',
        avatar: '/avatars/gen-4/nguyen-duy-tung.webp',
        isLeader: true,
      },
      {
        id: '4-2',
        name: 'Ngô Thị Tường Vi',
        role: 'Phó Chủ nhiệm',
        avatar: '/avatars/gen-4/ngo-thi-tuong-vi.webp',
        isLeader: true,
      },
      {
        id: '4-3',
        name: 'Ngô Văn Phóng',
        role: 'Phó Chủ nhiệm',
        avatar: '/avatars/gen-4/ngo-van-phong.webp',
        isLeader: true,
      },
      {
        id: '4-4',
        name: 'Lê Nguyễn Minh Trung',
        role: 'Thành viên ban chủ nhiệm',
        avatar: '/avatars/gen-4/le-nguyen-minh-trung.webp',
      },
      {
        id: '4-5',
        name: 'Đặng Trúc Lam',
        role: 'Thành viên ban chủ nhiệm',
        avatar: '/avatars/gen-4/dang-truc-lam.webp',
      },
    ],
  },
  {
    gen: 5,
    period: '2022 - 2023',
    members: [
      {
        id: '5-1',
        name: 'Nguyễn Hoàng Long',
        role: 'Chủ Nhiệm',
        avatar: '/avatars/gen-5/nguyen-hoang-long.webp',
        isLeader: true,
      },
      {
        id: '5-2',
        name: 'Đoàn Hải Đăng',
        role: 'Phó Chủ Nhiệm',
        avatar: '',
        isLeader: true,
      },
      {
        id: '5-3',
        name: 'Nguyễn Ngọc Sơn',
        role: 'Phó Chủ Nhiệm',
        avatar: '/avatars/gen-5/nguyen-ngoc-son.webp',
        isLeader: true,
      },
      {
        id: '5-4',
        name: 'Nguyễn Thị Mỹ Duyên',
        role: 'Thành viên ban chủ nhiệm',
        avatar: '/avatars/gen-5/nguyen-thi-my-duyen.webp',
      },
      {
        id: '5-5',
        name: 'Hứa Phú Thiên',
        role: 'Thành viên ban chủ nhiệm',
        avatar: '/avatars/gen-5/hua-phu-thien.webp',
      },
    ],
  },
  {
    gen: 6,
    period: '2023 - 2024',
    members: [
      {
        id: '6-1',
        name: 'Trần Minh Chính',
        role: 'Chủ Nhiệm',
        avatar: '/avatars/gen-6/tran-minh-chinh.webp',
        isLeader: true,
      },
      {
        id: '6-2',
        name: 'Lương Võ Phương Dung',
        role: 'Phó Chủ Nhiệm',
        avatar: '/avatars/gen-6/luong-vo-phuong-dung.webp',
        isLeader: true,
      },
      {
        id: '6-3',
        name: 'Trương Thiên Lộc',
        role: 'Phó Chủ Nhiệm',
        avatar: '/avatars/gen-6/truong-thien-loc.webp',
        isLeader: true,
      },
      {
        id: '6-4',
        name: 'Nguyễn Thị Nguyệt Ánh',
        role: 'Thành viên ban chủ nhiệm',
        avatar: '/avatars/gen-6/nguyen-thi-nguyet-anh.webp',
      },
      {
        id: '6-5',
        name: 'Tô Thị Hồng Anh',
        role: 'Thành viên ban chủ nhiệm',
        avatar: '/avatars/gen-6/to-thi-hong-anh.webp',
      },
    ],
  },
  {
    gen: 7,
    period: '2024 - 2025',
    members: [
      {
        id: '7-1',
        name: 'Phương Dung',
        role: 'Chủ Nhiệm',
        avatar: '/avatars/gen-7/phuong-dung.webp',
        isLeader: true,
      },
      {
        id: '7-2',
        name: 'Minh Quân',
        role: 'Phó Chủ Nhiệm',
        avatar: '/avatars/gen-7/minh-quan.webp',
        isLeader: true,
      },
      {
        id: '7-3',
        name: 'Quang Đăng',
        role: 'Phó Chủ Nhiệm',
        avatar: '/avatars/gen-7/quang-dang.webp',
        isLeader: true,
      },
      {
        id: '7-4',
        name: 'Chí Dĩnh',
        role: 'Thành viên ban chủ nhiệm',
        avatar: '/avatars/gen-7/chi-dinh.webp',
      },
      {
        id: '7-5',
        name: 'Bình Nguyên',
        role: 'Thành viên ban chủ nhiệm',
        avatar: '/avatars/gen-7/binh-nguyen.webp',
      },
    ],
  },
  {
    gen: 8,
    period: '2025 - 2026',
    members: [
      {
        id: '8-1',
        name: 'Chướng Hồng Văn',
        role: 'Trưởng ban Lập trình',
        avatar: '/avatars/gen-8/chuong-hong-van.webp',
      },
      {
        id: '8-2',
        name: 'Huỳnh Quốc Sang',
        role: 'Trưởng ban Nhân sự',
        avatar: '/avatars/gen-8/huynh-quoc-sang.webp',
      },
      {
        id: '8-3',
        name: 'Linh Thị Huyễn',
        role: 'Trưởng ban Quản lý dự án',
        avatar: '/avatars/gen-8/linh-thi-huyen.webp',
      },
      {
        id: '8-4',
        name: 'Nguyễn Tuấn Vũ',
        role: 'Trưởng ban Sự kiện',
        avatar: '/avatars/gen-8/nguyen-tuan-vu.webp',
      },
      {
        id: '8-5',
        name: 'Phan Chí Kiên',
        role: 'Trưởng ban Truyền thông',
        avatar: '/avatars/gen-8/phan-chi-kien.webp',
      },
    ],
  },
];

// Helper function to get initials from name
export const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
