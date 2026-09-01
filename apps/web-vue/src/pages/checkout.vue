<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm, useField } from 'vee-validate';
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { z } from 'zod';

import { Button } from '@/components/ui/button.vue';
import { Input } from '@/components/ui/input.vue';
import { usePendingOrder } from '@/composables/use-pending-order';
import { cartTotals, useCart } from '@/lib/api/hooks/use-cart';
import { useCreateOrder, useOrders } from '@/lib/api/hooks/use-orders';
import { useCreatePaymentLink } from '@/lib/api/hooks/use-payments';
import { toast } from '@/lib/toast';
import { formatPrice } from '@/lib/utils';

import type { CreateOrderRequest, ShippingAddress } from '@/lib/api/orders';
import type { ProductSize } from '@/types/product';

// Validation schema với Zod
const shippingAddressSchema = z.object({
  fullName: z.string().min(1, 'Họ và tên là bắt buộc'),
  phone: z
    .string()
    .min(1, 'Số điện thoại là bắt buộc')
    .regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
  addressLine1: z.string().min(1, 'Địa chỉ là bắt buộc'),
  addressLine2: z.string().optional().nullable(),
  city: z.string().min(1, 'Tỉnh/Thành phố là bắt buộc'),
  district: z.string().min(1, 'Quận/Huyện là bắt buộc'),
  ward: z.string().min(1, 'Phường/Xã là bắt buộc'),
  postalCode: z
    .string()
    .min(1, 'Mã bưu điện là bắt buộc')
    .regex(/^[0-9]{5,6}$/, 'Mã bưu điện không hợp lệ'),
});

const route = useRoute();
const router = useRouter();
const pendingOrderStore = usePendingOrder();
const isBuyNow = route.query.buyNow === 'true';
const buyNowProductId = route.query.productId as string | undefined;
const buyNowProductSlug = route.query.productSlug as string | undefined;
const buyNowSize = route.query.size as ProductSize | undefined;
const buyNowQuantity = route.query.quantity as string | undefined;

// Fetch cart using TanStack Query (only used if not Buy Now)
const cartQuery = useCart();
const cart = isBuyNow ? computed(() => undefined) : cartQuery.data;
const isLoadingCart = isBuyNow ? computed(() => false) : cartQuery.isLoading;
const cartError = isBuyNow ? computed(() => null) : cartQuery.error;

// Check for pending orders
const { data: ordersData } = useOrders(1, 1);
const pendingOrder = computed(() =>
  ordersData.value?.orders.find(
    (order) => order.status === 'PENDING' && order.paymentStatus === 'PENDING',
  ),
);

// Create order mutation
const createOrderMutation = useCreateOrder();
const createPaymentLinkMutation = useCreatePaymentLink();

// Form setup với vee-validate + zod
const { handleSubmit, isSubmitting } = useForm({
  validationSchema: toTypedSchema(shippingAddressSchema),
  initialValues: {
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: null,
    city: '',
    district: '',
    ward: '',
    postalCode: '',
  },
});
const { value: fullName, errorMessage: fullNameError } = useField<string>('fullName');
const { value: phone, errorMessage: phoneError } = useField<string>('phone');
const { value: addressLine1, errorMessage: addressLine1Error } = useField<string>('addressLine1');
const { value: ward, errorMessage: wardError } = useField<string>('ward');
const { value: district, errorMessage: districtError } = useField<string>('district');
const { value: city, errorMessage: cityError } = useField<string>('city');
const { value: postalCode, errorMessage: postalCodeError } = useField<string>('postalCode');

// Redirect to cart if cart is empty or error (only for FROM_CART mode)
watch(
  [cart, cartError],
  () => {
    if (!isBuyNow && (cartError.value || (cart.value && cart.value.items.length === 0))) {
      router.push('/cart');
    }
  },
  { immediate: true },
);

// Redirect to payment page if there's a pending order
watch(pendingOrder, (order) => {
  if (order) {
    // Save orderId to localStorage for recovery
    pendingOrderStore.remember(order.id);
    router.push(`/payments/${order.id}`);
  }
});

const isFormSubmitting = computed(() => isSubmitting.value || createOrderMutation.isPending.value);

