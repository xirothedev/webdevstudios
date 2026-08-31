<script lang="ts">
export type MarkdownEditorTheme = 'light' | 'dark';
</script>

<script setup lang="ts">
import CodeBlock from '@tiptap/extension-code-block';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from '@tiptap/markdown';
import { EditorContent, useEditor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui';
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Redo,
  Undo,
  X,
} from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';

import { Button } from '@/components/ui/button.vue';
import { Input } from '@/components/ui/input.vue';
import { cn } from '@/lib/cn';

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    placeholder?: string;
    theme?: MarkdownEditorTheme;
    minHeight?: string;
    class?: string;
  }>(),
  {
    disabled: false,
    placeholder: 'Enter content (supports markdown)...',
    theme: 'dark',
    minHeight: '300px',
  },
);

const emit = defineEmits<{ change: [value: string] }>();
const model = defineModel<string>({ default: '' });

interface ToolbarButtonTheme {
  base: string;
  active: string;
  inactive: string;
}
interface MarkdownEditorThemeConfig {
  container: string;
  toolbar: string;
  toolbarDivider: string;
  toolbarButton: ToolbarButtonTheme;
  editor: { container: string; content: string };
  placeholder: string;
}

const themeConfigs: Record<MarkdownEditorTheme, MarkdownEditorThemeConfig> = {
  dark: {
    container: 'border-wds-accent/30 bg-wds-background rounded-lg border',
    toolbar: 'border-wds-accent/30 flex flex-wrap items-center gap-1 border-b p-2',
    toolbarDivider: 'mx-1 h-6 w-px bg-wds-accent/30',
    toolbarButton: {
      base: 'h-8 w-8 p-0',
      active: 'bg-wds-accent/20 text-wds-accent',
      inactive: 'text-wds-text/70 hover:bg-wds-accent/10 hover:text-wds-text',
    },
    editor: {
      container:
        'focus-within:ring-wds-accent/20 focus-within:border-wds-accent rounded-b-lg focus-within:ring-2',
      content:
        'text-wds-text [&_.ProseMirror]:outline-none [&_.ProseMirror]:px-4 [&_.ProseMirror]:py-2 [&_.ProseMirror]:text-sm [&_.ProseMirror]:leading-relaxed [&_.ProseMirror]:text-white/80 [&_.ProseMirror_.is-empty::before]:text-wds-text/50 [&_.ProseMirror_.is-empty::before]:content-[attr(data-placeholder)] [&_.ProseMirror_.is-empty::before]:float-left [&_.ProseMirror_.is-empty::before]:pointer-events-none [&_.ProseMirror_.is-empty::before]:h-0 [&_.ProseMirror_h1]:text-xl [&_.ProseMirror_h1]:font-semibold [&_.ProseMirror_h1]:text-white [&_.ProseMirror_h1]:mb-2 [&_.ProseMirror_h2]:text-lg [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:text-white [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h3]:text-base [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:text-white [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:ml-4 [&_.ProseMirror_ul]:space-y-1 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:ml-4 [&_.ProseMirror_ol]:space-y-1 [&_.ProseMirror_a]:text-wds-accent [&_.ProseMirror_a]:underline [&_.ProseMirror_a:hover]:text-wds-accent/80 [&_.ProseMirror_strong]:font-semibold [&_.ProseMirror_strong]:text-white [&_.ProseMirror_em]:italic [&_.ProseMirror_em]:text-white/90 [&_.ProseMirror_pre]:bg-[#1e293b] [&_.ProseMirror_pre]:border [&_.ProseMirror_pre]:border-white/10 [&_.ProseMirror_pre]:rounded-lg [&_.ProseMirror_pre]:p-4 [&_.ProseMirror_pre]:my-4 [&_.ProseMirror_pre]:overflow-x-auto [&_.ProseMirror_pre]:text-sm [&_.ProseMirror_pre]:relative [&_.ProseMirror_code]:bg-gray-900 [&_.ProseMirror_code]:text-wds-accent [&_.ProseMirror_code]:px-1.5 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:text-sm [&_.ProseMirror_code]:font-mono [&_.ProseMirror_pre_code]:bg-transparent [&_.ProseMirror_pre_code]:text-white/90 [&_.ProseMirror_pre_code]:p-0 [&_.ProseMirror_pre_code]:font-mono [&_.ProseMirror_pre[data-language]::before]:content-[attr(data-language)] [&_.ProseMirror_pre[data-language]::before]:absolute [&_.ProseMirror_pre[data-language]::before]:top-3 [&_.ProseMirror_pre[data-language]::before]:right-3 [&_.ProseMirror_pre[data-language]::before]:text-xs [&_.ProseMirror_pre[data-language]::before]:text-gray-400 [&_.ProseMirror_pre[data-language]::before]:uppercase [&_.ProseMirror_pre[data-language]::before]:font-mono [&_.ProseMirror_pre[data-language]::before]:px-2.5 [&_.ProseMirror_pre[data-language]::before]:py-1 [&_.ProseMirror_pre[data-language]::before]:bg-white/10 [&_.ProseMirror_pre[data-language]::before]:rounded-md [&_.ProseMirror_pre[data-language]::before]:backdrop-blur-sm [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-wds-accent/50 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-white/70 [&_.ProseMirror_blockquote]:my-4',
    },
    placeholder: 'text-wds-text/50',
  },
  light: {
    container: 'border-gray-300 bg-white rounded-lg border',
    toolbar: 'border-gray-300 flex flex-wrap items-center gap-1 border-b p-2 bg-gray-50',
    toolbarDivider: 'mx-1 h-6 w-px bg-gray-300',
    toolbarButton: {
      base: 'h-8 w-8 p-0',
      active: 'bg-blue-100 text-blue-600',
      inactive: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    },
    editor: {
      container:
        'focus-within:ring-blue-500/20 focus-within:border-blue-500 rounded-b-lg focus-within:ring-2',
      content:
        'text-gray-900 [&_.ProseMirror]:outline-none [&_.ProseMirror]:px-4 [&_.ProseMirror]:py-2 [&_.ProseMirror]:text-sm [&_.ProseMirror]:leading-relaxed [&_.ProseMirror]:text-gray-800 [&_.ProseMirror_.is-empty::before]:text-gray-400 [&_.ProseMirror_.is-empty::before]:content-[attr(data-placeholder)] [&_.ProseMirror_.is-empty::before]:float-left [&_.ProseMirror_.is-empty::before]:pointer-events-none [&_.ProseMirror_.is-empty::before]:h-0 [&_.ProseMirror_h1]:text-xl [&_.ProseMirror_h1]:font-semibold [&_.ProseMirror_h1]:text-gray-900 [&_.ProseMirror_h1]:mb-2 [&_.ProseMirror_h2]:text-lg [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:text-gray-900 [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h3]:text-base [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:text-gray-900 [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:ml-4 [&_.ProseMirror_ul]:space-y-1 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:ml-4 [&_.ProseMirror_ol]:space-y-1 [&_.ProseMirror_a]:text-blue-600 [&_.ProseMirror_a]:underline [&_.ProseMirror_a:hover]:text-blue-700 [&_.ProseMirror_strong]:font-semibold [&_.ProseMirror_strong]:text-gray-900 [&_.ProseMirror_em]:italic [&_.ProseMirror_em]:text-gray-800 [&_.ProseMirror_pre]:bg-[#f8fafc] [&_.ProseMirror_pre]:border [&_.ProseMirror_pre]:border-gray-200 [&_.ProseMirror_pre]:rounded-lg [&_.ProseMirror_pre]:p-4 [&_.ProseMirror_pre]:my-4 [&_.ProseMirror_pre]:overflow-x-auto [&_.ProseMirror_pre]:text-sm [&_.ProseMirror_pre]:relative [&_.ProseMirror_code]:bg-gray-100 [&_.ProseMirror_code]:text-blue-600 [&_.ProseMirror_code]:px-1.5 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:text-sm [&_.ProseMirror_code]:font-mono [&_.ProseMirror_pre_code]:bg-transparent [&_.ProseMirror_pre_code]:text-gray-900 [&_.ProseMirror_pre_code]:p-0 [&_.ProseMirror_pre_code]:font-mono [&_.ProseMirror_pre[data-language]::before]:content-[attr(data-language)] [&_.ProseMirror_pre[data-language]::before]:absolute [&_.ProseMirror_pre[data-language]::before]:top-3 [&_.ProseMirror_pre[data-language]::before]:right-3 [&_.ProseMirror_pre[data-language]::before]:text-xs [&_.ProseMirror_pre[data-language]::before]:text-gray-500 [&_.ProseMirror_pre[data-language]::before]:uppercase [&_.ProseMirror_pre[data-language]::before]:font-mono [&_.ProseMirror_pre[data-language]::before]:px-2.5 [&_.ProseMirror_pre[data-language]::before]:py-1 [&_.ProseMirror_pre[data-language]::before]:bg-gray-200/80 [&_.ProseMirror_pre[data-language]::before]:rounded-md [&_.ProseMirror_pre[data-language]::before]:backdrop-blur-sm [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-blue-500/50 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-gray-700 [&_.ProseMirror_blockquote]:my-4',
    },
    placeholder: 'text-gray-400',
  },
};

