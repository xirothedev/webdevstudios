/*
  Warnings:

  - You are about to drop the column `variantId` on the `cart_items` table. All the data in the column will be lost.
  - You are about to drop the column `variantId` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `variantName` on the `order_items` table. All the data in the column will be lost.
  - The `shippingFee` column on the `orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `discountValue` column on the `orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `isMain` on the `product_images` table. All the data in the column will be lost.
  - You are about to drop the column `basePrice` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `products` table. All the data in the column will be lost.
  - The `minSpend` column on the `vouchers` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `maxDiscount` column on the `vouchers` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `_ProductOptionValueToProductVariant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_option_values` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_options` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_variants` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[cartId,productId,size]` on the table `cart_items` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productId` to the `cart_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productSlug` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `price` on the `order_items` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `userId` on table `orders` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `totalAmount` on the `orders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `priceCurrent` to the `products` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `slug` on the `products` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `description` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `reviews` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `value` on the `vouchers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ProductSlug" AS ENUM ('AO_THUN', 'PAD_CHUOT', 'DAY_DEO', 'MOC_KHOA');

-- CreateEnum
CREATE TYPE "ProductSize" AS ENUM ('S', 'M', 'L', 'XL');

-- DropForeignKey
ALTER TABLE "_ProductOptionValueToProductVariant" DROP CONSTRAINT "_ProductOptionValueToProductVariant_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductOptionValueToProductVariant" DROP CONSTRAINT "_ProductOptionValueToProductVariant_B_fkey";

-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_variantId_fkey";

-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_parentId_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_variantId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_userId_fkey";

-- DropForeignKey
ALTER TABLE "product_option_values" DROP CONSTRAINT "product_option_values_optionId_fkey";

-- DropForeignKey
ALTER TABLE "product_options" DROP CONSTRAINT "product_options_productId_fkey";

-- DropForeignKey
ALTER TABLE "product_variants" DROP CONSTRAINT "product_variants_productId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_productId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_userId_fkey";

-- DropIndex
DROP INDEX "cart_items_cartId_variantId_key";

-- DropIndex
DROP INDEX "products_categoryId_idx";

-- AlterTable
ALTER TABLE "cart_items" DROP COLUMN "variantId",
ADD COLUMN     "productId" TEXT NOT NULL,
ADD COLUMN     "size" "ProductSize";

-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "variantId",
DROP COLUMN "variantName",
ADD COLUMN     "productId" TEXT,
ADD COLUMN     "productSlug" "ProductSlug" NOT NULL,
ADD COLUMN     "size" "ProductSize",
DROP COLUMN "price",
ADD COLUMN     "price" MONEY NOT NULL;

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "userId" SET NOT NULL,
DROP COLUMN "totalAmount",
ADD COLUMN     "totalAmount" MONEY NOT NULL,
DROP COLUMN "shippingFee",
ADD COLUMN     "shippingFee" MONEY NOT NULL DEFAULT 0,
DROP COLUMN "discountValue",
ADD COLUMN     "discountValue" MONEY NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "product_images" DROP COLUMN "isMain",
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "basePrice",
DROP COLUMN "categoryId",
ADD COLUMN     "badge" VARCHAR(50),
ADD COLUMN     "hasSizes" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priceCurrent" MONEY NOT NULL,
ADD COLUMN     "priceDiscount" MONEY,
ADD COLUMN     "priceOriginal" MONEY,
ADD COLUMN     "ratingCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ratingValue" DECIMAL(3,2) NOT NULL DEFAULT 0,
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "slug",
ADD COLUMN     "slug" "ProductSlug" NOT NULL,
ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "vouchers" DROP COLUMN "value",
ADD COLUMN     "value" MONEY NOT NULL,
DROP COLUMN "minSpend",
ADD COLUMN     "minSpend" MONEY,
DROP COLUMN "maxDiscount",
ADD COLUMN     "maxDiscount" MONEY;

-- DropTable
DROP TABLE "_ProductOptionValueToProductVariant";

-- DropTable
DROP TABLE "categories";

-- DropTable
DROP TABLE "product_option_values";

-- DropTable
DROP TABLE "product_options";

-- DropTable
DROP TABLE "product_variants";

-- CreateTable
CREATE TABLE "product_size_stocks" (
    "id" TEXT NOT NULL,
    "size" "ProductSize" NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "productId" TEXT NOT NULL,

    CONSTRAINT "product_size_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_size_stocks_productId_idx" ON "product_size_stocks"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "product_size_stocks_productId_size_key" ON "product_size_stocks"("productId", "size");

-- CreateIndex
CREATE INDEX "cart_items_cartId_idx" ON "cart_items"("cartId");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cartId_productId_size_key" ON "cart_items"("cartId", "productId", "size");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE INDEX "product_images_productId_order_idx" ON "product_images"("productId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_slug_idx" ON "products"("slug");

-- CreateIndex
CREATE INDEX "reviews_productId_idx" ON "reviews"("productId");

-- CreateIndex
CREATE INDEX "reviews_userId_idx" ON "reviews"("userId");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_size_stocks" ADD CONSTRAINT "product_size_stocks_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
