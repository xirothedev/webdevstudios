'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { blogApi, type BlogPostWithContent } from '@/lib/api/blog';

// Validation schema with Zod
const blogPostFormSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug là bắt buộc')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug chỉ được chứa chữ thường, số và dấu gạch ngang'
    ),
  title: z.string().min(1, 'Tiêu đề là bắt buộc'),
  content: z.string().min(1, 'Nội dung là bắt buộc'),
  excerpt: z
    .string()
    .max(500, 'Excerpt không được vượt quá 500 ký tự')
    .optional()
    .nullable(),
  metaTitle: z
    .string()
    .max(255, 'Meta title không được vượt quá 255 ký tự')
    .optional()
    .nullable(),
  metaDescription: z
    .string()
    .max(500, 'Meta description không được vượt quá 500 ký tự')
    .optional()
    .nullable(),
  isPublished: z.boolean().optional(),
});

type BlogPostFormData = z.infer<typeof blogPostFormSchema>;

interface BlogEditorProps {
  postId?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

export function BlogEditor({ postId, onSave, onCancel }: BlogEditorProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!postId;

  const { data: post, isLoading: isLoadingPost } = useQuery({
    queryKey: ['blog', 'post', postId],
    queryFn: () => blogApi.getPostById(postId!, true),
    enabled: isEditing,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: {
      slug: '',
      title: '',
      content: '',
      excerpt: null,
      metaTitle: null,
      metaDescription: null,
      isPublished: false,
    },
  });

  // Watch title for dynamic header
  const watchedTitle = watch('title');

  // Reset form when post data is loaded
  useEffect(() => {
    if (post && 'content' in post) {
      reset({
        slug: post.slug,
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || null,
        metaTitle: post.metaTitle || null,
        metaDescription: post.metaDescription || null,
        isPublished: post.isPublished,
      });
    }
  }, [post, reset]);

  const createMutation = useMutation({
    mutationFn: (data: BlogPostFormData) =>
      blogApi.createPost({
        slug: data.slug,
        title: data.title,
        content: data.content,
        excerpt: data.excerpt || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        isPublished: data.isPublished || false,
      }),
    onSuccess: (newPost) => {
      queryClient.invalidateQueries({ queryKey: ['blog', 'posts'] });
      toast.success('Bài viết đã được tạo thành công');
      router.push(`/admin/blog/${newPost.id}`);
      onSave?.();
    },
    onError: (error: Error | unknown) => {
      const message =
        error instanceof Error ? error.message : 'Không thể tạo bài viết';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: BlogPostFormData) =>
      blogApi.updatePost(postId!, {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt !== undefined ? data.excerpt : undefined,
        metaTitle: data.metaTitle !== undefined ? data.metaTitle : undefined,
        metaDescription:
          data.metaDescription !== undefined ? data.metaDescription : undefined,
        isPublished: data.isPublished,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog', 'post', postId] });
      queryClient.invalidateQueries({ queryKey: ['blog', 'posts'] });
      toast.success('Bài viết đã được cập nhật thành công');
      onSave?.();
    },
    onError: (error: Error | unknown) => {
      const message =
        error instanceof Error ? error.message : 'Không thể cập nhật bài viết';
      toast.error(message);
    },
  });

  if (isEditing && isLoadingPost) {
    return <div className="text-wds-text/70">Đang tải...</div>;
  }

  if (isEditing && !post) {
    return <div className="text-wds-text/70">Không tìm thấy bài viết</div>;
  }

  const onSubmit = (data: BlogPostFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading =
    isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <div className="border-wds-accent/30 bg-wds-background space-y-4 rounded-2xl border p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-wds-text text-xl font-bold">
          {isEditing
            ? `Chỉnh sửa: ${watchedTitle || (post as BlogPostWithContent)?.title || ''}`
            : 'Tạo bài viết mới'}
        </h2>
      </div>

      <form
        id="blog-post-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        {!isEditing && (
          <div>
            <label
              htmlFor="slug"
              className="text-wds-text mb-2 block text-sm font-medium"
            >
              Slug (URL-friendly)
            </label>
            <Input
              id="slug"
              type="text"
              placeholder="getting-started-with-nextjs"
              disabled={isLoading}
              {...register('slug')}
              className="border-wds-accent/30 bg-wds-background text-wds-text placeholder:text-wds-text/50 focus:border-wds-accent focus:ring-wds-accent/20"
            />
            {errors.slug && (
              <p className="text-wds-accent mt-1 text-sm">
                {errors.slug.message}
              </p>
            )}
          </div>
        )}

        <div>
          <label
            htmlFor="title"
            className="text-wds-text mb-2 block text-sm font-medium"
          >
            Tiêu đề
          </label>
          <Input
            id="title"
            type="text"
            placeholder="Nhập tiêu đề bài viết..."
            disabled={isLoading}
            {...register('title')}
            className="border-wds-accent/30 bg-wds-background text-wds-text placeholder:text-wds-text/50 focus:border-wds-accent focus:ring-wds-accent/20"
          />
          {errors.title && (
            <p className="text-wds-accent mt-1 text-sm">
              {errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="content"
            className="text-wds-text mb-2 block text-sm font-medium"
          >
            Nội dung
          </label>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <MarkdownEditor
                value={field.value || ''}
                onChange={field.onChange}
                disabled={isLoading}
                placeholder="Nhập nội dung bài viết (hỗ trợ markdown)..."
                theme="dark"
                minHeight="400px"
              />
            )}
          />
          {errors.content && (
            <p className="text-wds-accent mt-1 text-sm">
              {errors.content.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="excerpt"
            className="text-wds-text mb-2 block text-sm font-medium"
          >
            Tóm tắt (tùy chọn, tự động tạo nếu để trống)
          </label>
          <Input
            id="excerpt"
            type="text"
            placeholder="Tóm tắt ngắn gọn về bài viết..."
            disabled={isLoading}
            {...register('excerpt')}
            className="border-wds-accent/30 bg-wds-background text-wds-text placeholder:text-wds-text/50 focus:border-wds-accent focus:ring-wds-accent/20"
          />
          {errors.excerpt && (
            <p className="text-wds-accent mt-1 text-sm">
              {errors.excerpt.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="metaTitle"
              className="text-wds-text mb-2 block text-sm font-medium"
            >
              SEO Meta Title
            </label>
            <Input
              id="metaTitle"
              type="text"
              placeholder="SEO title (tùy chọn)..."
              disabled={isLoading}
              {...register('metaTitle')}
              className="border-wds-accent/30 bg-wds-background text-wds-text"
            />
            {errors.metaTitle && (
              <p className="text-wds-accent mt-1 text-sm">
                {errors.metaTitle.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="metaDescription"
              className="text-wds-text mb-2 block text-sm font-medium"
            >
              SEO Meta Description
            </label>
            <Input
              id="metaDescription"
              type="text"
              placeholder="SEO description (tùy chọn)..."
              disabled={isLoading}
              {...register('metaDescription')}
              className="border-wds-accent/30 bg-wds-background text-wds-text"
            />
            {errors.metaDescription && (
              <p className="text-wds-accent mt-1 text-sm">
                {errors.metaDescription.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Controller
            name="isPublished"
            control={control}
            render={({ field }) => (
              <label className="text-wds-text flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={field.value || false}
                  onChange={(e) => field.onChange(e.target.checked)}
                  disabled={isLoading}
                  className="border-wds-accent/30 bg-wds-background text-wds-accent focus:ring-wds-accent/20 h-4 w-4 rounded"
                />
                <span className="text-sm">Xuất bản ngay</span>
              </label>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel || (() => router.back())}
            disabled={isLoading}
            className="border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-wds-accent hover:bg-wds-accent/90 text-black"
          >
            {isLoading ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </div>
      </form>
    </div>
  );
}
