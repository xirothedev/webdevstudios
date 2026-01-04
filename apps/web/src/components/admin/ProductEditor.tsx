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

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { adminApi } from '@/lib/api/admin';

// Validation schema with Zod
const productFormSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm là bắt buộc'),
  description: z.string().min(1, 'Mô tả sản phẩm là bắt buộc'),
  priceCurrent: z.number().min(0, 'Giá phải lớn hơn hoặc bằng 0').optional(),
  priceOriginal: z
    .number()
    .min(0, 'Giá gốc phải lớn hơn hoặc bằng 0')
    .nullable()
    .optional(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductEditorProps {
  productId: string;
  onSave?: () => void;
  onCancel?: () => void;
}

export function ProductEditor({
  productId,
  onSave,
  onCancel,
}: ProductEditorProps) {
  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => adminApi.listProducts(),
  });

  const product = products?.products.find((p) => p.id === productId);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      priceCurrent: undefined,
      priceOriginal: undefined,
    },
  });

  // Watch name for dynamic header
  const watchedName = watch('name');

  // Reset form when product data is loaded
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        priceCurrent: product.priceCurrent,
        priceOriginal: product.priceOriginal ?? undefined,
      });
    }
  }, [product, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: {
      name?: string;
      description?: string;
      priceCurrent?: number;
      priceOriginal?: number | null;
      badge?: string | null;
      isPublished?: boolean;
    }) => adminApi.updateProduct(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Product updated successfully');
      onSave?.();
    },
    onError: () => {
      toast.error('Failed to update product');
    },
  });

  if (!product) {
    return <div className="text-wds-text/70">Product not found</div>;
  }

  const onSubmit = (data: ProductFormData) => {
    console.log(data);

    updateMutation.mutate({
      name: data.name.trim(),
      description: data.description || '',
      priceCurrent: data.priceCurrent,
      priceOriginal: data.priceOriginal ?? null,
    });
  };

  const isLoading = isSubmitting || updateMutation.isPending;

  return (
    <div className="border-wds-accent/30 bg-wds-background space-y-4 rounded-2xl border p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-wds-text text-xl font-bold">
          Edit: {watchedName || product.name}
        </h2>
      </div>

      <form
        id="product-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div>
          <label
            htmlFor="name"
            className="text-wds-text mb-2 block text-sm font-medium"
          >
            Product Name
          </label>
          <Input
            id="name"
            type="text"
            placeholder="Enter product name..."
            disabled={isLoading}
            {...register('name')}
            className="border-wds-accent/30 bg-wds-background text-wds-text placeholder:text-wds-text/50 focus:border-wds-accent focus:ring-wds-accent/20"
          />
          {errors.name && (
            <p className="text-wds-accent mt-1 text-sm">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="text-wds-text mb-2 block text-sm font-medium"
          >
            Description
          </label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <MarkdownEditor
                value={field.value || ''}
                onChange={field.onChange}
                disabled={isLoading}
                placeholder="Enter product description (supports markdown)..."
                theme="dark"
              />
            )}
          />
          {errors.description && (
            <p className="text-wds-accent mt-1 text-sm">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="priceCurrent"
              className="text-wds-text mb-2 block text-sm font-medium"
            >
              Current Price
            </label>
            <Input
              id="priceCurrent"
              type="number"
              step="1000"
              min="0"
              disabled={isLoading}
              placeholder="Enter current price..."
              {...register('priceCurrent', {
                valueAsNumber: true,
              })}
              className="border-wds-accent/30 bg-wds-background text-wds-text"
            />
            {errors.priceCurrent && (
              <p className="text-wds-accent mt-1 text-sm">
                {errors.priceCurrent.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="priceOriginal"
              className="text-wds-text mb-2 block text-sm font-medium"
            >
              Original Price
            </label>
            <Input
              id="priceOriginal"
              type="number"
              step="1000"
              min="0"
              disabled={isLoading}
              placeholder="Enter original price (optional)..."
              {...register('priceOriginal', {
                valueAsNumber: true,
                setValueAs: (v) =>
                  v === '' || v === null ? undefined : Number(v),
              })}
              className="border-wds-accent/30 bg-wds-background text-wds-text"
            />
            {errors.priceOriginal && (
              <p className="text-wds-accent mt-1 text-sm">
                {errors.priceOriginal.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-wds-accent hover:bg-wds-accent/90 text-black"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </div>
  );
}
