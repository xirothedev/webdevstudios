<script setup lang="ts">
import { useRouter } from 'vue-router';
import { computed, ref, watch } from 'vue';

import { useAuth } from '@/composables/use-auth';
import { useAddToCart } from '@/lib/api/hooks/use-cart';
import { useSuspenseProduct } from '@/lib/api/hooks/use-products';
import { toast } from '@/lib/toast';
import { getBackendSlug } from '@/lib/product-slug-mapping';
import { getProductStaticContent } from '@/lib/product-static-content';

import ProductActions from './product-actions.vue';
import ProductAdditionalInfo from './product-additional-info.vue';
import ProductFeatures from './product-features.vue';
import ProductImageGallery from './product-image-gallery.vue';
import ProductInfo from './product-info.vue';
import ProductQuantitySelector from './product-quantity-selector.vue';
import ProductReviews from './product-reviews.vue';
import ProductSizeGuide from './product-size-guide.vue';
import ProductSizeSelector from './product-size-selector.vue';
import ReviewForm from './review-form.vue';

import type { ProductSize } from '@/types/product';

const props = defineProps<{
  productSlug: 'ao-thun' | 'pad-chuot' | 'day-deo' | 'moc-khoa';
  productName: string;
}>();

const selectedSize = ref<ProductSize>('M');
const quantity = ref(1);

const router = useRouter();
const BACKEND_SLUG = getBackendSlug(props.productSlug);
const { user, isAuthenticated } = useAuth();

const { data: product, isLoading } = useSuspenseProduct(BACKEND_SLUG);

const staticContent = getProductStaticContent(BACKEND_SLUG);

const addToCartMutation = useAddToCart();

const stockBySize = computed(() =>
  product.value?.sizeStocks?.reduce(
    (acc, ss) => {
      acc[ss.size] = ss.stock;
      return acc;
    },
    {} as Record<ProductSize, number>,
  ),
);
const selectedSizeStock = computed(
  () => stockBySize.value?.[selectedSize.value] ?? product.value?.stock ?? 0,
);

// Clamp quantity when the selected size's stock is lower than current quantity
// (React does this in render phase; a watcher is the Vue equivalent).
watch(selectedSizeStock, (stock) => {
  if (product.value?.hasSizes && quantity.value > stock) {
    quantity.value = stock > 0 ? stock : 1;
  }
});

const handleAddToCart = () => {
  if (!product.value) return;

  // For products with sizes (ao-thun)
  if (product.value.hasSizes) {
    // Validation: ensure size is selected
    if (!selectedSize.value) {
      toast.error('Vui lòng chọn size');
      return;
    }

    // Validation: quantity must be valid
    if (quantity.value <= 0 || quantity.value > selectedSizeStock.value) {
      toast.error('Số lượng không hợp lệ');
      return;
    }

    addToCartMutation.mutate({
      productId: product.value.id,
      size: selectedSize.value,
      quantity: quantity.value,
    });
  } else {
    // Validation: quantity must be valid
    if (quantity.value <= 0 || quantity.value > product.value.stock) {
      toast.error('Số lượng không hợp lệ');
      return;
    }

    addToCartMutation.mutate({
      productId: product.value.id,
      quantity: quantity.value,
    });
  }
};

const handleBuyNow = () => {
  if (!product.value || !isAuthenticated.value) {
    toast.error('Vui lòng đăng nhập để mua hàng');
    router.push('/auth/login');
    return;
  }

  // Check stock
  const availableStock = product.value.hasSizes
    ? product.value.sizeStocks?.find((ss) => ss.size === selectedSize.value)?.stock || 0
    : product.value.stock || 0;

  if (quantity.value > availableStock) {
    toast.error(`Số lượng vượt quá tồn kho. Tồn kho hiện tại: ${availableStock}`);
    return;
  }

  router.push(
    `/checkout?buyNow=true&productId=${product.value.id}&productSlug=${BACKEND_SLUG}&size=${selectedSize.value}&quantity=${quantity.value}`,
  );
};

const increaseQuantity = () => {
  if (!product.value) return;
  quantity.value = Math.min(
    quantity.value + 1,
    product.value.hasSizes ? (selectedSizeStock.value ?? 10) : (product.value.stock ?? 10),
  );
};

const decreaseQuantity = () => {
  quantity.value = Math.max(quantity.value - 1, 1);
};

// Map backend ProductDto to component props
const price = computed(() => ({
  current: product.value?.priceCurrent ?? 0,
  original: product.value?.priceOriginal ?? undefined,
  discount: product.value?.priceDiscount ?? undefined,
}));

const rating = computed(() => ({
  value: product.value?.ratingValue ?? 0,
  count: product.value?.ratingCount ?? 0,
}));

const sizes = computed(() => product.value?.sizeStocks?.map((ss) => ss.size) || []);
</script>

