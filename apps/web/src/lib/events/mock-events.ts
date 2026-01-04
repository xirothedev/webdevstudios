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
  addDays,
  addHours,
  addMonths,
  addWeeks,
  subDays,
  subWeeks,
} from 'date-fns';

import { Event, EventType } from './types';

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

export const mockEvents: Event[] = [
  // Past events
  {
    id: '1',
    title: 'Cuộc họp Ban Chủ nhiệm tháng 1',
    description:
      'Cuộc họp định kỳ của Ban Chủ nhiệm để đánh giá hoạt động tháng vừa qua và lên kế hoạch cho tháng tới.',
    start: subWeeks(today, 4),
    end: addHours(subWeeks(today, 4), 2),
    location: 'Phòng họp A1.1',
    type: EventType.MEETING,
    organizer: 'Ban Chủ nhiệm',
    attendees: 15,
  },
  {
    id: '2',
    title: 'Workshop: Next.js 16 App Router',
    description:
      'Workshop giới thiệu về Next.js 16 với App Router, Server Components, và các tính năng mới nhất.',
    start: subWeeks(today, 3),
    end: addHours(subWeeks(today, 3), 3),
    location: 'Phòng lab CNTT',
    type: EventType.WORKSHOP,
    organizer: 'Anh Minh - Tech Lead',
    attendees: 45,
  },
  {
    id: '3',
    title: 'Khảo sát: Đánh giá hoạt động câu lạc bộ Q1',
    description:
      'Khảo sát để thu thập ý kiến của thành viên về các hoạt động trong quý 1, giúp cải thiện chất lượng hoạt động.',
    start: subWeeks(today, 2),
    end: addDays(subWeeks(today, 2), 7),
    type: EventType.SURVEY,
    organizer: 'Ban Chủ nhiệm',
    surveyLink: 'https://forms.gle/example1',
  },
  {
    id: '4',
    title: 'Cuộc thi Hackathon WebDev 2024',
    description:
      'Cuộc thi lập trình web dành cho thành viên câu lạc bộ. Thể lệ: làm việc nhóm, thời gian 48 giờ.',
    start: subWeeks(today, 1),
    end: addDays(subWeeks(today, 1), 2),
    location: 'Phòng lab CNTT',
    type: EventType.COMPETITION,
    organizer: 'Ban Tổ chức',
    attendees: 60,
  },
  {
    id: '5',
    title: 'Teambuilding: Game night',
    description:
      'Buổi tối chơi game cùng nhau để gắn kết thành viên. Các trò chơi: Among Us, Codenames, Pictionary.',
    start: subDays(today, 5),
    end: addHours(subDays(today, 5), 4),
    location: 'Phòng sinh hoạt chung',
    type: EventType.SOCIAL,
    organizer: 'Ban Sự kiện',
    attendees: 30,
  },

  // Current/Upcoming events
  {
    id: '6',
    title: 'Khảo sát: Nhu cầu học tập của thành viên',
    description:
      'Khảo sát để nắm bắt nhu cầu học tập và phát triển kỹ năng của thành viên, từ đó xây dựng chương trình đào tạo phù hợp.',
    start: subDays(today, 2),
    end: addDays(today, 5),
    type: EventType.SURVEY,
    organizer: 'Ban Đào tạo',
    surveyLink: 'https://forms.gle/example2',
  },
  {
    id: '7',
    title: 'Workshop: TypeScript Advanced Patterns',
    description:
      'Workshop nâng cao về TypeScript: Generics, Utility Types, Conditional Types, và các pattern thực tế trong dự án.',
    start: addDays(today, 2),
    end: addHours(addDays(today, 2), 3),
    location: 'Phòng lab CNTT',
    type: EventType.WORKSHOP,
    organizer: 'Anh Hùng - Senior Developer',
    attendees: 0,
  },
  {
    id: '8',
    title: 'Cuộc họp Ban Chủ nhiệm tháng hiện tại',
    description:
      'Cuộc họp định kỳ để đánh giá tiến độ các dự án và hoạt động đang diễn ra.',
    start: addDays(today, 3),
    end: addHours(addDays(today, 3), 2),
    location: 'Phòng họp A1.1',
    type: EventType.MEETING,
    organizer: 'Ban Chủ nhiệm',
    attendees: 0,
  },
  {
    id: '9',
    title: 'Workshop: React Server Components',
    description:
      'Tìm hiểu về React Server Components, cách sử dụng trong Next.js, và best practices.',
    start: addDays(today, 5),
    end: addHours(addDays(today, 5), 2.5),
    location: 'Phòng lab CNTT',
    type: EventType.WORKSHOP,
    organizer: 'Anh Đức - Full-stack Developer',
    attendees: 0,
  },
  {
    id: '10',
    title: 'Khảo sát: Đánh giá Workshop vừa qua',
    description:
      'Khảo sát nhanh để thu thập feedback về workshop TypeScript Advanced Patterns, giúp cải thiện chất lượng các workshop tiếp theo.',
    start: addDays(today, 4),
    end: addDays(today, 7),
    type: EventType.SURVEY,
    organizer: 'Ban Đào tạo',
    surveyLink: 'https://forms.gle/example3',
  },
  {
    id: '11',
    title: 'Social: Coffee & Code',
    description:
      'Buổi gặp mặt không chính thức, cùng nhau uống cà phê và chia sẻ về các dự án đang làm, học hỏi lẫn nhau.',
    start: addDays(today, 6),
    end: addHours(addDays(today, 6), 2),
    location: 'Café gần trường',
    type: EventType.SOCIAL,
    organizer: 'Thành viên tự tổ chức',
    attendees: 0,
  },
  {
    id: '12',
    title: 'Workshop: Database Design & Optimization',
    description:
      'Workshop về thiết kế database, indexing, query optimization, và best practices với PostgreSQL.',
    start: addDays(today, 8),
    end: addHours(addDays(today, 8), 3),
    location: 'Phòng lab CNTT',
    type: EventType.WORKSHOP,
    organizer: 'Anh Tuấn - Backend Lead',
    attendees: 0,
  },
  {
    id: '13',
    title: 'Khảo sát: Lựa chọn chủ đề workshop tiếp theo',
    description:
      'Khảo sát để thành viên vote cho chủ đề workshop mà họ muốn học trong tháng tới.',
    start: addDays(today, 10),
    end: addDays(today, 14),
    type: EventType.SURVEY,
    organizer: 'Ban Đào tạo',
    surveyLink: 'https://forms.gle/example4',
  },
  {
    id: '14',
    title: 'Cuộc thi: Code Review Challenge',
    description:
      'Cuộc thi review code, tìm bug, và đề xuất cải thiện. Thời gian: 2 giờ. Giải thưởng hấp dẫn.',
    start: addDays(today, 12),
    end: addHours(addDays(today, 12), 2),
    location: 'Phòng lab CNTT',
    type: EventType.COMPETITION,
    organizer: 'Ban Tổ chức',
    attendees: 0,
  },
  {
    id: '15',
    title: 'Cuộc họp Ban Chủ nhiệm tháng tới',
    description: 'Cuộc họp định kỳ để lên kế hoạch cho tháng tiếp theo.',
    start: addWeeks(today, 4),
    end: addHours(addWeeks(today, 4), 2),
    location: 'Phòng họp A1.1',
    type: EventType.MEETING,
    organizer: 'Ban Chủ nhiệm',
    attendees: 0,
  },
  {
    id: '16',
    title: 'Workshop: Testing với Jest & React Testing Library',
    description:
      'Workshop về testing trong React: Unit tests, Integration tests, và E2E testing.',
    start: addWeeks(today, 5),
    end: addHours(addWeeks(today, 5), 3),
    location: 'Phòng lab CNTT',
    type: EventType.WORKSHOP,
    organizer: 'Anh Linh - QA Lead',
    attendees: 0,
  },
  {
    id: '17',
    title: 'Social: Movie Night - Tech Documentaries',
    description:
      'Cùng nhau xem các bộ phim tài liệu về công nghệ và lập trình, sau đó thảo luận.',
    start: addWeeks(today, 6),
    end: addHours(addWeeks(today, 6), 3),
    location: 'Phòng sinh hoạt chung',
    type: EventType.SOCIAL,
    organizer: 'Ban Sự kiện',
    attendees: 0,
  },
  {
    id: '18',
    title: 'Khảo sát: Đánh giá hoạt động câu lạc bộ Q2',
    description:
      'Khảo sát tổng kết quý 2, thu thập ý kiến để cải thiện hoạt động trong quý 3.',
    start: addMonths(today, 2),
    end: addDays(addMonths(today, 2), 7),
    type: EventType.SURVEY,
    organizer: 'Ban Chủ nhiệm',
    surveyLink: 'https://forms.gle/example5',
  },
  {
    id: '19',
    title: 'Workshop: DevOps với Docker & CI/CD',
    description:
      'Workshop về DevOps: Containerization với Docker, CI/CD pipelines, và deployment strategies.',
    start: addWeeks(today, 7),
    end: addHours(addWeeks(today, 7), 4),
    location: 'Phòng lab CNTT',
    type: EventType.WORKSHOP,
    organizer: 'Anh Nam - DevOps Engineer',
    attendees: 0,
  },
  {
    id: '20',
    title: 'Cuộc thi: WebDev Hackathon 2024 - Final Round',
    description:
      'Vòng chung kết cuộc thi Hackathon WebDev 2024. Top 10 đội sẽ trình bày dự án trước ban giám khảo.',
    start: addWeeks(today, 8),
    end: addDays(addWeeks(today, 8), 1),
    location: 'Hội trường lớn',
    type: EventType.COMPETITION,
    organizer: 'Ban Tổ chức',
    attendees: 0,
  },
];
