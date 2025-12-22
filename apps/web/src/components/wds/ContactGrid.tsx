'use client';

import {
  Building2,
  Clock,
  Facebook,
  Mail,
  MessageCircle,
  Phone,
} from 'lucide-react';

interface ContactCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function ContactCard({ icon, title, description }: ContactCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-black">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

export function WDSContactGrid() {
  const contacts = [
    {
      icon: <Building2 className="h-6 w-6 text-gray-700" />,
      title: 'Văn phòng',
      description: 'B8.04, tòa B, Đại học Công nghệ Thông Tin, ĐHQG TP.HCM',
    },
    {
      icon: <Mail className="h-6 w-6 text-gray-700" />,
      title: 'Email',
      description: 'webdevstudios.org@gmail.com',
    },
    {
      icon: <Phone className="h-6 w-6 text-gray-700" />,
      title: 'Liên hệ công việc',
      description: 'Chủ nhiệm - Lâm Chí Dĩnh: 0794161275',
    },
    {
      icon: <Facebook className="h-6 w-6 text-gray-700" />,
      title: 'Facebook',
      description: 'Kết nối với chúng tôi thông qua Fanpage',
    },
    {
      icon: <MessageCircle className="h-6 w-6 text-gray-700" />,
      title: 'Messenger',
      description: 'Chat với chúng tôi để được giải đáp thắc mắc',
    },
    {
      icon: <Clock className="h-6 w-6 text-gray-700" />,
      title: 'Giờ mở cửa',
      description: '7h30 - 15h30',
    },
  ];

  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact, index) => (
            <ContactCard key={index} {...contact} />
          ))}
        </div>
      </div>
    </section>
  );
}
