'use client';

import { ShoppingCart, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';

import { QuantitySelector } from '@/components/shop/QuantitySelector';
import { Button } from '@/components/ui/button';
import {
  useRemoveFromCart,
  useSuspenseCart,
  useUpdateCartItem,
} from '@/lib/api/hooks/use-cart';
import { formatPrice } from '@/lib/utils';

function CartContentInner() {
  const router = useRouter();

  // Fetch cart using Suspense Query
  const { data: cart, error: cartError } = useSuspenseCart();

  // Mutations
  const updateCartItemMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    updateCartItemMutation.mutate({
      cartItemId: itemId,
      data: { quantity },
    });
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCartMutation.mutate(itemId);
  };

  // Check if specific item is being updated
  const isItemUpdating = (itemId: string) => {
    return (
      (updateCartItemMutation.isPending &&
        updateCartItemMutation.variables?.cartItemId === itemId) ||
      (removeFromCartMutation.isPending &&
        removeFromCartMutation.variables === itemId)
    );
  };

  if (cartError || !cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ShoppingCart className="mb-6 h-24 w-24 text-white/20" />
        <h2 className="mb-2 text-2xl font-bold text-white">Giỏ hàng trống</h2>
        <p className="mb-8 text-white/60">
          Hãy thêm sản phẩm vào giỏ hàng để tiếp tục
        </p>
        <Button
          onClick={() => router.push('/shop')}
          className="bg-wds-accent hover:bg-wds-accent/90 text-black"
        >
          Tiếp tục mua sắm
        </Button>
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-8 text-3xl font-bold text-white">Giỏ hàng</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="space-y-4 lg:col-span-2">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-6"
            >
              <img
                src={item.productImage}
                alt={item.productName}
                className="h-24 w-24 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="mb-1 font-semibold text-white">
                  {item.productName}
                </h3>
                {item.size && (
                  <p className="mb-2 text-sm text-white/60">
                    Size: {item.size}
                  </p>
                )}
                <p className="text-wds-accent mb-4 font-bold">
                  {formatPrice(item.productPrice)}₫
                </p>

                <div className="flex items-center gap-4">
                  <QuantitySelector
                    quantity={item.quantity}
                    onIncrease={() =>
                      handleUpdateQuantity(item.id, item.quantity + 1)
                    }
                    onDecrease={() =>
                      handleUpdateQuantity(item.id, item.quantity - 1)
                    }
                    max={item.stockAvailable}
                    disabled={isItemUpdating(item.id)}
                    variant="compact"
                    showIcons={false}
                    size="sm"
                  />

                  <Button
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={isItemUpdating(item.id)}
                    variant="ghost"
                    size="icon"
                    className="h-auto w-auto text-red-400 hover:bg-transparent hover:text-red-300 disabled:opacity-30"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white">
                  {formatPrice(item.subtotal)}₫
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">
              Tóm tắt đơn hàng
            </h2>
            <div className="mb-6 space-y-3">
              <div className="flex justify-between text-white/80">
                <span>Tạm tính:</span>
                <span>{formatPrice(cart.totalAmount)}₫</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Phí vận chuyển:</span>
                <span>
                  {cart.totalAmount >= 500000
                    ? 'Miễn phí'
                    : formatPrice(30000) + '₫'}
                </span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-bold text-white">
                <span>Tổng cộng:</span>
                <span>
                  {formatPrice(
                    cart.totalAmount + (cart.totalAmount >= 500000 ? 0 : 30000)
                  )}
                  ₫
                </span>
              </div>
            </div>
            <Button
              onClick={() => router.push('/checkout')}
              className="bg-wds-accent hover:bg-wds-accent/90 h-12 w-full font-semibold text-black"
            >
              Thanh toán
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function CartLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="h-9 w-48 animate-pulse rounded bg-white/10" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cart Items Skeleton */}
        <div className="space-y-4 lg:col-span-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-6"
            >
              <div className="h-24 w-24 animate-pulse rounded-lg bg-white/10" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-3/4 animate-pulse rounded bg-white/10" />
                <div className="h-4 w-1/4 animate-pulse rounded bg-white/10" />
                <div className="h-6 w-1/3 animate-pulse rounded bg-white/10" />
                <div className="h-8 w-32 animate-pulse rounded bg-white/10" />
              </div>
            </div>
          ))}
        </div>
        {/* Order Summary Skeleton */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 h-6 w-32 animate-pulse rounded bg-white/10" />
            <div className="mb-6 space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-white/10" />
              <div className="h-4 w-full animate-pulse rounded bg-white/10" />
              <div className="h-6 w-full animate-pulse rounded bg-white/10" />
            </div>
            <div className="h-12 w-full animate-pulse rounded bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CartContent() {
  return (
    <Suspense fallback={<CartLoading />}>
      <CartContentInner />
    </Suspense>
  );
}
