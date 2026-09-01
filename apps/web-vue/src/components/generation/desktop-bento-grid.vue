<script setup lang="ts">
// Port of apps/web src/app/generation/page.tsx — DesktopBentoGrid.
import { Award, Calendar, Crown, Sparkles, Users } from 'lucide-vue-next';
import { computed } from 'vue';

import GenerationMemberAvatar from '@/components/generation/generation-member-avatar.vue';
import type { Generation } from '@/data/generations';

const props = defineProps<{ generation: Generation }>();

// leader1/leader2/leader3 destructure in the React original
const leaders = computed(() => props.generation.members.slice(0, 3));
const members = computed(() => props.generation.members.slice(3));
</script>

<template>
  <section class="hidden lg:block">
    <!-- Bento Grid -->
    <div class="grid auto-rows-[200px] grid-cols-4 gap-4">
      <!-- Generation Info Card - spans 1 column, 2 rows -->
      <div class="row-span-2">
        <div
          class="from-wds-accent to-wds-accent/90 shadow-wds-accent/30 group hover:shadow-wds-accent/50 relative flex h-full flex-col justify-between overflow-hidden rounded-3xl bg-linear-to-br p-6 text-black shadow-lg transition-all duration-300"
        >
          <!-- Decorative background elements -->
          <div
            class="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-150"
          />
          <div
            class="absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-white/10 transition-transform delay-100 duration-500 group-hover:scale-125"
          />
          <div class="absolute top-1/2 right-8 -translate-y-1/2">
            <Sparkles
              class="h-24 w-24 text-white/20 transition-transform duration-500 group-hover:rotate-12"
            />
          </div>

          <!-- Content -->
          <div class="relative z-10 flex flex-col gap-6">
            <div class="flex items-center gap-3">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-black/20">
                <Crown class="h-6 w-6" />
              </div>
              <span class="text-sm font-bold tracking-widest text-black/80 uppercase">
                Generation {{ generation.gen }}
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-4 text-sm font-medium text-black/80">
              <div class="flex items-center gap-2">
                <Calendar class="h-4 w-4" />
                <span>{{ generation.period }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Users class="h-4 w-4" />
                <span>{{ generation.members.length }} thành viên</span>
              </div>
            </div>
          </div>

          <!-- Bottom decoration -->
          <div class="relative z-10 flex items-center gap-2 text-black/70">
            <Award class="h-5 w-5" />
            <span class="text-xs font-semibold tracking-wide uppercase">Leader team</span>
          </div>
        </div>
      </div>

      <!-- 3 Leader Cards - each spans 1 column, 2 rows -->
      <div v-for="leader in leaders" :key="leader.id" class="row-span-2">
        <article
          class="hover:border-wds-accent/60 hover:shadow-wds-accent/20 group relative flex h-full flex-col items-center justify-center gap-4 rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1"
        >
          <!-- Hover gradient overlay -->
          <div
            class="from-wds-accent/0 to-wds-accent/5 absolute inset-0 rounded-2xl bg-linear-to-b opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />

          <GenerationMemberAvatar
            :avatar="leader.avatar"
            :name="leader.name"
            :is-leader="leader.isLeader"
            size="small"
            variant="desktop"
          />

          <div class="relative z-10 flex flex-col items-center gap-2 text-center">
            <h3
              class="group-hover:text-wds-accent text-lg leading-tight font-bold text-black transition-colors"
            >
              {{ leader.name }}
            </h3>
            <p class="text-wds-accent text-xs font-bold tracking-wider uppercase">
              {{ leader.role }}
            </p>
          </div>
        </article>
      </div>

      <!-- Other Members - 1x1 cards -->
      <div v-for="member in members" :key="member.id" class="row-span-1">
        <article
          class="hover:border-wds-accent/60 hover:shadow-wds-accent/20 group relative flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5"
        >
          <GenerationMemberAvatar
            :avatar="member.avatar"
            :name="member.name"
            :is-leader="member.isLeader"
            size="small"
            variant="desktop"
          />
          <div class="flex flex-col items-center gap-1 text-center">
            <h3
              class="group-hover:text-wds-accent text-sm leading-snug font-semibold text-black transition-colors"
            >
              {{ member.name }}
            </h3>
            <p class="text-[10px] font-medium tracking-wide text-gray-500 uppercase">
              {{ member.role }}
            </p>
          </div>
        </article>
      </div>
    </div>

    <!-- Generation divider -->
    <div class="mt-6 flex items-center gap-4">
      <div class="h-px flex-1 bg-linear-to-r from-transparent via-gray-300 to-transparent" />
      <span class="text-xs font-semibold tracking-widest text-gray-400 uppercase">
        Gen {{ generation.gen }}
      </span>
      <div class="h-px flex-1 bg-linear-to-r from-transparent via-gray-300 to-transparent" />
    </div>
  </section>
</template>
