'use client';

import { BriefcaseBusiness, Layers3, Timer, Users } from 'lucide-react';
import { motion } from 'motion/react';

import { NumberTicker } from '@/components/ui/number-ticker';

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export function WDSStatsSection() {
  return (
    <section className="bg-white py-20 sm:py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-80px' }}
          transition={{ staggerChildren: 0.1 }}
        >
          <motion.h2
            variants={fadeInUp}
            transition={{ duration: 0.6, ease: [0.34, 0.7, 0.25, 1] }}
            className="text-3xl font-bold tracking-tight text-black sm:text-4xl md:text-5xl"
          >
            Đôi điều về chúng tôi
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            transition={{
              duration: 0.6,
              delay: 0.05,
              ease: [0.34, 0.7, 0.25, 1],
            }}
            className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-gray-700 sm:text-lg"
          >
            Được thành lập năm 2018 với hơn 20 thành viên, WebDev Studios đã
            phát triển thành một trong những câu lạc bộ phát triển mạnh mẽ tại
            trường Đại học Công nghệ Thông tin – ĐHQG TP.HCM.
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-80px' }}
        >
          <StatItem
            icon={Layers3}
            label="Hơn 10 dự án lớn"
            value={10}
            suffix="+"
            delay={0.1}
          />
          <StatItem
            icon={Timer}
            label="Hơn 2 năm kinh nghiệm"
            value={2}
            suffix="+"
            delay={0.2}
          />
          <StatItem
            icon={Users}
            label="Hơn 45 thành viên"
            value={45}
            suffix="+"
            delay={0.3}
          />
          <StatItem
            icon={BriefcaseBusiness}
            label="4 vị trí để ứng tuyển"
            value={4}
            delay={0.4}
          />
        </motion.div>
      </div>
    </section>
  );
}

interface StatItemProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: number;
  suffix?: string;
  delay?: number;
}

function StatItem({
  icon: Icon,
  label,
  value,
  suffix,
  delay = 0,
}: StatItemProps) {
  return (
    <motion.div
      variants={fadeInUp}
      transition={{ duration: 0.6, delay, ease: [0.34, 0.7, 0.25, 1] }}
      className="flex flex-col items-center gap-4"
    >
      <div className="bg-wds-accent flex h-32 w-32 items-center justify-center rounded-full shadow-[0_18px_40px_rgba(0,0,0,0.08)] sm:h-36 sm:w-36">
        <div className="flex flex-col items-center justify-center gap-1">
          <Icon className="h-8 w-8 text-black" />
          <div className="flex items-baseline gap-1 text-3xl font-semibold text-black sm:text-4xl">
            <NumberTicker value={value} className="text-3xl sm:text-4xl" />
            {suffix ? <span>{suffix}</span> : null}
          </div>
        </div>
      </div>
      <p className="max-w-xs text-sm font-medium text-gray-800 sm:text-base">
        {label}
      </p>
    </motion.div>
  );
}
