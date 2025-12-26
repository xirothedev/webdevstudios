'use client';

import { ShoppingCart, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import {
  useCart,
  useRemoveFromCart,
  useUpdateCartItem,
} from '@/lib/api/hooks/use-cart';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const router = useRouter();

  // Fetch cart using TanStack Query
  const { data: cart, isLoading, error: cartError } = useCart();

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

  if (isLoading) {
    return (
      <div className="bg-wds-background text-wds-text flex min-h-screen items-center justify-center">
        <div className="text-white">Đang tải...</div>
      </div>
    );
  }

  if (cartError || !cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="bg-wds-background text-wds-text min-h-screen">
        <Navbar />
        <main className="pt-24 pb-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col items-center justify-center py-20">
              <ShoppingCart className="mb-6 h-24 w-24 text-white/20" />
              <h2 className="mb-2 text-2xl font-bold text-white">
                Giỏ hàng trống
              </h2>
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
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-wds-background text-wds-text min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-6">
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
                      <div className="flex items-center gap-2 rounded-lg border border-white/10">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={
                            item.quantity <= 1 || isItemUpdating(item.id)
                          }
                          className="px-3 py-1 text-white/70 hover:text-white disabled:opacity-30"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={
                            item.quantity >= item.stockAvailable ||
                            isItemUpdating(item.id)
                          }
                          className="px-3 py-1 text-white/70 hover:text-white disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isItemUpdating(item.id)}
                        className="text-red-400 hover:text-red-300 disabled:opacity-30"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
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
                        cart.totalAmount +
                          (cart.totalAmount >= 500000 ? 0 : 30000)
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
