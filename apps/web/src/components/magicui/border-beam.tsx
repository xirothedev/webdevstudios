type BorderBeamProps = {
  className?: string;
  duration?: number;
  colorFrom?: string;
  colorTo?: string;
};

export function BorderBeam({
  className,
  duration = 8,
  colorFrom = '#7c3aed',
  colorTo = '#06b6d4',
}: BorderBeamProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden rounded-2xl ${className ?? ''}`}
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-70 blur-[2px]"
        style={{
          background: `conic-gradient(from 0deg, ${colorFrom}, ${colorTo}, ${colorFrom})`,
          animation: `spin ${duration}s linear infinite`,
        }}
      />
      <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-b from-[#0f1116] to-[#0b0c0f]" />
    </div>
  );
}