const onSubmit = handleSubmit((data) => {
  // For FROM_CART mode, check if cart exists and has items
  if (!isBuyNow && (!cart.value || cart.value.items.length === 0)) return;

  // For DIRECT_PURCHASE mode, check if required fields are present
  if (isBuyNow && (!buyNowProductId || !buyNowProductSlug || !buyNowQuantity)) {
    toast.error('Thông tin sản phẩm không hợp lệ');
    return;
  }

  const shippingAddress: ShippingAddress = {
    fullName: data.fullName,
    phone: data.phone,
    addressLine1: data.addressLine1,
    addressLine2: data.addressLine2 || null,
    city: data.city,
    district: data.district,
    ward: data.ward,
    postalCode: data.postalCode,
  };

  // Prepare order data
  const orderData: CreateOrderRequest = {
    shippingAddress,
    orderType: isBuyNow ? 'DIRECT_PURCHASE' : 'FROM_CART',
  };

  // Add Buy Now fields if applicable
  if (isBuyNow && buyNowProductId && buyNowProductSlug && buyNowQuantity) {
    orderData.productId = buyNowProductId;
    orderData.productSlug = buyNowProductSlug;
    orderData.quantity = parseInt(buyNowQuantity, 10);
    if (buyNowSize) {
      orderData.size = buyNowSize;
    }
  }

  createOrderMutation.mutate(orderData, {
    onSuccess: async (order) => {
      // Save orderId to localStorage for recovery
      pendingOrderStore.remember(order.id);

      // Create payment link (PayOS); redirect to the payment page either way
      try {
        await createPaymentLinkMutation.mutateAsync({ orderId: order.id });
        router.push(`/payments/${order.id}`);
      } catch (error) {
        // If payment link creation fails, still redirect to order page
        console.error('Failed to create payment link:', error);
        router.push(`/orders/${order.id}`);
      }
    },
  });
});

// Calculate totals (Buy Now subtotal is calculated on the backend)
const { shippingLabel, totalLabel } = cartTotals(cart);
</script>

