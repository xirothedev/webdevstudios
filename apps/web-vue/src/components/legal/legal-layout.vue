<script setup lang="ts">
// Port of apps/web src/components/legal/LegalLayout.tsx.
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

type TocItem = { id: string; label: string };

const props = defineProps<{ title: string; toc: TocItem[] }>();

const activeId = ref<string | null>(props.toc[0]?.id ?? null);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (!props.toc.length) return;

  const headings = props.toc
    .map((item) => document.getElementById(item.id))
    .filter((el): el is HTMLElement => !!el);

  if (!headings.length) return;

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => (a.target as HTMLElement).offsetTop - (b.target as HTMLElement).offsetTop);

      if (visible[0]?.target) {
        activeId.value = visible[0].target.id;
      }
    },
    {
      root: null,
      rootMargin: '-40% 0px -50% 0px',
      threshold: 0.1,
    },
  );

  headings.forEach((heading) => observer?.observe(heading));
});

onBeforeUnmount(() => observer?.disconnect());

const handleClickToc = (id: string) => (event: MouseEvent) => {
  event.preventDefault();
  const el = document.getElementById(id);
  if (!el) return;

  const y = el.getBoundingClientRect().top + window.scrollY - 96;

  window.history.replaceState(null, '', `#${id}`);
  window.scrollTo({ top: y, behavior: 'smooth' });
};
</script>

<template>
  <section class="mx-auto flex max-w-5xl gap-10 px-4 sm:px-6 lg:px-8">
    <article class="min-w-0 flex-1">
      <header class="mb-8 flex items-start justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <p class="text-wds-accent/80 text-[11px] font-semibold tracking-[0.25em] uppercase">
            Chính sách &amp; pháp lý
          </p>
          <h1 class="text-wds-text mt-3 text-2xl font-semibold">{{ title }}</h1>
          <p class="mt-2 text-xs text-neutral-400">
            Vui lòng đọc kỹ các điều khoản sau trước khi tiếp tục sử dụng WDS Shop.
          </p>
        </div>

        <RouterLink
          to="/"
          class="text-wds-text hover:border-wds-accent/60 hover:bg-wds-accent/20 hover:text-wds-accent hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur transition sm:inline-flex"
        >
          <span class="mr-1.5 text-base leading-none">&larr;</span>
          <span>Quay lại trang chủ</span>
        </RouterLink>
      </header>

      <div class="legal-content space-y-5 text-sm leading-relaxed text-neutral-200">
        <slot />
      </div>
    </article>

    <aside class="hidden w-60 shrink-0 lg:block">
      <div
        class="sticky top-28 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-neutral-300 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur"
      >
        <p class="text-wds-accent mb-3 text-[11px] font-semibold tracking-[0.25em] uppercase">
          Mục lục
        </p>
        <nav class="space-y-1.5">
          <a
            v-for="item in toc"
            :key="item.id"
            :href="`#${item.id}`"
            :onClick="handleClickToc(item.id)"
            :aria-current="activeId === item.id ? 'true' : undefined"
            :class="`block rounded-md px-2 py-1.5 text-[13px] transition ${
              activeId === item.id
                ? 'bg-wds-accent/15 text-wds-text shadow-[0_0_0_1px_rgba(255,255,255,0.12)]'
                : 'hover:text-wds-text text-neutral-300 hover:bg-white/5'
            }`"
          >
            {{ item.label }}
          </a>
        </nav>
      </div>
    </aside>
  </section>
</template>

<style scoped>
/* Prose styling for the marked-rendered legal markdown (React version relied on
   mdx default element styles; Tailwind preflight resets them here). */
.legal-content :deep(h1) {
  margin-top: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
}
.legal-content :deep(h2) {
  margin-top: 1.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
}
.legal-content :deep(h3) {
  margin-top: 1rem;
  font-size: 1rem;
  font-weight: 600;
}
.legal-content :deep(ul) {
  list-style: disc;
  padding-left: 1.5rem;
}
.legal-content :deep(ol) {
  list-style: decimal;
  padding-left: 1.5rem;
}
.legal-content :deep(strong) {
  font-weight: 600;
  color: white;
}
.legal-content :deep(a) {
  color: var(--color-wds-accent, #f7931e);
  text-decoration: underline;
}
</style>
