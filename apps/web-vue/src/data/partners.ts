import { Code, Cpu, Globe, Handshake, Layers, MessageSquare, Zap } from 'lucide-vue-next';
import type { Component } from 'vue';

export interface StrategicPartner {
  id: number;
  name: string;
  category: string;
  icon: Component;
}

export interface CommunityPartner {
  id: number;
  name: string;
  category: string;
  icon: Component;
}

export interface MediaPartner {
  id: number;
  name: string;
  icon: Component;
}

export const STRATEGIC_PARTNERS: StrategicPartner[] = [
  { id: 1, name: 'VNG Corporation', category: 'Technology', icon: Globe },
  { id: 2, name: 'FPT Software', category: 'Software', icon: Code },
  { id: 3, name: 'Google DSC', category: 'Community', icon: Cpu },
];

export const COMMUNITY_PARTNERS: CommunityPartner[] = [
  { id: 4, name: 'MindX', category: 'Education', icon: Layers },
  { id: 5, name: 'TopDev', category: 'Recruitment', icon: Zap },
  { id: 6, name: 'GDG Vietnam', category: 'Community', icon: Globe },
  { id: 7, name: 'UIT Student Union', category: 'University', icon: Handshake },
];

export const MEDIA_PARTNERS: MediaPartner[] = [
  { id: 8, name: 'YBOX', icon: MessageSquare },
  { id: 9, name: 'Advertising Club', icon: Zap },
  { id: 10, name: 'IT Blacklist', icon: Code },
  { id: 11, name: 'Designer Viet', icon: Layers },
];