<template>
  <div
    v-if="isLoadingCart && !isBuyNow"
    class="bg-wds-background text-wds-text flex min-h-screen items-center justify-center"
  >
    <div class="text-white">Đang tải...</div>
  </div>

  <div v-else-if="!isBuyNow && (cartError || !cart || cart.items.length === 0)" />

  <div v-else class="bg-wds-background text-wds-text min-h-screen">
    <div class="pt-24 pb-20">
      <div class="mx-auto max-w-7xl px-6">
        <h1 class="mb-8 text-3xl font-bold text-white">Thanh toán</h1>

        <form class="grid grid-cols-1 gap-8 lg:grid-cols-3" @submit="onSubmit">
          <!-- Shipping Address Form -->
          <div class="lg:col-span-2">
            <div class="mb-6 rounded-xl border border-white/10 bg-white/5 p-6">
              <h2 class="mb-6 text-xl font-bold text-white">Thông tin giao hàng</h2>
              <div class="space-y-4">
                <div>
                  <label for="fullName" class="mb-2 block text-sm font-semibold text-white/90">
                    Họ và tên *
                  </label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Nhập họ và tên"
                    v-model="fullName"
                    :disabled="isFormSubmitting"
                    class="focus:border-wds-accent w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none"
                  />
                  <p v-if="fullNameError" class="mt-1 text-sm text-red-400">
                    {{ fullNameError }}
                  </p>
                </div>
                <div>
                  <label for="phone" class="mb-2 block text-sm font-semibold text-white/90">
                    Số điện thoại *
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Nhập số điện thoại"
                    v-model="phone"
                    :disabled="isFormSubmitting"
                    class="focus:border-wds-accent w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none"
                  />
                  <p v-if="phoneError" class="mt-1 text-sm text-red-400">
                    {{ phoneError }}
                  </p>
                </div>
                <div>
                  <label for="addressLine1" class="mb-2 block text-sm font-semibold text-white/90">
                    Địa chỉ *
                  </label>
                  <Input
                    id="addressLine1"
                    type="text"
                    placeholder="Nhập địa chỉ"
                    v-model="addressLine1"
                    :disabled="isFormSubmitting"
                    class="focus:border-wds-accent w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none"
                  />
                  <p v-if="addressLine1Error" class="mt-1 text-sm text-red-400">
                    {{ addressLine1Error }}
                  </p>
                </div>
                <div>
                  <label for="ward" class="mb-2 block text-sm font-semibold text-white/90">
                    Phường/Xã *
                  </label>
                  <Input
                    id="ward"
                    type="text"
                    placeholder="Nhập phường/xã"
                    v-model="ward"
                    :disabled="isFormSubmitting"
                    class="focus:border-wds-accent w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none"
                  />
                  <p v-if="wardError" class="mt-1 text-sm text-red-400">
                    {{ wardError }}
                  </p>
                </div>
                <div>
                  <label for="district" class="mb-2 block text-sm font-semibold text-white/90">
                    Quận/Huyện *
                  </label>
                  <Input
                    id="district"
                    type="text"
                    placeholder="Nhập quận/huyện"
                    v-model="district"
                    :disabled="isFormSubmitting"
                    class="focus:border-wds-accent w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none"
                  />
                  <p v-if="districtError" class="mt-1 text-sm text-red-400">
                    {{ districtError }}
                  </p>
                </div>
                <div>
                  <label for="city" class="mb-2 block text-sm font-semibold text-white/90">
                    Tỉnh/Thành phố *
                  </label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="Nhập tỉnh/thành phố"
                    v-model="city"
                    :disabled="isFormSubmitting"
                    class="focus:border-wds-accent w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none"
                  />
                  <p v-if="cityError" class="mt-1 text-sm text-red-400">
                    {{ cityError }}
                  </p>
                </div>
                <div>
                  <label for="postalCode" class="mb-2 block text-sm font-semibold text-white/90">
                    Mã bưu điện *
                  </label>
                  <Input
                    id="postalCode"
                    type="text"
                    placeholder="Nhập mã bưu điện"
                    v-model="postalCode"
                    :disabled="isFormSubmitting"
                    class="focus:border-wds-accent w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none"
                  />
                  <p v-if="postalCodeError" class="mt-1 text-sm text-red-400">
                    {{ postalCodeError }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="lg:col-span-1">
            <div class="sticky top-24 rounded-xl border border-white/10 bg-white/5 p-6">
              <h2 class="mb-4 text-xl font-bold text-white">Tóm tắt đơn hàng</h2>
              <div class="mb-6 space-y-3">
                <div v-if="isBuyNow" class="flex justify-between text-sm text-white/80">
                  <span>
                    Mua trực tiếp{{ buyNowSize ? ` (${buyNowSize})` : '' }} x
                    {{ buyNowQuantity || 1 }}
                  </span>
                  <span>Đang tính...</span>
                </div>
                <template v-else>
                  <div
                    v-for="item in cart?.items"
                    :key="item.id"
                    class="flex justify-between text-sm text-white/80"
                  >
                    <span>
                      {{ item.productName }}{{ item.size ? ` (${item.size})` : '' }} x
                      {{ item.quantity }}
                    </span>
                    <span>{{ formatPrice(item.subtotal) }}₫</span>
                  </div>
                </template>
                <div class="flex justify-between border-t border-white/10 pt-3 text-white/80">
                  <span>Tạm tính:</span>
                  <span
                    >{{ isBuyNow ? 'Đang tính...' : formatPrice(cart?.totalAmount || 0) }}₫</span
                  >
                </div>
                <div class="flex justify-between text-white/80">
                  <span>Phí vận chuyển:</span>
                  <span>{{ shippingLabel }}</span>
                </div>
                <div
                  class="flex justify-between border-t border-white/10 pt-3 text-lg font-bold text-white"
                >
                  <span>Tổng cộng:</span>
                  <span>{{ totalLabel }}</span>
                </div>
              </div>
              <Button
                type="submit"
                :disabled="isFormSubmitting"
                class="bg-wds-accent hover:bg-wds-accent/90 h-12 w-full font-semibold text-black"
              >
                {{ isFormSubmitting ? 'Đang xử lý...' : 'Đặt hàng' }}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
