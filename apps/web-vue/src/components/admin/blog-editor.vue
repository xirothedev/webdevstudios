<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { useField, useForm } from 'vee-validate';
import { computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { z } from 'zod';

import Button from '@/components/ui/button.vue';
import { Input } from '@/components/ui/input.vue';
import MarkdownEditor from '@/components/ui/markdown-editor.vue';
import { blogApi, type BlogPostWithContent } from '@/lib/api/blog';
import { toast } from '@/lib/toast';

// apps/web BlogEditor has no cover-image upload field (coverImage is API-only, never set
// from the UI) — mirrored as-is; there is no upload endpoint in apps/web api modules for it.
const blogPostFormSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug là bắt buộc')
    .regex(/^[a-z0-9-]+$/, 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang'),
  title: z.string().min(1, 'Tiêu đề là bắt buộc'),
  content: z.string().min(1, 'Nội dung là bắt buộc'),
  excerpt: z.string().max(500, 'Excerpt không được vượt quá 500 ký tự').optional().nullable(),
  metaTitle: z.string().max(255, 'Meta title không được vượt quá 255 ký tự').optional().nullable(),
  metaDescription: z
    .string()
    .max(500, 'Meta description không được vượt quá 500 ký tự')
    .optional()
    .nullable(),
  isPublished: z.boolean().optional(),
});

const props = defineProps<{
  postId?: string;
  onSave?: () => void;
  onCancel?: () => void;
}>();

const router = useRouter();
const queryClient = useQueryClient();
const isEditing = !!props.postId;

const postQuery = useQuery({
  queryKey: computed(() => ['blog', 'post', props.postId]),
  queryFn: () => blogApi.getPostById(props.postId!, true),
  enabled: computed(() => isEditing),
});

const {
  handleSubmit,
  resetForm: reset,
  isSubmitting,
} = useForm({
  validationSchema: toTypedSchema(blogPostFormSchema),
  initialValues: {
    slug: '',
    title: '',
    content: '',
    excerpt: null,
    metaTitle: null,
    metaDescription: null,
    isPublished: false,
  },
});

const { value: slug, errorMessage: slugError } = useField<string>('slug');
const { value: title, errorMessage: titleError } = useField<string>('title');
const { value: content, errorMessage: contentError } = useField<string>('content');
const { value: excerpt, errorMessage: excerptError } = useField<string | null>('excerpt');
const { value: metaTitle, errorMessage: metaTitleError } = useField<string | null>('metaTitle');
const { value: metaDescription, errorMessage: metaDescriptionError } = useField<string | null>(
  'metaDescription',
);
const { value: isPublished } = useField<boolean>('isPublished');

watch(postQuery.data, (post) => {
  if (post && 'content' in post) {
    reset({
      values: {
        slug: post.slug,
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || null,
        metaTitle: post.metaTitle || null,
        metaDescription: post.metaDescription || null,
        isPublished: post.isPublished,
      },
    });
  }
});

// ['blog'] prefix covers web-vue's blog list + detail keys (apps/web invalidated 'blog','posts')
function invalidateBlog() {
  queryClient.invalidateQueries({ queryKey: ['blog'] });
}

const createMutation = useMutation({
  mutationFn: (values: {
    slug: string;
    title: string;
    content: string;
    excerpt?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    isPublished?: boolean;
  }) =>
    blogApi.createPost({
      slug: values.slug,
      title: values.title,
      content: values.content,
      excerpt: values.excerpt || null,
      metaTitle: values.metaTitle || null,
      metaDescription: values.metaDescription || null,
      isPublished: values.isPublished || false,
    }),
  onSuccess: (newPost) => {
    invalidateBlog();
    toast.success('Bài viết đã được tạo thành công');
    router.push(`/admin/blog/${newPost.id}`);
    props.onSave?.();
  },
  onError: (error: unknown) => {
    toast.error(error instanceof Error ? error.message : 'Không thể tạo bài viết');
  },
});

const updateMutation = useMutation({
  mutationFn: (values: {
    title: string;
    content: string;
    excerpt?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    isPublished?: boolean;
  }) =>
    blogApi.updatePost(props.postId!, {
      title: values.title,
      content: values.content,
      excerpt: values.excerpt ?? undefined,
      metaTitle: values.metaTitle ?? undefined,
      metaDescription: values.metaDescription ?? undefined,
      isPublished: values.isPublished,
    }),
  onSuccess: () => {
    invalidateBlog();
    toast.success('Bài viết đã được cập nhật thành công');
    props.onSave?.();
  },
  onError: (error: unknown) => {
    toast.error(error instanceof Error ? error.message : 'Không thể cập nhật bài viết');
  },
});

const onSubmit = handleSubmit((values) => {
  if (isEditing) {
    updateMutation.mutate(values);
  } else {
    createMutation.mutate(values);
  }
});

const isLoading = computed(
  () => isSubmitting.value || createMutation.isPending.value || updateMutation.isPending.value,
);
</script>

