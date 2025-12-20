type RetroGridProps = {
  className?: string;
};

export function RetroGrid({ className }: RetroGridProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 [mask-image:radial-gradient(circle_at_center,transparent_5%,black_65%)] ${className ?? ''}`}
      aria-hidden
      style={{
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
        backgroundPosition: 'center',
      }}
    />
  );
}
