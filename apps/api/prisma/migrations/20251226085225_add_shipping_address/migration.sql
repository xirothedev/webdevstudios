/*
  Warnings:

  - You are about to drop the column `shippingAddressJson` on the `orders` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shippingAddressId]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shippingAddressId` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "shippingAddressJson",
ADD COLUMN     "shippingAddressId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "shipping_addresses" (
    "id" TEXT NOT NULL,
    "fullName" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "addressLine1" VARCHAR(255) NOT NULL,
    "addressLine2" VARCHAR(255),
    "city" VARCHAR(100) NOT NULL,
    "district" VARCHAR(100) NOT NULL,
    "ward" VARCHAR(100) NOT NULL,
    "postalCode" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_shippingAddressId_key" ON "orders"("shippingAddressId");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "shipping_addresses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
