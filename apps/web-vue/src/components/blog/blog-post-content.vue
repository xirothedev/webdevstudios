<script setup lang="ts">
import { marked } from 'marked';
import { computed } from 'vue';

// Mirror of apps/web BlogPostContentMDX. Admin-authored markdown, same trust level as the
// React app (sanitized-enough per spec #39). Shiki highlighting/typography plugin are
// React-side deps — basic scoped styles instead (no new deps allowed).
const props = defineProps<{ content: string }>();

const html = computed(() => (props.content ? marked.parse(props.content, { async: false }) : ''));
</script>

<template>
  <div
    v-if="html"
    class="blog-markdown text-wds-text/90 max-w-none text-base leading-relaxed"
    v-html="html"
  />
</template>

<style scoped>
/* ponytail: minimal prose replacement (typography plugin not installed); expand when design demands */
.blog-markdown :where(h1) {
  font-size: 2.25rem;
  font-weight: 700;
  margin: 1.5rem 0 1rem;
  color: var(--color-wds-text);
}
.blog-markdown :where(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 1.5rem 0 0.75rem;
  color: var(--color-wds-text);
}
.blog-markdown :where(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1.25rem 0 0.5rem;
  color: var(--color-wds-text);
}
.blog-markdown :where(p) {
  margin: 0.75rem 0;
}
.blog-markdown :where(ul, ol) {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
}
.blog-markdown :where(ul) {
  list-style: disc;
}
.blog-markdown :where(ol) {
  list-style: decimal;
}
.blog-markdown :where(li) {
  margin: 0.25rem 0;
}
.blog-markdown :where(a) {
  color: var(--color-wds-accent);
  text-decoration: underline;
}
.blog-markdown :where(blockquote) {
  border-left: 3px solid var(--color-wds-accent);
  padding-left: 1rem;
  margin: 1rem 0;
  opacity: 0.8;
}
.blog-markdown :where(code) {
  background: rgb(255 255 255 / 0.08);
  border-radius: 0.25rem;
  padding: 0.125rem 0.375rem;
  font-size: 0.875em;
}
.blog-markdown :where(pre) {
  background: rgb(255 255 255 / 0.05);
  border-radius: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
  margin: 1rem 0;
}
.blog-markdown :where(pre code) {
  background: transparent;
  padding: 0;
}
.blog-markdown :where(img) {
  border-radius: 0.5rem;
  margin: 1rem 0;
  max-width: 100%;
}
.blog-markdown :where(hr) {
  border-color: rgb(255 255 255 / 0.1);
  margin: 1.5rem 0;
}
.blog-markdown :where(table) {
  width: 100%;
  margin: 1rem 0;
  border-collapse: collapse;
}
.blog-markdown :where(th, td) {
  border: 1px solid rgb(255 255 255 / 0.15);
  padding: 0.5rem 0.75rem;
  text-align: left;
}
</style>
