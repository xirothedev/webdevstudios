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

'use client';

import Image from 'next/image';
import { useRef } from 'react';

import { AnimatedBeam } from '@/components/ui/animated-beam';

function Circle({
  className,
  children,
  style,
  ref,
}: {
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={ref}
      style={style}
      className={`z-10 flex size-12 items-center justify-center rounded-full border-2 border-white/60 bg-white/90 p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] ${className ?? ''}`}
    >
      {children}
    </div>
  );
}
Circle.displayName = 'Circle';

export default function OnlineBeamBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const mailRef = useRef<HTMLDivElement>(null);
  const fbRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);

  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        ref={containerRef}
        className="relative flex size-full items-center justify-center overflow-hidden bg-white/60"
      >
        {/* Absolute positioning to keep arcs aligned like mock */}
        <Circle ref={mailRef} style={{ position: 'absolute', top: '18%', left: '26%' }}>
          <Image src="/icons/gmail.webp" alt="Email" width={20} height={20} />
        </Circle>
        <Circle ref={fbRef} style={{ position: 'absolute', top: '18%', right: '22%' }}>
          <Image src="/icons/facebook.webp" alt="Facebook" width={20} height={20} />
        </Circle>
        <Circle ref={phoneRef} style={{ position: 'absolute', top: '72%', left: '24%' }}>
          <Image src="/icons/telephone.webp" alt="Phone" width={20} height={20} />
        </Circle>
        <Circle ref={msgRef} style={{ position: 'absolute', top: '72%', right: '18%' }}>
          <Image src="/icons/messenger.webp" alt="Messenger" width={20} height={20} />
        </Circle>
        <Circle
          ref={centerRef}
          className="size-16 border-2"
          style={{
            position: 'absolute',
            top: '55%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Image
            src="/image/wds-logo.svg"
            alt="WebDev Studios"
            width={32}
            height={32}
            className="size-8"
          />
        </Circle>

        <AnimatedBeam
          containerRef={containerRef}
          fromRef={mailRef}
          toRef={centerRef}
          curvature={-60}
          endYOffset={-10}
          gradientStartColor="#ff9f43"
          gradientStopColor="#ff6f91"
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={fbRef}
          toRef={centerRef}
          curvature={-55}
          endYOffset={-6}
          gradientStartColor="#3b82f6"
          gradientStopColor="#a855f7"
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={phoneRef}
          toRef={centerRef}
          curvature={-5}
          startYOffset={0}
          endYOffset={-2}
          gradientStartColor="#22c55e"
          gradientStopColor="#14b8a6"
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={msgRef}
          toRef={centerRef}
          curvature={30}
          endYOffset={6}
          gradientStartColor="#ec4899"
          gradientStopColor="#a855f7"
        />
      </div>
    </div>
  );
}
