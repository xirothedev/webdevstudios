'use client';

import { Clock, Compass, Mountain, Settings, Telescope } from 'lucide-react';

interface AboutSectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function AboutSection({ icon, title, description }: AboutSectionProps) {
  return (
    <div className="flex gap-6">
      <div className="shrink-0">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
          {icon}
        </div>
      </div>
      <div className="flex-1">
        <h3 className="mb-3 text-2xl font-bold text-black">{title}</h3>
        <p className="leading-relaxed text-gray-700">{description}</p>
      </div>
    </div>
  );
}

export function WDSAboutSections() {
  const sections = [
    {
      icon: <Clock className="text-wds-accent h-8 w-8" />,
      title: 'Tiểu sử',
      description:
        'Được thành lập vào ngày 06/11/2018 với hơn 20 thành viên. Sau vài năm phát triển cùng với các thế hệ thành viên, câu lạc bộ học thuật WebDev Studios đã trở thành một trong những câu lạc bộ phát triển nhất của trường Đại học Công nghệ Thông tin – ĐHQG TP.HCM',
    },
    {
      icon: <Compass className="text-wds-accent h-8 w-8" />,
      title: 'Định hướng',
      description:
        'Chúng tôi hướng tới sẽ trở thành một trong những câu lạc bộ học thuật về Lập trình Web hàng đầu trong giới sinh viên khu vực miền Nam nói riêng và cả nước nói chung...',
    },
    {
      icon: <Mountain className="text-wds-accent h-8 w-8" />,
      title: 'Tầm nhìn',
      description:
        'Chúng tôi mong muốn chạm tới những đỉnh cao của tri thức, giúp sinh viên học hỏi được nhiều kiến thức không chỉ trong Lập trình mà còn về các kiến thức khác như Mỹ Thuật, Quản lý, Lãnh đạo, giao tiếp,....',
    },
    {
      icon: <Telescope className="text-wds-accent h-8 w-8" />,
      title: 'Sứ mệnh',
      description:
        'Sứ mệnh của chúng tôi là cùng các thành viên đồng hành trên con đường tri thức để khám phá bản thân, khám phá những vùng đất kiến thức mới lạ.',
    },
    {
      icon: <Settings className="text-wds-accent h-8 w-8" />,
      title: 'Phạm vi hoạt động',
      description:
        'Hiện tại chúng tôi chủ yếu hoạt động tại trường Đại học Công nghệ Thông tin, và mở rộng các hoạt động trong phạm vi ĐHQG TP.HCM. Trong tương lai chúng tôi muốn mở rộng hơn nữa phạm vi hoạt động của mình ra các trường Đại học trong TP.HCM, và hướng tới phạm vi cả nước.',
    },
  ];

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {sections.map((section, index) => (
            <AboutSection key={index} {...section} />
          ))}
        </div>
      </div>
    </section>
  );
}
