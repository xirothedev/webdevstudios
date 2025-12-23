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
        avatar: '/avatars/gen-1/nguyen-minh-duc.png',
        isLeader: true,
      },
      {
        id: '1-2',
        name: 'Nguyễn Tiến Khang',
        role: 'Phó chủ nhiệm, Trưởng ban Nhân sự',
        avatar: '/avatars/gen-1/nguyen-tien-khang.png',
        isLeader: true,
      },
      {
        id: '1-3',
        name: 'Nguyễn Thành Luân',
        role: 'Phó chủ nhiệm',
        avatar: '/avatars/gen-1/nguyen-thanh-luan.png',
        isLeader: true,
      },
      {
        id: '1-4',
        name: 'Mạc Huy Tú',
        role: 'Trưởng Ban Truyền Thông',
        avatar: '/avatars/gen-1/mac-huy-tu.png',
      },
      {
        id: '1-5',
        name: 'Nguyễn Hồng Phi',
        role: 'Trưởng Ban Đào Tạo',
        avatar: '/avatars/gen-1/nguyen-hong-phi.png',
      },
      {
        id: '1-6',
        name: 'To Thúy Hàng',
        role: 'Trưởng ban Đối ngoại',
        avatar: '/avatars/gen-1/to-thuy-hang.png',
      },
      {
        id: '1-7',
        name: 'Nguyễn Trần Ngọc Anh',
        role: 'Trưởng Ban Quản Lý Dự Án',
        avatar: '/avatars/gen-1/nguyen-tran-ngoc-anh.png',
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
        avatar: '/avatars/gen-2/nguyen-minh-duc.png',
        isLeader: true,
      },
      {
        id: '2-2',
        name: 'Hoàng Công Minh',
        role: 'Phó chủ nhiệm, trưởng ban Quản lý dự án',
        avatar: '/avatars/gen-2/hoang-cong-minh.png',
        isLeader: true,
      },
      {
        id: '2-3',
        name: 'Cao Quyết Chiến',
        role: 'Phó chủ nhiệm',
        avatar: '/avatars/gen-2/cao-quyet-chien.png',
        isLeader: true,
      },
      {
        id: '2-4',
        name: 'Hồ Trần Thiện Đạt',
        role: 'Trưởng ban Đối ngoại',
        avatar: '/avatars/gen-2/ho-tran-thien-dat.png',
      },
      {
        id: '2-5',
        name: 'Võ Phi Nhật Duy',
        role: 'Trưởng ban Lập trình',
        avatar: '/avatars/gen-2/vo-phi-nhat-duy.png',
      },
      {
        id: '2-6',
        name: 'Nguyễn Nữ Châu Giang',
        role: 'Trưởng ban Truyền thông',
        avatar: '/avatars/gen-2/nguyen-nu-chau-giang.png',
      },
      {
        id: '2-7',
        name: 'Tô Thúy Hằng',
        role: 'Thư Ký CLB',
        avatar: '/avatars/gen-2/to-thuy-hang.png',
      },
      {
        id: '2-8',
        name: 'Nguyễn Yến Chi',
        role: 'Trưởng ban Nhân sự',
        avatar: '/avatars/gen-2/nguyen-yen-chi.png',
      },
      {
        id: '2-9',
        name: 'Võ Văn Tài Triển',
        role: 'Trưởng ban Marketing, phó ban Truyền thông',
        avatar: '/avatars/gen-2/vo-van-tai-trien.png',
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
        avatar: '/avatars/gen-3/tran-duc-hoang.png',
        isLeader: true,
      },
      {
        id: '3-2',
        name: 'Vương Đức Quân',
        role: 'Phó Chủ nhiệm',
        avatar: '/avatars/gen-3/vuong-duc-quan.png',
        isLeader: true,
      },
      {
        id: '3-3',
        name: 'Phạm Hoàng Phúc',
        role: 'Phó Chủ nhiệm CLB, Trưởng ban Lập trình',
        avatar: '/avatars/gen-3/pham-hoang-phuc.png',
        isLeader: true,
      },
      {
        id: '3-4',
        name: 'Nguyễn Thị Mỹ Dung',
        role: 'Trưởng ban Truyền thông',
        avatar: '/avatars/gen-3/nguyen-thi-my-dung.png',
      },
      {
        id: '3-5',
        name: 'Lữ Thị Ngọc Hiền',
        role: 'Trưởng Ban Quản lý dự án',
        avatar: '/avatars/gen-3/lu-thi-ngoc-hien.png',
      },
      {
        id: '3-6',
        name: 'Nguyễn Yến Chi',
        role: 'Trưởng ban Sự kiện',
        avatar: '/avatars/gen-3/nguyen-yen-chi.png',
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
        avatar: '/avatars/gen-4/nguyen-duy-tung.png',
        isLeader: true,
      },
      {
        id: '4-2',
        name: 'Ngô Thị Tường Vi',
        role: 'Phó Chủ nhiệm',
        avatar: '/avatars/gen-4/ngo-thi-tuong-vi.png',
        isLeader: true,
      },
      {
        id: '4-3',
        name: 'Ngô Văn Phóng',
        role: 'Phó Chủ nhiệm',
        avatar: '/avatars/gen-4/ngo-van-phong.png',
        isLeader: true,
      },
      {
        id: '4-4',
        name: 'Lê Nguyễn Minh Trung',
        role: 'Thành viên ban chủ nhiệm',
        avatar: '/avatars/gen-4/le-nguyen-minh-trung.png',
      },
      {
        id: '4-5',
        name: 'Đặng Trúc Lam',
        role: 'Thành viên ban chủ nhiệm',
        avatar: '/avatars/gen-4/dang-truc-lam.png',
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
        avatar: '/avatars/gen-5/nguyen-hoang-long.png',
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
        avatar: '/avatars/gen-5/nguyen-ngoc-son.png',
        isLeader: true,
      },
      {
        id: '5-4',
        name: 'Nguyễn Thị Mỹ Duyên',
        role: 'Thành viên ban chủ nhiệm',
        avatar: '/avatars/gen-5/nguyen-thi-my-duyen.png',
      },
      {
        id: '5-5',
        name: 'Hứa Phú Thiên',
        role: 'Thành viên ban chủ nhiệm',
        avatar: '/avatars/gen-5/hua-phu-thien.png',
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
        avatar: '/avatars/gen-6/tran-minh-chinh.png',
        isLeader: true,
      },
      {
        id: '6-2',
        name: 'Lương Võ Phương Dung',
        role: 'Phó Chủ Nhiệm',
        avatar: '/avatars/gen-6/luong-vo-phuong-dung.png',
        isLeader: true,
      },
      {
        id: '6-3',
        name: 'Trương Thiên Lộc',
        role: 'Phó Chủ Nhiệm',
        avatar: '/avatars/gen-6/truong-thien-loc.png',
        isLeader: true,
      },
      {
        id: '6-4',
        name: 'Nguyễn Thị Nguyệt Ánh',
        role: 'Thành viên ban chủ nhiệm',
        avatar: '/avatars/gen-6/nguyen-thi-nguyet-anh.png',
      },
      {
        id: '6-5',
        name: 'Tô Thị Hồng Anh',
        role: 'Thành viên ban chủ nhiệm',
        avatar: '/avatars/gen-6/to-thi-hong-anh.png',
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
