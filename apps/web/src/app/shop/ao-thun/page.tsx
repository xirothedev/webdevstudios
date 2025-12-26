'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { ProductActions } from '@/components/shop/ProductActions';
import { ProductAdditionalInfo } from '@/components/shop/ProductAdditionalInfo';
import { ProductFeatures } from '@/components/shop/ProductFeatures';
import { ProductImageGallery } from '@/components/shop/ProductImageGallery';
import { ProductInfo } from '@/components/shop/ProductInfo';
import { ProductQuantitySelector } from '@/components/shop/ProductQuantitySelector';
import { ProductReviews } from '@/components/shop/ProductReviews';
import { ProductSizeSelector } from '@/components/shop/ProductSizeSelector';
import { ReviewForm } from '@/components/shop/ReviewForm';
import { useAddToCart } from '@/lib/api/hooks/use-cart';
import { useProduct, useProductStock } from '@/lib/api/hooks/use-products';
import { ProductSize, ProductSizeStock } from '@/lib/api/products';

export default function AoThunPage() {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<ProductSize>('M');
  const [quantity, setQuantity] = useState(1);

  // Fetch product data
  const {
    data: product,
    isLoading: isLoadingProduct,
    error: productError,
  } = useProduct('AO_THUN');

  // Fetch stock info (only if product has sizes)
  const { data: stockInfo, isLoading: isLoadingStock } = useProductStock(
    'AO_THUN',
    product?.hasSizes ? selectedSize : undefined,
    !!product?.hasSizes
  );

  // Cart mutation
  const addToCartMutation = useAddToCart();

  const isLoading = isLoadingProduct || isLoadingStock;

  const handleAddToCart = () => {
    if (!product) return;

    addToCartMutation.mutate({
      productId: product.id,
      size: product.hasSizes ? selectedSize : undefined,
      quantity,
    });
  };

  const handleBuyNow = () => {
    if (!product) return;

    addToCartMutation.mutate(
      {
        productId: product.id,
        size: product.hasSizes ? selectedSize : undefined,
        quantity,
      },
      {
        onSuccess: () => {
          router.push('/checkout');
        },
      }
    );
  };

  const getMaxQuantity = () => {
    if (product?.hasSizes && stockInfo?.sizeStocks) {
      const sizeStock = stockInfo.sizeStocks.find(
        (ss) => ss.size === selectedSize
      );
      return sizeStock?.stock || 0;
    }
    return stockInfo?.stock || product?.stock || 0;
  };

  const increaseQuantity = () => {
    const max = getMaxQuantity();
    setQuantity((prev) => Math.min(prev + 1, max));
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  if (isLoading) {
    return (
      <div className="bg-wds-background text-wds-text flex min-h-screen items-center justify-center">
        <div className="text-white">Đang tải...</div>
      </div>
    );
  }

  if (productError || !product) {
    const errorMessage =
      productError instanceof Error
        ? productError.message
        : 'Không tìm thấy sản phẩm';
    return (
      <div className="bg-wds-background text-wds-text flex min-h-screen items-center justify-center">
        <div className="text-white">{errorMessage}</div>
      </div>
    );
  }

  const availableSizes = product.sizeStocks?.map((ss) => ss.size) || [
    'S',
    'M',
    'L',
    'XL',
  ];
  const currentStock = getMaxQuantity();
  const isOutOfStock = currentStock === 0;

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
            <a href="/shop" className="hover:text-wds-accent transition-colors">
              Shop
            </a>
            <span>/</span>
            <span className="text-white/90">Áo thun</span>
          </nav>

          {/* Product Section */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Product Image */}
            <ProductImageGallery
              images={[]}
              badge={product.badge || undefined}
            />

            {/* Right: Product Info */}
            <div className="flex flex-col justify-center">
              <ProductInfo
                name={product.name}
                rating={{
                  value: product.ratingValue,
                  count: product.ratingCount,
                }}
                price={{
                  current: product.priceCurrent,
                  original: product.priceOriginal || undefined,
                  discount: product.priceDiscount || undefined,
                }}
                description={product.description}
                priceNote="Giá đã bao gồm VAT. Miễn phí vận chuyển cho đơn hàng trên 500.000₫"
              />

              {/* Size Selector */}
              {product.hasSizes && availableSizes.length > 0 && (
                <ProductSizeSelector
                  sizes={availableSizes}
                  selectedSize={selectedSize}
                  onSizeChange={setSelectedSize}
                  stockBySize={
                    product.sizeStocks?.reduce(
                      (
                        acc: Partial<Record<ProductSize, number>>,
                        ss: ProductSizeStock
                      ) => {
                        acc[ss.size] = ss.stock;
                        return acc;
                      },
                      {}
                    ) as Record<ProductSize, number> | undefined
                  }
                />
              )}

              {/* Quantity Selector */}
              <ProductQuantitySelector
                quantity={quantity}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
                stock={currentStock}
                max={currentStock}
              />

              {/* Add to Cart Button */}
              <ProductActions
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                isAddingToCart={addToCartMutation.isPending}
                disabled={isOutOfStock}
              />

              {/* Product Features */}
              <ProductFeatures features={[]} />
            </div>
          </div>

          {/* Additional Info Section */}
          <ProductAdditionalInfo info={{}} />

          {/* Reviews Section */}
          <div className="mt-16">
            <ProductReviews productSlug="AO_THUN" />
            <div className="mt-8">
              <ReviewForm productSlug="AO_THUN" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
