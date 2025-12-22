'use client';

import {
  Building2,
  Clock,
  Facebook,
  Mail,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { motion } from 'motion/react';

interface ContactCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] },
};

function ContactCard({ icon, title, description, index }: ContactCardProps) {
  return (
    <motion.div
      className="group hover:border-wds-accent/30 hover:shadow-wds-accent/10 relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg"
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: '-50px' }}
      variants={cardVariants}
      transition={{ delay: index * 0.1 }}
    >
      {/* Hover effect background */}
      <div className="bg-wds-accent/5 absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

      <div className="relative z-10">
        <motion.div
          className="from-wds-accent/10 to-wds-accent/5 group-hover:from-wds-accent/20 group-hover:to-wds-accent/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br transition-all duration-300"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          {icon}
        </motion.div>
        <h3 className="group-hover:text-wds-accent mb-2 text-lg font-semibold text-black transition-colors">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
}

export function WDSContactGrid() {
  const contacts = [
    {
      icon: <Building2 className="text-wds-accent h-6 w-6" />,
      title: 'Văn phòng',
      description: 'B8.04, tòa B, Đại học Công nghệ Thông Tin, ĐHQG TP.HCM',
    },
    {
      icon: <Mail className="text-wds-accent h-6 w-6" />,
      title: 'Email',
      description: 'webdevstudios.org@gmail.com',
    },
    {
      icon: <Phone className="text-wds-accent h-6 w-6" />,
      title: 'Liên hệ công việc',
      description: 'Chủ nhiệm - Lâm Chí Dĩnh: 0794161275',
    },
    {
      icon: <Facebook className="text-wds-accent h-6 w-6" />,
      title: 'Facebook',
      description: 'Kết nối với chúng tôi thông qua Fanpage',
    },
    {
      icon: <MessageCircle className="text-wds-accent h-6 w-6" />,
      title: 'Messenger',
      description: 'Chat với chúng tôi để được giải đáp thắc mắc',
    },
    {
      icon: <Clock className="text-wds-accent h-6 w-6" />,
      title: 'Giờ mở cửa',
      description: '7h30 - 15h30',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-white to-gray-50 py-16 md:py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="bg-wds-secondary absolute top-0 left-1/4 h-64 w-64 rounded-full opacity-20 blur-[100px]"></div>
        <div className="bg-wds-accent/10 absolute right-1/4 bottom-0 h-48 w-48 rounded-full opacity-15 blur-[80px]"></div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-black sm:text-4xl md:text-5xl">
            Liên hệ với chúng tôi
          </h2>
          <div className="from-wds-accent to-wds-accent/50 mx-auto mt-4 h-1 w-20 bg-linear-to-r"></div>
          <p className="mx-auto mt-6 max-w-2xl text-base text-gray-600 sm:text-lg">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với
            chúng tôi qua các kênh sau:
          </p>
        </motion.div>

        {/* Contact cards grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact, index) => (
            <ContactCard key={index} {...contact} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
