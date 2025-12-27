import { type LucideIcon } from 'lucide-react';

interface AccountHeroProps {
  icon: LucideIcon;
  label: string;
  title: string;
  description: string;
}

export function AccountHero({
  icon: Icon,
  label,
  title,
  description,
}: AccountHeroProps) {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      {/* Background gradient */}
      <div className="via-wds-secondary/10 to-wds-secondary/20 absolute inset-0 bg-linear-to-b from-white" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
        {/* Section header */}
        <div className="mb-12 flex flex-col gap-4 text-center sm:mb-16 sm:gap-6">
          <div className="inline-flex items-center justify-center gap-2">
            <Icon className="text-wds-accent h-5 w-5" />
            <span className="text-wds-accent text-sm font-bold tracking-widest uppercase">
              {label}
            </span>
          </div>
          <h1 className="text-3xl leading-tight font-black text-balance text-black sm:text-4xl">
            {title}
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-pretty text-gray-600 sm:text-base">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
