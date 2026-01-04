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

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { ProductActions } from '@/components/shop/ProductActions';
import { ProductAdditionalInfo } from '@/components/shop/ProductAdditionalInfo';
import { ProductFeatures } from '@/components/shop/ProductFeatures';
import { ProductImageGallery } from '@/components/shop/ProductImageGallery';
import { ProductInfo } from '@/components/shop/ProductInfo';
import { ProductQuantitySelector } from '@/components/shop/ProductQuantitySelector';
import { ProductReviews } from '@/components/shop/ProductReviews';
import { ProductSizeGuide } from '@/components/shop/ProductSizeGuide';
import { ProductSizeSelector } from '@/components/shop/ProductSizeSelector';
import { ReviewForm } from '@/components/shop/ReviewForm';
import { useAuth } from '@/hooks/use-auth';
import { useAddToCart } from '@/lib/api/hooks/use-cart';
import { useSuspenseProduct } from '@/lib/api/hooks/use-products';
import { getBackendSlug } from '@/lib/product-slug-mapping';
import { getProductStaticContent } from '@/lib/product-static-content';
import { ProductSize } from '@/types/product';

interface ProductPageContentProps {
  productSlug: 'ao-thun' | 'pad-chuot' | 'day-deo' | 'moc-khoa';
  productName: string;
}

