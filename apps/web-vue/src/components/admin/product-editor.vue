<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useField, useForm } from 'vee-validate';
import { computed, watch } from 'vue';
import { z } from 'zod';

import Button from '@/components/ui/button.vue';
import { Input } from '@/components/ui/input.vue';
import MarkdownEditor from '@/components/ui/markdown-editor.vue';
import { adminApi } from '@/lib/api/admin';
import { toast } from '@/lib/toast';

import { adminKeys, useAdminProducts } from './use-admin';

// apps/web ProductEditor edits name/description/prices only — it has no stock/sizes UI
// despite the ticket wording; mirroring the reference as-is.
// number inputs ride as strings through vee-validate (no parseInput option in v4 types);
// zod validates the string, onSubmit converts — same messages as apps/web.
const optionalNonNegativeNumber = (message: string) =>
  z
    .string()
    .optional()
    .refine((v) => v === undefined || v === '' || Number(v) >= 0, message);

const productFormSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm là bắt buộc'),
  description: z.string().min(1, 'Mô tả sản phẩm là bắt buộc'),
  priceCurrent: optionalNonNegativeNumber('Giá phải lớn hơn hoặc bằng 0'),
  priceOriginal: optionalNonNegativeNumber('Giá gốc phải lớn hơn hoặc bằng 0'),
});

const props = defineProps<{
  productId: string;
  onSave?: () => void;
  onCancel?: () => void;
}>();

const queryClient = useQueryClient();
const { data: products } = useAdminProducts();
const product = computed(() => products.value?.products.find((p) => p.id === props.productId));

const {
  handleSubmit,
  resetForm: reset,
  isSubmitting,
} = useForm({
  validationSchema: toTypedSchema(productFormSchema),
  initialValues: { name: '', description: '', priceCurrent: '', priceOriginal: '' },
});

const { value: name, errorMessage: nameError } = useField<string>('name');
const { value: description, errorMessage: descriptionError } = useField<string>('description');
const { value: priceCurrent, errorMessage: priceCurrentError } = useField<string>('priceCurrent');
const { value: priceOriginal, errorMessage: priceOriginalError } =
  useField<string>('priceOriginal');

watch(product, (p) => {
  if (p) {
    reset({
      values: {
        name: p.name,
        description: p.description,
        priceCurrent: String(p.priceCurrent),
        priceOriginal: p.priceOriginal == null ? '' : String(p.priceOriginal),
      },
    });
  }
});

const updateMutation = useMutation({
  mutationFn: (data: Parameters<typeof adminApi.updateProduct>[1]) =>
    adminApi.updateProduct(props.productId, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: adminKeys.products() });
    toast.success('Product updated successfully');
    props.onSave?.();
  },
  onError: () => {
    toast.error('Failed to update product');
  },
});

const toNum = (v: string | undefined) => (v === undefined || v === '' ? undefined : Number(v));

const onSubmit = handleSubmit((values) => {
  updateMutation.mutate({
    name: values.name.trim(),
    description: values.description || '',
    priceCurrent: toNum(values.priceCurrent),
    priceOriginal: toNum(values.priceOriginal) ?? null,
  });
});

const isLoading = computed(() => isSubmitting.value || updateMutation.isPending.value);
</script>

<template>
  <div v-if="!product" class="text-wds-text/70">Product not found</div>
  <div v-else class="border-wds-accent/30 bg-wds-background space-y-4 rounded-2xl border p-6">
    <div class="flex items-center justify-between">
      <h2 class="text-wds-text text-xl font-bold">Edit: {{ name || product.name }}</h2>
    </div>

    <form class="space-y-4" @submit="onSubmit">
      <div>
        <label for="product-name" class="text-wds-text mb-2 block text-sm font-medium">
          Product Name
        </label>
        <Input
          id="product-name"
          v-model="name"
          type="text"
          placeholder="Enter product name..."
          :disabled="isLoading"
          class="border-wds-accent/30 bg-wds-background text-wds-text placeholder:text-wds-text/50 focus:border-wds-accent focus:ring-wds-accent/20"
        />
        <p v-if="nameError" class="text-wds-accent mt-1 text-sm">{{ nameError }}</p>
      </div>

      <div>
        <label for="product-description" class="text-wds-text mb-2 block text-sm font-medium">
          Description
        </label>
        <MarkdownEditor
          id="product-description"
          v-model="description"
          :disabled="isLoading"
          placeholder="Enter product description (supports markdown)..."
          theme="dark"
        />
        <p v-if="descriptionError" class="text-wds-accent mt-1 text-sm">
          {{ descriptionError }}
        </p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="price-current" class="text-wds-text mb-2 block text-sm font-medium">
            Current Price
          </label>
          <Input
            id="price-current"
            v-model="priceCurrent"
            type="number"
            step="1000"
            min="0"
            :disabled="isLoading"
            placeholder="Enter current price..."
            class="border-wds-accent/30 bg-wds-background text-wds-text"
          />
          <p v-if="priceCurrentError" class="text-wds-accent mt-1 text-sm">
            {{ priceCurrentError }}
          </p>
        </div>
        <div>
          <label for="price-original" class="text-wds-text mb-2 block text-sm font-medium">
            Original Price
          </label>
          <Input
            id="price-original"
            v-model="priceOriginal"
            type="number"
            step="1000"
            min="0"
            :disabled="isLoading"
            placeholder="Enter original price (optional)..."
            class="border-wds-accent/30 bg-wds-background text-wds-text"
          />
          <p v-if="priceOriginalError" class="text-wds-accent mt-1 text-sm">
            {{ priceOriginalError }}
          </p>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          :disabled="isLoading"
          class="border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10"
          @click="onCancel?.()"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          :disabled="isLoading"
          class="bg-wds-accent hover:bg-wds-accent/90 text-black"
        >
          {{ isLoading ? 'Saving...' : 'Save' }}
        </Button>
      </div>
    </form>
  </div>
</template>