const codeLanguages = [
  { value: '', label: 'Plain Text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'bash', label: 'Bash' },
  { value: 'sql', label: 'SQL' },
  { value: 'dockerfile', label: 'Dockerfile' },
  { value: 'nginx', label: 'Nginx' },
];

const themeConfig = computed(() => themeConfigs[props.theme]);

let isUpdatingFromProp = false;

const editor = useEditor({
  extensions: [
    StarterKit.configure({ codeBlock: false }),
    CodeBlock.extend({
      addAttributes() {
        return {
          ...this.parent?.(),
          language: {
            default: null,
            parseHTML: (element) =>
              element.getAttribute('data-language') ||
              element.getAttribute('class')?.match(/language-(\w+)/)?.[1] ||
              null,
            renderHTML: (attributes: { language?: string | null }) =>
              attributes.language
                ? { 'data-language': attributes.language, class: `language-${attributes.language}` }
                : {},
          },
        };
      },
    }).configure({ HTMLAttributes: { 'data-language': null } }),
    Markdown,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class:
          props.theme === 'dark'
            ? 'text-wds-accent underline hover:text-wds-accent/80'
            : 'text-blue-600 underline hover:text-blue-700',
      },
    }),
    Placeholder.configure({ placeholder: props.placeholder }),
  ],
  content: model.value || '',
  editable: !props.disabled,
  editorProps: {
    attributes: { class: 'prose prose-invert max-w-none focus:outline-none' },
  },
  onUpdate: ({ editor: e }) => {
    if (isUpdatingFromProp) return;
    if ((e as any).markdown) {
      const markdown = (e as any).markdown.serialize(e.getJSON()) as string;
      model.value = markdown;
      emit('change', markdown);
    }
  },
});

