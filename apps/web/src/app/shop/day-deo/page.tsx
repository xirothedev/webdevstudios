'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { ProductActions } from '@/components/shop/ProductActions';
import { ProductAdditionalInfo } from '@/components/shop/ProductAdditionalInfo';
import { ProductFeatures } from '@/components/shop/ProductFeatures';
import { ProductImageGallery } from '@/components/shop/ProductImageGallery';
import { ProductInfo } from '@/components/shop/ProductInfo';
import { ProductQuantitySelector } from '@/components/shop/ProductQuantitySelector';
import { useAddToCart } from '@/lib/api/hooks/use-cart';
import { useProduct } from '@/lib/api/hooks/use-products';
import { getBackendSlug } from '@/lib/product-slug-mapping';
import { getProductStaticContent } from '@/lib/product-static-content';

const BACKEND_SLUG = getBackendSlug('day-deo');

export default function DayDeoPage() {
  const [quantity, setQuantity] = useState(1);

  // Fetch product data from API
  const { data: product, isLoading, error } = useProduct(BACKEND_SLUG);

  // Get static content (images, features, additionalInfo)
  const staticContent = getProductStaticContent(BACKEND_SLUG);

  // Add to cart mutation
  const addToCartMutation = useAddToCart();

  const handleAddToCart = async () => {
    if (!product) return;

    // Validation: quantity must be valid
    if (quantity <= 0 || quantity > product.stock) {
      toast.error('Số lượng không hợp lệ');
      return;
    }

    addToCartMutation.mutate({
      productId: product.id,
      quantity,
    });
  };

  const handleBuyNow = () => {
    // TODO: Buy now logic
    console.log('Buy now:', { quantity });
  };

  const increaseQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, 10));
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-wds-background text-wds-text flex min-h-screen items-center justify-center">
        <div className="text-white">Đang tải...</div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="bg-wds-background text-wds-text flex min-h-screen items-center justify-center">
        <div className="text-white">
          {error instanceof Error ? error.message : 'Không tìm thấy sản phẩm'}
        </div>
      </div>
    );
  }

  // Map backend ProductDto to component props
  const price = {
    current: product.priceCurrent,
    original: product.priceOriginal ?? undefined,
    discount: product.priceDiscount ?? undefined,
  };

  const rating = {
    value: product.ratingValue,
    count: product.ratingCount,
  };

  return (
    <div className="bg-wds-background text-wds-text selection:bg-wds-accent/30 selection:text-wds-text min-h-screen">
      <Navbar />

      {/* Background ambient glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="bg-wds-accent/20 absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] rounded-full bg-purple-500/20 blur-[120px]" />
      </div>

      <main className="relative z-10 pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-6">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-white/60">
            <Link
              href="/shop"
              className="hover:text-wds-accent transition-colors"
            >
              Shop
            </Link>
            <span>/</span>
            <span className="text-white/90">Dây đeo</span>
          </nav>

          {/* Product Section */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Product Image */}
            <ProductImageGallery
              images={staticContent.images}
              badge={product.badge || undefined}
            />

            {/* Right: Product Info */}
            <div className="flex flex-col justify-center">
              <ProductInfo
                name={product.name}
                rating={rating}
                price={price}
                description={product.description}
                priceNote="Giá đã bao gồm VAT. Miễn phí vận chuyển cho đơn hàng trên 500.000₫"
              />

              {/* Quantity Selector - No size selector for lanyard */}
              <ProductQuantitySelector
                quantity={quantity}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
                stock={product.stock}
              />

              {/* Add to Cart Button */}
              <ProductActions
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                isAddingToCart={addToCartMutation.isPending}
              />

              {/* Product Features */}
              <ProductFeatures features={staticContent.features} />
            </div>
          </div>

          {/* Additional Info Section */}
          <ProductAdditionalInfo info={staticContent.additionalInfo} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
