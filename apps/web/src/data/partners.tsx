import {
  Code,
  Cpu,
  Globe,
  Handshake,
  Layers,
  MessageSquare,
  Zap,
} from 'lucide-react';
import type { ReactNode } from 'react';

export interface StrategicPartner {
  id: number;
  name: string;
  category: string;
  icon: ReactNode;
}

export interface CommunityPartner {
  id: number;
  name: string;
  category: string;
  icon: ReactNode;
}

export interface MediaPartner {
  id: number;
  name: string;
  icon: ReactNode;
}

export const STRATEGIC_PARTNERS: StrategicPartner[] = [
  {
    id: 1,
    name: 'VNG Corporation',
    category: 'Technology',
    icon: <Globe size={40} />,
  },
  {
    id: 2,
    name: 'FPT Software',
    category: 'Software',
    icon: <Code size={40} />,
  },
  {
    id: 3,
    name: 'Google DSC',
    category: 'Community',
    icon: <Cpu size={40} />,
  },
];

export const COMMUNITY_PARTNERS: CommunityPartner[] = [
  {
    id: 4,
    name: 'MindX',
    category: 'Education',
    icon: <Layers size={32} />,
  },
  {
    id: 5,
    name: 'TopDev',
    category: 'Recruitment',
    icon: <Zap size={32} />,
  },
  {
    id: 6,
    name: 'GDG Vietnam',
    category: 'Community',
    icon: <Globe size={32} />,
  },
  {
    id: 7,
    name: 'UIT Student Union',
    category: 'University',
    icon: <Handshake size={32} />,
  },
];

export const MEDIA_PARTNERS: MediaPartner[] = [
  {
    id: 8,
    name: 'YBOX',
    icon: <MessageSquare size={24} />,
  },
  {
    id: 9,
    name: 'Advertising Club',
    icon: <Zap size={24} />,
  },
  {
    id: 10,
    name: 'IT Blacklist',
    icon: <Code size={24} />,
  },
  {
    id: 11,
    name: 'Designer Viet',
    icon: <Layers size={24} />,
  },
];