<template>
  <div v-if="isEditing && postQuery.isLoading.value" class="text-wds-text/70">Đang tải...</div>
  <div v-else-if="isEditing && !postQuery.data.value" class="text-wds-text/70">
    Không tìm thấy bài viết
  </div>
  <div v-else class="border-wds-accent/30 bg-wds-background space-y-4 rounded-2xl border p-6">
    <div class="flex items-center justify-between">
      <h2 class="text-wds-text text-xl font-bold">
        {{
          isEditing
            ? `Chỉnh sửa: ${title || (postQuery.data.value as BlogPostWithContent | undefined)?.title || ''}`
            : 'Tạo bài viết mới'
        }}
      </h2>
    </div>

    <form class="space-y-4" @submit="onSubmit">
      <div v-if="!isEditing">
        <label for="blog-slug" class="text-wds-text mb-2 block text-sm font-medium">
          Slug (URL-friendly)
        </label>
        <Input
          id="blog-slug"
          v-model="slug"
          type="text"
          placeholder="getting-started-with-nextjs"
          :disabled="isLoading"
          class="border-wds-accent/30 bg-wds-background text-wds-text placeholder:text-wds-text/50 focus:border-wds-accent focus:ring-wds-accent/20"
        />
        <p v-if="slugError" class="text-wds-accent mt-1 text-sm">{{ slugError }}</p>
      </div>

      <div>
        <label for="blog-title" class="text-wds-text mb-2 block text-sm font-medium">
          Tiêu đề
        </label>
        <Input
          id="blog-title"
          v-model="title"
          type="text"
          placeholder="Nhập tiêu đề bài viết..."
          :disabled="isLoading"
          class="border-wds-accent/30 bg-wds-background text-wds-text placeholder:text-wds-text/50 focus:border-wds-accent focus:ring-wds-accent/20"
        />
        <p v-if="titleError" class="text-wds-accent mt-1 text-sm">{{ titleError }}</p>
      </div>

      <div>
        <label for="blog-content" class="text-wds-text mb-2 block text-sm font-medium">
          Nội dung
        </label>
        <MarkdownEditor
          id="blog-content"
          v-model="content"
          :disabled="isLoading"
          placeholder="Nhập nội dung bài viết (hỗ trợ markdown)..."
          theme="dark"
          min-height="400px"
        />
        <p v-if="contentError" class="text-wds-accent mt-1 text-sm">{{ contentError }}</p>
      </div>

      <div>
        <label for="blog-excerpt" class="text-wds-text mb-2 block text-sm font-medium">
          Tóm tắt (tùy chọn, tự động tạo nếu để trống)
        </label>
        <Input
          id="blog-excerpt"
          v-model="excerpt"
          type="text"
          placeholder="Tóm tắt ngắn gọn về bài viết..."
          :disabled="isLoading"
          class="border-wds-accent/30 bg-wds-background text-wds-text placeholder:text-wds-text/50 focus:border-wds-accent focus:ring-wds-accent/20"
        />
        <p v-if="excerptError" class="text-wds-accent mt-1 text-sm">{{ excerptError }}</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="blog-meta-title" class="text-wds-text mb-2 block text-sm font-medium">
            SEO Meta Title
          </label>
          <Input
            id="blog-meta-title"
            v-model="metaTitle"
            type="text"
            placeholder="SEO title (tùy chọn)..."
            :disabled="isLoading"
            class="border-wds-accent/30 bg-wds-background text-wds-text"
          />
          <p v-if="metaTitleError" class="text-wds-accent mt-1 text-sm">{{ metaTitleError }}</p>
        </div>
        <div>
          <label for="blog-meta-description" class="text-wds-text mb-2 block text-sm font-medium">
            SEO Meta Description
          </label>
          <Input
            id="blog-meta-description"
            v-model="metaDescription"
            type="text"
            placeholder="SEO description (tùy chọn)..."
            :disabled="isLoading"
            class="border-wds-accent/30 bg-wds-background text-wds-text"
          />
          <p v-if="metaDescriptionError" class="text-wds-accent mt-1 text-sm">
            {{ metaDescriptionError }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <label class="text-wds-text flex cursor-pointer items-center gap-2">
          <input
            v-model="isPublished"
            type="checkbox"
            :disabled="isLoading"
            class="border-wds-accent/30 bg-wds-background text-wds-accent focus:ring-wds-accent/20 h-4 w-4 rounded"
          />
          <span class="text-sm">Xuất bản ngay</span>
        </label>
      </div>

      <div class="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          :disabled="isLoading"
          class="border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10"
          @click="onCancel ? onCancel() : router.back()"
        >
          Hủy
        </Button>
        <Button
          type="submit"
          :disabled="isLoading"
          class="bg-wds-accent hover:bg-wds-accent/90 text-black"
        >
          {{ isLoading ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Tạo mới' }}
        </Button>
      </div>
    </form>
  </div>
</template>