function ProductContentInner({
  productSlug,
  productName,
}: ProductPageContentProps) {
  const [selectedSize, setSelectedSize] = useState<ProductSize>('M');
  const [quantity, setQuantity] = useState(1);

  const router = useRouter();
  const BACKEND_SLUG = getBackendSlug(productSlug);
  const { user, isAuthenticated } = useAuth();

  // Fetch product data using Suspense Query
  const { data: product } = useSuspenseProduct(BACKEND_SLUG);

  // Get static content (images, features, additionalInfo)
  const staticContent = getProductStaticContent(BACKEND_SLUG);

  // Add to cart mutation
  const addToCartMutation = useAddToCart();

  const handleAddToCart = async () => {
    if (!product) return;

    // For products with sizes (ao-thun)
    if (product.hasSizes) {
      // Validation: ensure size is selected
      if (!selectedSize) {
        toast.error('Vui lòng chọn size');
        return;
      }

      // Calculate stock for selected size
      const stockBySize = product.sizeStocks?.reduce(
        (acc, ss) => {
          acc[ss.size] = ss.stock;
          return acc;
        },
        {} as Record<ProductSize, number>
      );
      const selectedSizeStock =
        stockBySize?.[selectedSize] ?? product.stock ?? 0;

      // Validation: quantity must be valid
      if (quantity <= 0 || quantity > selectedSizeStock) {
        toast.error('Số lượng không hợp lệ');
        return;
      }

      addToCartMutation.mutate({
        productId: product.id,
        size: selectedSize,
        quantity,
      });
    } else {
      // For products without sizes
      // Validation: quantity must be valid
      if (quantity <= 0 || quantity > product.stock) {
        toast.error('Số lượng không hợp lệ');
        return;
      }

      addToCartMutation.mutate({
        productId: product.id,
        quantity,
      });
    }
  };

  const handleBuyNow = async () => {
    if (!product || !isAuthenticated) {
      toast.error('Vui lòng đăng nhập để mua hàng');
      router.push('/auth/login');
      return;
    }

    // Check stock
    const availableStock = product.hasSizes
      ? product.sizeStocks?.find((ss) => ss.size === selectedSize)?.stock || 0
      : product.stock || 0;

    if (quantity > availableStock) {
      toast.error(
        `Số lượng vượt quá tồn kho. Tồn kho hiện tại: ${availableStock}`
      );
      return;
    }

    // For Buy Now, we need shipping address
    // For now, redirect to a checkout page with pre-filled product
    // Or we can show a modal to collect shipping address
    // For simplicity, redirect to checkout with product info in query params
    router.push(
      `/checkout?buyNow=true&productId=${product.id}&productSlug=${BACKEND_SLUG}&size=${selectedSize}&quantity=${quantity}`
    );
  };

  // Calculate stock for selected size (before early returns to maintain hook order)
  const stockBySize = product?.sizeStocks?.reduce(
    (acc, ss) => {
      acc[ss.size] = ss.stock;
      return acc;
    },
    {} as Record<ProductSize, number>
  );
  const selectedSizeStock = stockBySize?.[selectedSize] ?? product?.stock ?? 0;

  // Reset quantity when size changes if current quantity exceeds new stock
  useEffect(() => {
    if (product && product.hasSizes && quantity > selectedSizeStock) {
      setQuantity(selectedSizeStock > 0 ? selectedSizeStock : 1);
    }
  }, [selectedSize, selectedSizeStock, quantity, product]);

  const increaseQuantity = () => {
    if (product?.hasSizes) {
      setQuantity((prev) => Math.min(prev + 1, selectedSizeStock ?? 10));
    } else {
      setQuantity((prev) => Math.min(prev + 1, product?.stock ?? 10));
    }
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

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

  const sizes = product.sizeStocks?.map((ss) => ss.size) || [];

  return (
    <>
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-white/60">
        <Link href="/shop" className="hover:text-wds-accent transition-colors">
          Shop
        </Link>
        <span>/</span>
        <span className="text-white/90">{productName}</span>
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

          {/* Size Selector */}
          {product.hasSizes && sizes.length > 0 && (
            <ProductSizeSelector
              sizes={sizes}
              selectedSize={selectedSize}
              onSizeChange={setSelectedSize}
              stockBySize={stockBySize}
            />
          )}

          {/* Quantity Selector */}
          <ProductQuantitySelector
            quantity={quantity}
            onIncrease={increaseQuantity}
            onDecrease={decreaseQuantity}
            stock={product.hasSizes ? selectedSizeStock : product.stock}
            max={
              product.hasSizes ? (selectedSizeStock ?? 0) : (product.stock ?? 0)
            }
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

      {/* Size Guide Section - Only for products with sizes */}
      {product.hasSizes && <ProductSizeGuide />}

      {/* Reviews Section */}
      <section className="mt-16">
        <h2 className="mb-8 text-3xl font-bold text-white">
          Đánh giá sản phẩm
        </h2>

        {/* Review Form - Only for authenticated users */}
        {isAuthenticated ? (
          <div className="mb-8">
            <ReviewForm productSlug={BACKEND_SLUG} currentUserId={user?.id} />
          </div>
        ) : (
          <div className="mb-8 rounded-xl border border-white/10 bg-white/5 p-6">
            <p className="text-white/60">
              Đăng nhập để viết đánh giá về sản phẩm này.
            </p>
          </div>
        )}

        {/* Reviews List */}
        <ProductReviews
          productSlug={BACKEND_SLUG}
          currentUserId={user?.id}
          currentUserRole={user?.role}
        />
      </section>
    </>
  );
}

function ProductLoading() {
  return (
    <div className="flex flex-col gap-12">
      {/* Breadcrumb Skeleton */}
      <div className="h-5 w-48 animate-pulse rounded bg-white/10" />

      {/* Product Section Skeleton */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Image Skeleton */}
        <div className="space-y-4">
          <div className="aspect-square w-full animate-pulse rounded-xl bg-white/10" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-lg bg-white/10"
              />
            ))}
          </div>
        </div>

        {/* Info Skeleton */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="h-8 w-3/4 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-white/10" />
          <div className="h-6 w-1/3 animate-pulse rounded bg-white/10" />
          <div className="h-20 w-full animate-pulse rounded bg-white/10" />
          <div className="h-12 w-32 animate-pulse rounded bg-white/10" />
          <div className="h-12 w-full animate-pulse rounded bg-white/10" />
          <div className="h-12 w-full animate-pulse rounded bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export function ProductPageContent({
  productSlug,
  productName,
}: ProductPageContentProps) {
  return (
    <Suspense fallback={<ProductLoading />}>
      <ProductContentInner
        productSlug={productSlug}
        productName={productName}
      />
    </Suspense>
  );
}