<template>
  <!-- Mirrors apps/web shop/(shop)/layout.tsx: ambient glow + page container. -->
  <div
    class="bg-wds-background text-wds-text selection:bg-wds-accent/30 selection:text-wds-text min-h-screen"
  >
    <!-- Background ambient glow -->
    <div class="fixed inset-0 -z-10 overflow-hidden">
      <div
        class="bg-wds-accent/20 absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full blur-[120px]"
      />
      <div
        class="absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] rounded-full bg-purple-500/20 blur-[120px]"
      />
    </div>

    <div class="relative z-10 pt-24 pb-20">
      <div class="mx-auto max-w-7xl px-6">
        <!-- Loading skeleton (apps/web Suspense fallback) -->
        <div v-if="isLoading || !product" class="flex flex-col gap-12">
          <!-- Breadcrumb Skeleton -->
          <div class="h-5 w-48 animate-pulse rounded bg-white/10" />

          <!-- Product Section Skeleton -->
          <div class="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            <!-- Image Skeleton -->
            <div class="space-y-4">
              <div class="aspect-square w-full animate-pulse rounded-xl bg-white/10" />
              <div class="grid grid-cols-4 gap-4">
                <div
                  v-for="i in 4"
                  :key="i"
                  class="aspect-square animate-pulse rounded-lg bg-white/10"
                />
              </div>
            </div>

            <!-- Info Skeleton -->
            <div class="flex flex-col justify-center space-y-6">
              <div class="h-8 w-3/4 animate-pulse rounded bg-white/10" />
              <div class="h-4 w-1/2 animate-pulse rounded bg-white/10" />
              <div class="h-6 w-1/3 animate-pulse rounded bg-white/10" />
              <div class="h-20 w-full animate-pulse rounded bg-white/10" />
              <div class="h-12 w-32 animate-pulse rounded bg-white/10" />
              <div class="h-12 w-full animate-pulse rounded bg-white/10" />
              <div class="h-12 w-full animate-pulse rounded bg-white/10" />
            </div>
          </div>
        </div>

        <template v-else>
          <!-- Breadcrumb -->
          <nav class="mb-8 flex items-center gap-2 text-sm text-white/60">
            <RouterLink to="/shop" class="hover:text-wds-accent transition-colors">Shop</RouterLink>
            <span>/</span>
            <span class="text-white/90">{{ productName }}</span>
          </nav>

          <!-- Product Section -->
          <div class="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            <!-- Left: Product Image -->
            <ProductImageGallery
              :images="staticContent.images"
              :badge="product.badge || undefined"
            />

            <!-- Right: Product Info -->
            <div class="flex flex-col justify-center">
              <ProductInfo
                :name="product.name"
                :rating="rating"
                :price="price"
                :description="product.description"
                price-note="Giá đã bao gồm VAT. Miễn phí vận chuyển cho đơn hàng trên 500.000₫"
              />

              <!-- Size Selector -->
              <ProductSizeSelector
                v-if="product.hasSizes && sizes.length > 0"
                :sizes="sizes"
                :selected-size="selectedSize"
                :stock-by-size="stockBySize"
                @size-change="(size: ProductSize) => (selectedSize = size)"
              />

              <!-- Quantity Selector -->
              <ProductQuantitySelector
                :quantity="quantity"
                :stock="product.hasSizes ? selectedSizeStock : product.stock"
                :max="product.hasSizes ? (selectedSizeStock ?? 0) : (product.stock ?? 0)"
                @increase="increaseQuantity"
                @decrease="decreaseQuantity"
              />

              <!-- Add to Cart Button -->
              <ProductActions
                :is-adding-to-cart="addToCartMutation.isPending.value"
                @add-to-cart="handleAddToCart"
                @buy-now="handleBuyNow"
              />

              <!-- Product Features -->
              <ProductFeatures :features="staticContent.features" />
            </div>
          </div>

          <!-- Additional Info Section -->
          <ProductAdditionalInfo :info="staticContent.additionalInfo" />

          <!-- Size Guide Section - Only for products with sizes -->
          <ProductSizeGuide v-if="product.hasSizes" />

          <!-- Reviews Section -->
          <section class="mt-16">
            <h2 class="mb-8 text-3xl font-bold text-white">Đánh giá sản phẩm</h2>

            <!-- Review Form - Only for authenticated users -->
            <div v-if="isAuthenticated" class="mb-8">
              <ReviewForm :product-slug="BACKEND_SLUG" :current-user-id="user?.id" />
            </div>
            <div v-else class="mb-8 rounded-xl border border-white/10 bg-white/5 p-6">
              <p class="text-white/60">Đăng nhập để viết đánh giá về sản phẩm này.</p>
            </div>

            <!-- Reviews List -->
            <ProductReviews
              :product-slug="BACKEND_SLUG"
              :current-user-id="user?.id"
              :current-user-role="user?.role"
            />
          </section>
        </template>
      </div>
    </div>
  </div>
</template>