const linkDialogOpen = ref(false);
const linkUrl = ref('');
const codeBlockDialogOpen = ref(false);
const codeBlockLanguage = ref('');

watch(
  () => model.value,
  (value) => {
    const e = editor.value;
    if (e && value !== undefined && (e as any).markdown) {
      const currentMarkdown = (e as any).markdown.serialize(e.getJSON()) as string;
      if (currentMarkdown !== value) {
        isUpdatingFromProp = true;
        e.commands.setContent(value || '', { contentType: 'markdown' } as any);
        setTimeout(() => (isUpdatingFromProp = false), 0);
      }
    }
  },
);

watch(
  () => props.disabled,
  (d) => editor.value?.setEditable(!d),
);

function btnClass(isActive: boolean) {
  const t = themeConfig.value.toolbarButton;
  return cn(t.base, isActive ? t.active : t.inactive);
}

function handleLinkClick() {
  const e = editor.value;
  if (!e) return;
  const { from, to } = e.state.selection;
  const attrs = e.getAttributes('link');
  if (attrs.href) {
    linkUrl.value = attrs.href;
  } else {
    const selectedText = e.state.doc.textBetween(from, to);
    linkUrl.value = selectedText.startsWith('http') ? selectedText : '';
  }
  linkDialogOpen.value = true;
}

function handleLinkSubmit() {
  const e = editor.value;
  if (!e || !linkUrl.value.trim()) return;
  const trimmed = linkUrl.value.trim();
  const url = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
  e.chain().focus().setLink({ href: url }).run();
  linkDialogOpen.value = false;
  linkUrl.value = '';
}

function handleRemoveLink() {
  const e = editor.value;
  if (!e) return;
  e.chain().focus().unsetLink().run();
  linkDialogOpen.value = false;
  linkUrl.value = '';
}

function handleCodeBlockSubmit() {
  const e = editor.value;
  if (!e) return;
  if (e.isActive('codeBlock')) {
    e.chain()
      .focus()
      .updateAttributes('codeBlock', { language: codeBlockLanguage.value || null })
      .run();
  } else if (codeBlockLanguage.value) {
    e.chain()
      .focus()
      .toggleCodeBlock()
      .updateAttributes('codeBlock', { language: codeBlockLanguage.value })
      .run();
  } else {
    e.chain().focus().toggleCodeBlock().run();
  }
  codeBlockDialogOpen.value = false;
  codeBlockLanguage.value = '';
}

