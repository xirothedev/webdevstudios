'use client';

import { ShoppingCart, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  useCart,
  useRemoveFromCart,
  useUpdateCartItem,
} from '@/lib/api/hooks/use-cart';
import { formatPrice } from '@/lib/utils';

import { QuantitySelector } from './QuantitySelector';

export function FloatingCartButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: cart, isLoading } = useCart();
  const updateCartItemMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();

  const totalItems = cart?.totalItems ?? 0;
  const hasItems = totalItems > 0 && !isLoading;

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

  const isItemUpdating = (itemId: string) => {
    return (
      (updateCartItemMutation.isPending &&
        updateCartItemMutation.variables?.cartItemId === itemId) ||
      (removeFromCartMutation.isPending &&
        removeFromCartMutation.variables === itemId)
    );
  };

  // Close drawer when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest('[data-cart-drawer]') &&
        !target.closest('[data-cart-button]')
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        data-cart-button
        onClick={() => setIsOpen(true)}
        className="bg-wds-accent fixed right-6 bottom-6 z-40 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full text-black shadow-lg transition-shadow hover:shadow-xl"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Mở giỏ hàng"
      >
        <ShoppingCart className="h-6 w-6" />
        {hasItems && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
          >
            {totalItems > 9 ? '9+' : totalItems}
          </motion.span>
        )}
      </motion.button>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/50"
            />

            {/* Drawer */}
            <motion.div
              data-cart-drawer
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-wds-background fixed top-0 right-0 z-50 h-full w-full max-w-md shadow-2xl"
            >
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                  <h2 className="text-xl font-bold text-white">Giỏ hàng</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white/70 transition-colors hover:text-white"
                    aria-label="Đóng giỏ hàng"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {!hasItems ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <ShoppingCart className="mb-6 h-24 w-24 text-white/20" />
                      <h3 className="mb-2 text-lg font-semibold text-white">
                        Giỏ hàng trống
                      </h3>
                      <p className="mb-8 text-center text-sm text-white/60">
                        Hãy thêm sản phẩm vào giỏ hàng để tiếp tục
                      </p>
                      <Button
                        onClick={() => setIsOpen(false)}
                        className="bg-wds-accent hover:bg-wds-accent/90 text-black"
                      >
                        Tiếp tục mua sắm
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart?.items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
                        >
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-1 flex-col gap-2">
                            <h3 className="line-clamp-2 text-sm font-semibold text-white">
                              {item.productName}
                            </h3>
                            {item.size && (
                              <p className="text-xs text-white/60">
                                Size: {item.size}
                              </p>
                            )}
                            <p className="text-wds-accent text-sm font-bold">
                              {formatPrice(item.productPrice)}₫
                            </p>

                            <div className="flex items-center gap-2">
                              <QuantitySelector
                                quantity={item.quantity}
                                onIncrease={() =>
                                  handleUpdateQuantity(
                                    item.id,
                                    item.quantity + 1
                                  )
                                }
                                onDecrease={() =>
                                  handleUpdateQuantity(
                                    item.id,
                                    item.quantity - 1
                                  )
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
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-white">
                              {formatPrice(item.subtotal)}₫
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {hasItems && (
                  <div className="border-t border-white/10 px-6 py-4">
                    <div className="mb-4 space-y-2">
                      <div className="flex justify-between text-white/80">
                        <span>Tạm tính:</span>
                        <span className="font-semibold">
                          {formatPrice(cart?.totalAmount ?? 0)}₫
                        </span>
                      </div>
                      <div className="flex justify-between text-white/80">
                        <span>Phí vận chuyển:</span>
                        <span className="font-semibold">
                          {(cart?.totalAmount ?? 0) >= 500000
                            ? 'Miễn phí'
                            : formatPrice(30000) + '₫'}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-white/10 pt-2 text-lg font-bold text-white">
                        <span>Tổng cộng:</span>
                        <span>
                          {formatPrice(
                            (cart?.totalAmount ?? 0) +
                              ((cart?.totalAmount ?? 0) >= 500000 ? 0 : 30000)
                          )}
                          ₫
                        </span>
                      </div>
                    </div>
                    <Link href="/cart" onClick={() => setIsOpen(false)}>
                      <Button className="bg-wds-accent hover:bg-wds-accent/90 h-12 w-full font-semibold text-black">
                        Xem giỏ hàng
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
