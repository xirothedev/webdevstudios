<script setup lang="ts">
// Port of apps/web src/components/wds/ContactGrid.tsx — OnlineBeamBackground inner part.
import { ref } from 'vue';

import { AnimatedBeam } from '@/components/ui/animated-beam.vue';

const containerRef = ref<HTMLElement | null>(null);
const centerRef = ref<HTMLElement | null>(null);
const mailRef = ref<HTMLElement | null>(null);
const fbRef = ref<HTMLElement | null>(null);
const msgRef = ref<HTMLElement | null>(null);
const phoneRef = ref<HTMLElement | null>(null);
</script>

<template>
  <div class="pointer-events-none absolute inset-0">
    <div
      ref="containerRef"
      class="relative flex size-full items-center justify-center overflow-hidden bg-white/60"
    >
      <!-- Absolute positioning to keep arcs aligned like mock -->
      <div
        ref="mailRef"
        class="absolute top-[18%] left-[26%] z-10 flex size-12 items-center justify-center rounded-full border-2 border-white/60 bg-white/90 p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]"
      >
        <img src="/icons/gmail.webp" alt="Email" class="size-5" />
      </div>
      <div
        ref="fbRef"
        class="absolute top-[18%] right-[22%] z-10 flex size-12 items-center justify-center rounded-full border-2 border-white/60 bg-white/90 p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]"
      >
        <img src="/icons/facebook.webp" alt="Facebook" class="size-5" />
      </div>
      <div
        ref="phoneRef"
        class="absolute top-[72%] left-[24%] z-10 flex size-12 items-center justify-center rounded-full border-2 border-white/60 bg-white/90 p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]"
      >
        <img src="/icons/telephone.webp" alt="Phone" class="size-5" />
      </div>
      <div
        ref="msgRef"
        class="absolute top-[72%] right-[18%] z-10 flex size-12 items-center justify-center rounded-full border-2 border-white/60 bg-white/90 p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]"
      >
        <img src="/icons/messenger.webp" alt="Messenger" class="size-5" />
      </div>
      <div
        ref="centerRef"
        class="absolute top-[55%] left-[50%] z-10 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/60 bg-white/90 p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]"
      >
        <img src="/image/wds-logo.svg" alt="WebDev Studios" class="size-8" />
      </div>

      <AnimatedBeam
        :container-ref="containerRef"
        :from-ref="mailRef"
        :to-ref="centerRef"
        :curvature="-60"
        :end-y-offset="-10"
        gradient-start-color="#ff9f43"
        gradient-stop-color="#ff6f91"
      />
      <AnimatedBeam
        :container-ref="containerRef"
        :from-ref="fbRef"
        :to-ref="centerRef"
        :curvature="-55"
        :end-y-offset="-6"
        gradient-start-color="#3b82f6"
        gradient-stop-color="#a855f7"
      />
      <AnimatedBeam
        :container-ref="containerRef"
        :from-ref="phoneRef"
        :to-ref="centerRef"
        :curvature="-5"
        :start-y-offset="0"
        :end-y-offset="-2"
        gradient-start-color="#22c55e"
        gradient-stop-color="#14b8a6"
      />
      <AnimatedBeam
        :container-ref="containerRef"
        :from-ref="msgRef"
        :to-ref="centerRef"
        :curvature="30"
        :end-y-offset="6"
        gradient-start-color="#ec4899"
        gradient-stop-color="#a855f7"
      />
    </div>
  </div>
</template>
