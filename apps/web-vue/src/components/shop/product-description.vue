<script setup lang="ts">
import { marked } from 'marked';
import { computed } from 'vue';

const props = defineProps<{ markdown: string }>();

// React version maps react-markdown component overrides to classes; Tailwind child
// selectors on the wrapper reproduce the same styles over marked's bare HTML.
const html = computed(() =>
  marked
    .parse(props.markdown ?? '', { async: false })
    .replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" '),
);
</script>

<template>
  <div
    v-if="markdown"
    class="[&_a]:text-wds-accent [&_a:hover]:text-wds-accent/80 [&_blockquote]:border-wds-accent/50 [&_li]:marker:text-wds-accent max-w-none [&_a]:underline [&_blockquote]:mb-4 [&_blockquote]:border-l-4 [&_blockquote]:bg-white/5 [&_blockquote]:pl-4 [&_blockquote]:text-white/70 [&_blockquote]:italic [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_code]:text-white/90 [&_em]:text-white/90 [&_em]:italic [&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:text-white [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_hr]:my-6 [&_hr]:border-white/10 [&_img]:mb-4 [&_img]:rounded-lg [&_ol]:mb-4 [&_ol]:ml-6 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:text-white/80 [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-white/80 [&_pre]:mb-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-white/5 [&_pre]:p-4 [&_pre]:text-sm [&_pre]:text-white/90 [&_strong]:font-semibold [&_strong]:text-white [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-white/10 [&_tbody]:border-white/10 [&_td]:border [&_td]:border-white/10 [&_td]:px-4 [&_td]:py-2 [&_td]:text-white/80 [&_th]:border [&_th]:border-white/10 [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-white [&_thead]:bg-white/5 [&_tr]:border-b [&_tr]:border-white/10 [&_ul]:mb-4 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:text-white/80"
    v-html="html"
  />
</template>
