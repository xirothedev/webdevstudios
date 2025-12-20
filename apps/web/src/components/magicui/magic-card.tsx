import { PropsWithChildren } from 'react';

type MagicCardProps = PropsWithChildren<{
  className?: string;
}>;

export function MagicCard({ className, children }: MagicCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-[1px] border-[#23252a] bg-gradient-to-b from-[#11131a] to-[#0b0c0f] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] ${className ?? ''}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(96,165,250,0.08),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(34,197,94,0.08),transparent_40%)]" />
      <div className="absolute inset-[1px] rounded-[15px] bg-gradient-to-b from-[#10121a] to-[#0c0d12]" />
      <div className="relative">{children}</div>
    </div>
  );
}
