'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { PageLoading } from '@/components/common/PageLoading';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/lib/api/hooks/use-cart';
import { useCreateOrder, useOrders } from '@/lib/api/hooks/use-orders';
import { useCreatePaymentLink } from '@/lib/api/hooks/use-payments';
import { CreateOrderRequest, ShippingAddress } from '@/lib/api/orders';
import { formatPrice } from '@/lib/utils';
import { ProductSize } from '@/types/product';

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

type ShippingAddressFormData = z.infer<typeof shippingAddressSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get('buyNow') === 'true';
  const buyNowProductId = searchParams.get('productId');
  const buyNowProductSlug = searchParams.get('productSlug');
  const buyNowSize = searchParams.get('size') as ProductSize | undefined;
  const buyNowQuantity = searchParams.get('quantity');

  // Fetch cart using TanStack Query (only if not Buy Now)
  const cartQuery = useCart();
  const {
    data: cart,
    isLoading: isLoadingCart,
    error: cartError,
  } = isBuyNow ? { data: null, isLoading: false, error: null } : cartQuery;

  // Check for pending orders
  const { data: ordersData } = useOrders(1, 1);
  const pendingOrder = ordersData?.orders.find(
    (order) => order.status === 'PENDING' && order.paymentStatus === 'PENDING'
  );

  // Create order mutation
  const createOrderMutation = useCreateOrder();
  const createPaymentLinkMutation = useCreatePaymentLink();

  // Form setup với react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShippingAddressFormData>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
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

  // Redirect to cart if cart is empty or error (only for FROM_CART mode)
  useEffect(() => {
    if (!isBuyNow && (cartError || (cart && cart.items.length === 0))) {
      router.push('/cart');
    }
  }, [cart, cartError, router, isBuyNow]);

  // Redirect to payment page if there's a pending order
  useEffect(() => {
    if (pendingOrder) {
      // Save orderId to localStorage for recovery
      localStorage.setItem('pendingOrderId', pendingOrder.id);
      router.push(`/payments/${pendingOrder.id}`);
    }
  }, [pendingOrder, router]);

  const isFormSubmitting = isSubmitting || createOrderMutation.isPending;

  const onSubmit = (data: ShippingAddressFormData) => {
    // For FROM_CART mode, check if cart exists and has items
    if (!isBuyNow && (!cart || cart.items.length === 0)) return;

    // For DIRECT_PURCHASE mode, check if required fields are present
    if (
      isBuyNow &&
      (!buyNowProductId || !buyNowProductSlug || !buyNowQuantity)
    ) {
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
        localStorage.setItem('pendingOrderId', order.id);

        // Create payment link
        try {
          await createPaymentLinkMutation.mutateAsync({
            orderId: order.id,
          });

          // Redirect to payment page
          router.push(`/payments/${order.id}`);
        } catch (error) {
          // If payment link creation fails, still redirect to order page
          console.error('Failed to create payment link:', error);
          router.push(`/orders/${order.id}`);
        }
      },
    });
  };

  if (isLoadingCart && !isBuyNow) {
    return <PageLoading variant="dark" message="Đang tải giỏ hàng..." />;
  }

  if (!isBuyNow && (cartError || !cart || cart.items.length === 0)) {
    return null; // useEffect will redirect
  }

  // Calculate totals
  let subtotal = 0;
  if (isBuyNow && buyNowQuantity) {
    // For Buy Now, we need to fetch product price
    // For now, show a placeholder - in production, fetch product details
    subtotal = 0; // Will be calculated on backend
  } else if (cart) {
    subtotal = cart.totalAmount;
  }

  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shippingFee;

  return (
    <div className="bg-wds-background text-wds-text min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="mb-8 text-3xl font-bold text-white">Thanh toán</h1>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-8 lg:grid-cols-3"
          >
            {/* Shipping Address Form */}
            <div className="lg:col-span-2">
              <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-6">
                <h2 className="mb-6 text-xl font-bold text-white">
                  Thông tin giao hàng
                </h2>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="mb-2 block text-sm font-semibold text-white/90"
                    >
                      Họ và tên *
                    </label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Nhập họ và tên"
                      {...register('fullName')}
                      disabled={isFormSubmitting}
                      className="focus:border-wds-accent w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none"
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-semibold text-white/90"
                    >
                      Số điện thoại *
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Nhập số điện thoại"
                      {...register('phone')}
                      disabled={isFormSubmitting}
                      className="focus:border-wds-accent w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="addressLine1"
                      className="mb-2 block text-sm font-semibold text-white/90"
                    >
                      Địa chỉ *
                    </label>
                    <Input
                      id="addressLine1"
                      type="text"
                      placeholder="Nhập địa chỉ"
                      {...register('addressLine1')}
                      disabled={isFormSubmitting}
                      className="focus:border-wds-accent w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none"
                    />
                    {errors.addressLine1 && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.addressLine1.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="ward"
                      className="mb-2 block text-sm font-semibold text-white/90"
                    >
                      Phường/Xã *
                    </label>
                    <Input
                      id="ward"
                      type="text"
                      placeholder="Nhập phường/xã"
                      {...register('ward')}
                      disabled={isFormSubmitting}
                      className="focus:border-wds-accent w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none"
                    />
                    {errors.ward && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.ward.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="district"
                      className="mb-2 block text-sm font-semibold text-white/90"
                    >
                      Quận/Huyện *
                    </label>
                    <Input
                      id="district"
                      type="text"
                      placeholder="Nhập quận/huyện"
                      {...register('district')}
                      disabled={isFormSubmitting}
                      className="focus:border-wds-accent w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none"
                    />
                    {errors.district && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.district.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="city"
                      className="mb-2 block text-sm font-semibold text-white/90"
                    >
                      Tỉnh/Thành phố *
                    </label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="Nhập tỉnh/thành phố"
                      {...register('city')}
                      disabled={isFormSubmitting}
                      className="focus:border-wds-accent w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="postalCode"
                      className="mb-2 block text-sm font-semibold text-white/90"
                    >
                      Mã bưu điện *
                    </label>
                    <Input
                      id="postalCode"
                      type="text"
                      placeholder="Nhập mã bưu điện"
                      {...register('postalCode')}
                      disabled={isFormSubmitting}
                      className="focus:border-wds-accent w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none"
                    />
                    {errors.postalCode && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.postalCode.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-xl border border-white/10 bg-white/5 p-6">
                <h2 className="mb-4 text-xl font-bold text-white">
                  Tóm tắt đơn hàng
                </h2>
                <div className="mb-6 space-y-3">
                  {isBuyNow ? (
                    <div className="flex justify-between text-sm text-white/80">
                      <span>
                        Mua trực tiếp
                        {buyNowSize && ` (${buyNowSize})`} x{' '}
                        {buyNowQuantity || 1}
                      </span>
                      <span>Đang tính...</span>
                    </div>
                  ) : (
                    cart?.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm text-white/80"
                      >
                        <span>
                          {item.productName}
                          {item.size && ` (${item.size})`} x {item.quantity}
                        </span>
                        <span>{formatPrice(item.subtotal)}₫</span>
                      </div>
                    ))
                  )}
                  <div className="flex justify-between border-t border-white/10 pt-3 text-white/80">
                    <span>Tạm tính:</span>
                    <span>
                      {isBuyNow
                        ? 'Đang tính...'
                        : formatPrice(cart?.totalAmount || 0)}
                      ₫
                    </span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Phí vận chuyển:</span>
                    <span>
                      {shippingFee === 0
                        ? 'Miễn phí'
                        : formatPrice(shippingFee) + '₫'}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-bold text-white">
                    <span>Tổng cộng:</span>
                    <span>{formatPrice(total)}₫</span>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isFormSubmitting}
                  className="bg-wds-accent hover:bg-wds-accent/90 h-12 w-full font-semibold text-black"
                >
                  {isFormSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
