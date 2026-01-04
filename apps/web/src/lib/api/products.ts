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

import { apiClient } from '../api-client';

export type ProductSlug = 'AO_THUN' | 'PAD_CHUOT' | 'DAY_DEO' | 'MOC_KHOA';
export type ProductSize = 'S' | 'M' | 'L' | 'XL';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  order: number;
}

export interface ProductSizeStock {
  size: ProductSize;
  stock: number;
}

export interface Product {
  id: string;
  slug: ProductSlug;
  name: string;
  description: string;
  priceCurrent: number;
  priceOriginal: number | null;
  priceDiscount: number | null;
  isPublished: boolean;
  stock: number;
  hasSizes: boolean;
  badge: string | null;
  ratingValue: number;
  ratingCount: number;
  images: ProductImage[];
  sizeStocks?: ProductSizeStock[] | null;
  stockStatus: StockStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
}

export interface StockInfo {
  stock: number;
  stockStatus: StockStatus;
  sizeStocks?: ProductSizeStock[] | null;
}

export const productsApi = {
  /**
   * Get all products
   */
  async listProducts(): Promise<ProductListResponse> {
    const response = await apiClient.get<{ data: ProductListResponse }>(
      '/products'
    );
    return response.data.data;
  },

  /**
   * Get product by slug
   */
  async getProductBySlug(slug: ProductSlug): Promise<Product> {
    const response = await apiClient.get<{ data: Product }>(
      `/products/${slug}`
    );
    return response.data.data;
  },

  /**
   * Get product stock information
   */
  async getProductStock(
    slug: ProductSlug,
    size?: ProductSize
  ): Promise<StockInfo> {
    const params = size ? { size } : {};
    const response = await apiClient.get<{ data: StockInfo }>(
      `/products/${slug}/stock`,
      {
        params,
      }
    );
    return response.data.data;
  },
};
