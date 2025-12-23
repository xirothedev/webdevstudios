'use client';

import { useState } from 'react';

import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { ProductActions } from '@/components/shop/ProductActions';
import { ProductAdditionalInfo } from '@/components/shop/ProductAdditionalInfo';
import { ProductFeatures } from '@/components/shop/ProductFeatures';
import { ProductImageGallery } from '@/components/shop/ProductImageGallery';
import { ProductInfo } from '@/components/shop/ProductInfo';
import { ProductQuantitySelector } from '@/components/shop/ProductQuantitySelector';
import { padChuotProduct } from '@/data/products/pad-chuot';

export default function PadChuotPage() {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsAddingToCart(false);
    // TODO: Add to cart logic
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
            <span className="text-white/90">Pad chuột</span>
          </nav>

          {/* Product Section */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Product Image */}
            <ProductImageGallery
              images={padChuotProduct.images}
              badge={padChuotProduct.badge}
            />

            {/* Right: Product Info */}
            <div className="flex flex-col justify-center">
              <ProductInfo
                name={padChuotProduct.name}
                rating={padChuotProduct.rating}
                price={padChuotProduct.price}
                description={padChuotProduct.description}
                priceNote="Giá đã bao gồm VAT. Miễn phí vận chuyển cho đơn hàng trên 500.000₫"
              />

              {/* Quantity Selector - No size selector for mouse pad */}
              <ProductQuantitySelector
                quantity={quantity}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
                stock={padChuotProduct.stock}
              />

              {/* Add to Cart Button */}
              <ProductActions
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                isAddingToCart={isAddingToCart}
              />

              {/* Product Features */}
              <ProductFeatures features={padChuotProduct.features} />
            </div>
          </div>

          {/* Additional Info Section */}
          <ProductAdditionalInfo info={padChuotProduct.additionalInfo} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