const linkHasHref = () => !!editor.value?.getAttributes('link').href;
const codeBlockActive = () => !!editor.value?.isActive('codeBlock');
</script>

<template>
  <div v-if="editor" :class="cn(themeConfig.container, props.class)">
    <!-- Toolbar -->
    <div :class="themeConfig.toolbar">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        :disabled="disabled || !editor.can().chain().focus().toggleBold().run()"
        :class="btnClass(editor.isActive('bold'))"
        title="Bold"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <Bold class="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        :disabled="disabled || !editor.can().chain().focus().toggleItalic().run()"
        :class="btnClass(editor.isActive('italic'))"
        title="Italic"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <Italic class="h-4 w-4" />
      </Button>

      <div :class="themeConfig.toolbarDivider" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        :disabled="disabled || !editor.can().chain().focus().toggleHeading({ level: 1 }).run()"
        :class="btnClass(editor.isActive('heading', { level: 1 }))"
        title="Heading 1"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
      >
        <Heading1 class="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        :disabled="disabled || !editor.can().chain().focus().toggleHeading({ level: 2 }).run()"
        :class="btnClass(editor.isActive('heading', { level: 2 }))"
        title="Heading 2"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        <Heading2 class="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        :disabled="disabled || !editor.can().chain().focus().toggleHeading({ level: 3 }).run()"
        :class="btnClass(editor.isActive('heading', { level: 3 }))"
        title="Heading 3"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        <Heading3 class="h-4 w-4" />
      </Button>

      <div :class="themeConfig.toolbarDivider" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        :disabled="disabled || !editor.can().chain().focus().toggleBulletList().run()"
        :class="btnClass(editor.isActive('bulletList'))"
        title="Bullet List"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        <List class="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        :disabled="disabled || !editor.can().chain().focus().toggleOrderedList().run()"
        :class="btnClass(editor.isActive('orderedList'))"
        title="Numbered List"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        <ListOrdered class="h-4 w-4" />
      </Button>

      <div :class="themeConfig.toolbarDivider" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        :disabled="disabled"
        :class="btnClass(codeBlockActive())"
        title="Code Block"
        @click="
          codeBlockLanguage = codeBlockActive()
            ? editor.getAttributes('codeBlock').language || ''
            : '';
          codeBlockDialogOpen = true;
        "
      >
        <Code class="h-4 w-4" />
      </Button>

      <div :class="themeConfig.toolbarDivider" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        :disabled="disabled || !editor.can().chain().focus().setLink({ href: '' }).run()"
        :class="btnClass(editor.isActive('link'))"
        title="Add/Edit Link"
        @click="handleLinkClick"
      >
        <LinkIcon class="h-4 w-4" />
      </Button>

      <div :class="themeConfig.toolbarDivider" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        :disabled="disabled || !editor.can().chain().focus().undo().run()"
        :class="btnClass(false)"
        title="Undo"
        @click="editor.chain().focus().undo().run()"
      >
        <Undo class="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        :disabled="disabled || !editor.can().chain().focus().redo().run()"
        :class="btnClass(false)"
        title="Redo"
        @click="editor.chain().focus().redo().run()"
      >
        <Redo class="h-4 w-4" />
      </Button>
    </div>

    <!-- Editor Content -->
    <div :class="themeConfig.editor.container">
      <EditorContent
        :editor="editor"
        :style="{ minHeight }"
        :class="cn(themeConfig.editor.content, '[&_.ProseMirror]:min-h-[300px]')"
      />
    </div>

    <!-- Code Block Dialog -->
    <DialogRoot v-model:open="codeBlockDialogOpen">
      <DialogPortal>
        <DialogOverlay
          class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        />
        <DialogContent
          :class="
            cn(
              'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border p-6 shadow-lg',
              theme === 'dark'
                ? 'border-wds-accent/30 bg-wds-background text-wds-text'
                : 'border-gray-300 bg-white text-gray-900',
            )
          "
        >
          <DialogTitle
            :class="
              cn('mb-4 text-lg font-semibold', theme === 'dark' ? 'text-wds-text' : 'text-gray-900')
            "
          >
            {{ codeBlockActive() ? 'Chỉnh sửa Code Block' : 'Chèn Code Block' }}
          </DialogTitle>

          <div class="space-y-4">
            <div>
              <label
                for="code-language"
                :class="
                  cn(
                    'mb-2 block text-sm font-medium',
                    theme === 'dark' ? 'text-wds-text/80' : 'text-gray-700',
                  )
                "
              >
                Ngôn ngữ (tùy chọn)
              </label>
              <select
                id="code-language"
                v-model="codeBlockLanguage"
                :class="
                  cn(
                    'w-full rounded-lg border px-3 py-2 text-sm',
                    theme === 'dark'
                      ? 'border-wds-accent/30 bg-wds-background text-wds-text focus:border-wds-accent focus:ring-wds-accent/20 focus:ring-2 focus:outline-none'
                      : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none',
                  )
                "
                @keydown.enter.prevent="handleCodeBlockSubmit"
                @keydown.esc="codeBlockDialogOpen = false"
              >
                <option v-for="lang in codeLanguages" :key="lang.value" :value="lang.value">
                  {{ lang.label }}
                </option>
              </select>
            </div>

            <div class="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                :class="
                  theme === 'dark'
                    ? 'border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10'
                    : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                "
                @click="codeBlockDialogOpen = false"
              >
                Hủy
              </Button>
              <Button
                type="button"
                :class="
                  theme === 'dark'
                    ? 'bg-wds-accent hover:bg-wds-accent/90 text-black'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                "
                @click="handleCodeBlockSubmit"
              >
                {{ codeBlockActive() ? 'Cập nhật' : 'Chèn' }}
              </Button>
            </div>
          </div>

          <DialogClose as-child>
            <button
              :class="
                cn(
                  'absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:outline-none',
                  theme === 'dark'
                    ? 'text-wds-text/70 hover:text-wds-text focus:ring-wds-accent/20'
                    : 'text-gray-500 hover:text-gray-900 focus:ring-blue-500/20',
                )
              "
            >
              <X class="h-4 w-4" />
              <span class="sr-only">Close</span>
            </button>
          </DialogClose>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>

    <!-- Link Dialog -->
    <DialogRoot
      :open="linkDialogOpen"
      @update:open="
        (v: boolean) => {
          linkDialogOpen = v;
          if (!v) linkUrl = '';
        }
      "
    >
      <DialogPortal>
        <DialogOverlay
          class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        />
        <DialogContent
          :class="
            cn(
              'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border p-6 shadow-lg',
              theme === 'dark'
                ? 'border-wds-accent/30 bg-wds-background text-wds-text'
                : 'border-gray-300 bg-white text-gray-900',
            )
          "
        >
          <DialogTitle
            :class="
              cn('mb-4 text-lg font-semibold', theme === 'dark' ? 'text-wds-text' : 'text-gray-900')
            "
          >
            {{ linkHasHref() ? 'Edit Link' : 'Add Link' }}
          </DialogTitle>

          <div class="space-y-4">
            <div>
              <label
                for="link-url"
                :class="
                  cn(
                    'mb-2 block text-sm font-medium',
                    theme === 'dark' ? 'text-wds-text/80' : 'text-gray-700',
                  )
                "
              >
                URL
              </label>
              <Input
                id="link-url"
                type="url"
                v-model="linkUrl"
                placeholder="https://example.com"
                autofocus
                :class="
                  theme === 'dark'
                    ? 'border-wds-accent/30 bg-wds-background text-wds-text placeholder:text-wds-text/50 focus:border-wds-accent focus:ring-wds-accent/20'
                    : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20'
                "
                @keydown.enter.prevent="handleLinkSubmit"
                @keydown.esc="linkDialogOpen = false"
              />
            </div>

            <div class="flex justify-end gap-2">
              <Button
                v-if="linkHasHref()"
                type="button"
                variant="outline"
                :class="
                  theme === 'dark'
                    ? 'border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10'
                    : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                "
                @click="handleRemoveLink"
              >
                Remove Link
              </Button>
              <Button
                type="button"
                variant="outline"
                :class="
                  theme === 'dark'
                    ? 'border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10'
                    : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                "
                @click="linkDialogOpen = false"
              >
                Cancel
              </Button>
              <Button
                type="button"
                :class="
                  theme === 'dark'
                    ? 'bg-wds-accent hover:bg-wds-accent/90 text-black'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                "
                @click="handleLinkSubmit"
              >
                {{ linkHasHref() ? 'Update' : 'Add' }}
              </Button>
            </div>
          </div>

          <DialogClose as-child>
            <button
              :class="
                cn(
                  'absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:outline-none',
                  theme === 'dark'
                    ? 'text-wds-text/70 hover:text-wds-text focus:ring-wds-accent/20'
                    : 'text-gray-500 hover:text-gray-900 focus:ring-blue-500/20',
                )
              "
            >
              <X class="h-4 w-4" />
              <span class="sr-only">Close</span>
            </button>
          </DialogClose>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </div>
</template>
