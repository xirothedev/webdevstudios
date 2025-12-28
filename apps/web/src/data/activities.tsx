import { Code, Users, Zap } from 'lucide-react';
import type { ReactNode } from 'react';

export interface Category {
  id: string;
  label: string;
  icon?: ReactNode;
}

export interface Activity {
  id: number;
  title: string;
  category: 'academic' | 'community' | 'event';
  date: string;
  location: string;
  image: string;
  description: string;
  attendees: number;
}

export const CATEGORIES: Category[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'academic', label: 'Học thuật', icon: <Code size={16} /> },
  { id: 'community', label: 'Cộng đồng', icon: <Users size={16} /> },
  {
    id: 'event',
    label: 'Sự kiện & Teambuilding',
    icon: <Zap size={16} />,
  },
];

export const ACTIVITIES: Activity[] = [
  {
    id: 1,
    title: 'WDS Hackathon 2024: AI Integration',
    category: 'academic',
    date: '15/08/2024',
    location: 'Sảnh C, UIT',
    image:
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop',
    description:
      'Cuộc thi lập trình 24h với chủ đề tích hợp AI vào ứng dụng web, thu hút hơn 20 đội thi tham gia.',
    attendees: 120,
  },
  {
    id: 2,
    title: 'Workshop: UI/UX for Developers',
    category: 'academic',
    date: '20/07/2024',
    location: 'Online (Google Meet)',
    image:
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop',
    description:
      'Chia sẻ kiến thức về tư duy thiết kế dành cho lập trình viên, diễn giả từ VNG.',
    attendees: 250,
  },
  {
    id: 3,
    title: 'WDS Summer Retreat 2024',
    category: 'event',
    date: '10/06/2024',
    location: 'Vũng Tàu',
    image:
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800&auto=format&fit=crop',
    description:
      'Chuyến đi gắn kết thành viên sau một năm hoạt động năng nổ. Team building bãi biển cực cháy.',
    attendees: 50,
  },
  {
    id: 4,
    title: 'Charity Code: Web cho Mái ấm',
    category: 'community',
    date: '05/05/2024',
    location: 'Mái ấm Tre Xanh',
    image:
      'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop',
    description:
      'Dự án tình nguyện xây dựng website giới thiệu và quyên góp cho mái ấm tình thương.',
    attendees: 30,
  },
  {
    id: 5,
    title: 'TechTalk: Next.js 14 Revolution',
    category: 'academic',
    date: '12/03/2024',
    location: 'Hội trường E',
    image:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop',
    description:
      'Cập nhật những tính năng mới nhất của Next.js 14 và Server Actions.',
    attendees: 150,
  },
  {
    id: 6,
    title: 'Coffee & Code: Open Talk',
    category: 'event',
    date: '14/02/2024',
    location: 'Highlands Coffee',
    image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop',
    description:
      'Buổi gặp mặt thân mật, chia sẻ chuyện nghề, chuyện đời của các cựu thành viên.',
    attendees: 40,
  },
];
