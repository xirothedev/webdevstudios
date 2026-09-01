<script setup lang="ts">
// Port of apps/web src/app/generation/page.tsx — ExpandableGenerationSection (mobile).
import { ChevronDown, ChevronUp, Crown, Users } from 'lucide-vue-next';
import { ref } from 'vue';

import GenerationMemberAvatar from '@/components/generation/generation-member-avatar.vue';
import type { Generation } from '@/data/generations';

defineProps<{ generation: Generation }>();

const isExpanded = ref(true);
</script>

<template>
  <section class="relative">
    <!-- Generation Header - Always Visible -->
    <button
      @click="isExpanded = !isExpanded"
      class="from-wds-accent via-wds-accent/90 to-wds-accent/70 shadow-wds-accent/30 hover:shadow-wds-accent/40 relative w-full overflow-hidden rounded-2xl bg-linear-to-r p-4 text-black shadow-lg transition-all duration-300 active:scale-[0.99] sm:p-6"
    >
      <!-- Animated background particles -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-0 left-1/4 h-20 w-20 animate-pulse rounded-full bg-white/20" />
        <div
          class="absolute right-1/4 bottom-0 h-16 w-16 animate-pulse rounded-full bg-white/10 delay-300"
        />
      </div>

      <div
        class="relative z-10 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-6"
      >
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-black/20 sm:h-12 sm:w-12"
          >
            <Crown class="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div class="text-left">
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-black sm:text-xl">Generation {{ generation.gen }}</h2>
              <span
                class="hidden rounded-full bg-black/20 px-3 py-1 text-xs font-bold uppercase sm:inline-block"
              >
                {{ generation.period }}
              </span>
            </div>
            <p class="mt-1 text-xs font-semibold opacity-80 sm:hidden">{{ generation.period }}</p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 text-sm font-medium">
            <Users class="h-4 w-4" />
            <span>{{ generation.members.length }}</span>
          </div>
          <ChevronUp v-if="isExpanded" class="h-5 w-5 transition-transform duration-300" />
          <ChevronDown v-else class="h-5 w-5 transition-transform duration-300" />
        </div>
      </div>
    </button>

    <!-- Expandable Content -->
    <div
      :class="`mt-4 grid grid-cols-1 gap-3 overflow-hidden transition-all duration-500 ease-out sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 ${
        isExpanded ? 'max-h-[8000px] opacity-100' : 'max-h-0 opacity-0'
      }`"
    >
      <!-- Leaders first - highlight with larger cards -->
      <article
        v-for="member in generation.members.filter((m) => m.isLeader)"
        :key="member.id"
        class="group hover:border-wds-accent/60 hover:shadow-wds-accent/20 relative flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 sm:p-6"
      >
        <!-- Shimmer effect on hover -->
        <div
          class="via-wds-accent/10 absolute inset-0 rounded-2xl bg-linear-to-r from-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />

        <GenerationMemberAvatar
          :avatar="member.avatar"
          :name="member.name"
          :is-leader="member.isLeader"
          size="small"
          variant="mobile"
        />

        <div class="relative z-10 flex flex-col items-center gap-1 text-center">
          <h3
            class="group-hover:text-wds-accent text-sm leading-snug font-bold text-black transition-colors sm:text-base"
          >
            {{ member.name }}
          </h3>
          <p
            class="text-wds-accent line-clamp-2 text-[10px] font-bold tracking-wider uppercase sm:text-xs"
          >
            {{ member.role }}
          </p>
        </div>
      </article>

      <!-- Other members -->
      <article
        v-for="member in generation.members.filter((m) => !m.isLeader)"
        :key="member.id"
        class="group hover:border-wds-accent/60 hover:shadow-wds-accent/20 relative flex flex-col items-center gap-2 rounded-xl border border-gray-200/50 bg-white/80 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white sm:gap-3 sm:p-4"
      >
        <GenerationMemberAvatar
          :avatar="member.avatar"
          :name="member.name"
          :is-leader="member.isLeader"
          size="small"
          variant="mobile"
        />

        <div class="flex flex-col items-center gap-0.5 text-center sm:gap-1">
          <h3
            class="group-hover:text-wds-accent text-xs leading-snug font-semibold text-black transition-colors sm:text-sm"
          >
            {{ member.name }}
          </h3>
          <p
            class="line-clamp-2 text-[9px] font-medium tracking-wide text-gray-500 uppercase sm:text-[10px]"
          >
            {{ member.role }}
          </p>
        </div>
      </article>
    </div>
  </section>
</template>
