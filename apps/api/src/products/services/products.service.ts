import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { ProductSize, ProductSlug } from '@prisma/client';

import {
  ProductDto,
  ProductListResponseDto,
  StockInfoDto,
  UpdateProductDto,
  UpdateProductSizesDto,
  UpdateProductStockDto,
} from '../dto';
import { ProductWithRelations } from '../product.types';
import { ProductRepo } from '../repo';

@Injectable()
export class ProductsService {
  constructor(private readonly productRepository: ProductRepo) {}

  async getProductBySlug(slug: ProductSlug): Promise<ProductDto> {
    const product = await this.productRepository.findBySlug(slug);
    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return this.mapToDto(product);
  }

  async listProducts(): Promise<ProductListResponseDto> {
    // TODO: Add pagination
    const products = await this.productRepository.findAll();

    return {
      products: products.map((product) => this.mapToDto(product)),
      total: products.length,
    };
  }

  async getProductStock(slug: ProductSlug, size?: ProductSize): Promise<StockInfoDto> {
    const product = await this.productRepository.findBySlug(slug);
    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    if (product.hasSizes) {
      // Product with sizes - return size-specific stock
      const sizeStocks =
        product.sizeStocks?.map((ss) => ({
          size: ss.size,
          stock: ss.stock,
        })) || [];

      // If specific size requested, return that size's stock
      if (size) {
        const sizeStock = sizeStocks.find((ss) => ss.size === size);
        if (!sizeStock) {
          throw new NotFoundException(`Size ${size} not found for product ${slug}`);
        }

        const stockStatus = this.calculateStockStatusOf(sizeStock.stock);
        return {
          stock: sizeStock.stock,
          stockStatus,
          sizeStocks,
        };
      }

      // Return all sizes
      const totalStock = sizeStocks.reduce((sum, ss) => sum + ss.stock, 0);
      const stockStatus = this.calculateStockStatusOf(totalStock);

      return {
        stock: totalStock,
        stockStatus,
        sizeStocks,
      };
    }

    // Product without sizes - return main stock
    const stockStatus = this.calculateStockStatusOf(product.stock);
    return {
      stock: product.stock,
      stockStatus,
      sizeStocks: null,
    };
  }

  async updateProduct(productId: string, dto: UpdateProductDto): Promise<ProductDto> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    await this.productRepository.update(productId, {
      name: dto.name,
      description: dto.description,
      priceCurrent: dto.priceCurrent,
      priceOriginal: dto.priceOriginal,
      badge: dto.badge,
      isPublished: dto.isPublished,
    });

    const updatedProduct = await this.productRepository.findById(productId);
    if (!updatedProduct) {
      throw new NotFoundException('Product not found after update');
    }

    return this.mapToDto(updatedProduct);
  }

  async updateProductStock(productId: string, dto: UpdateProductStockDto): Promise<ProductDto> {
    const { stock, size } = dto;

    if (stock < 0) {
      throw new BadRequestException('Stock cannot be negative');
    }

    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    if (size) {
      // Update size-specific stock
      if (!product.hasSizes) {
        throw new BadRequestException('Product does not support size-specific stock');
      }

      await this.productRepository.updateSizeStock(productId, size, stock);

      // Recalculate total stock from all sizes
      const updatedProduct = await this.productRepository.findById(productId);
      if (updatedProduct && updatedProduct.sizeStocks) {
        const totalStock = updatedProduct.sizeStocks.reduce((sum, ss) => sum + ss.stock, 0);
        await this.productRepository.updateStock(productId, totalStock);
      }
    } else {
      // Update main stock
      if (product.hasSizes) {
        throw new BadRequestException(
          'Product has sizes. Please specify size when updating stock.',
        );
      }

      await this.productRepository.updateStock(productId, stock);
    }

    const updatedProduct = await this.productRepository.findById(productId);
    if (!updatedProduct) {
      throw new NotFoundException('Product not found after update');
    }

    return this.mapToDto(updatedProduct);
  }

  async updateProductSizes(productId: string, dto: UpdateProductSizesDto): Promise<ProductDto> {
    const { sizeStocks } = dto;

    // Validate input
    if (!Array.isArray(sizeStocks) || sizeStocks.length === 0) {
      throw new BadRequestException('sizeStocks must be a non-empty array');
    }

    // Check for negative stock
    const hasNegativeStock = sizeStocks.some((ss) => ss.stock < 0);
    if (hasNegativeStock) {
      throw new BadRequestException('Stock cannot be negative');
    }

    // Get product
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    // Validate product has sizes
    if (!product.hasSizes) {
      throw new BadRequestException('Product does not support size-specific stock');
    }

    // Update all size stocks (upsert - creates if not exists, updates if exists)
    for (const sizeStock of sizeStocks) {
      await this.productRepository.updateSizeStock(productId, sizeStock.size, sizeStock.stock);
    }

    // Recalculate total stock from ALL sizes in database (not just updated ones)
    // This ensures total stock is always accurate
    const updatedProduct = await this.productRepository.findById(productId);
    if (!updatedProduct) {
      throw new NotFoundException('Product not found after update');
    }

    // Calculate total from all sizeStocks in database
    if (updatedProduct.sizeStocks && updatedProduct.sizeStocks.length > 0) {
      const totalStock = updatedProduct.sizeStocks.reduce((sum, ss) => sum + ss.stock, 0);
      await this.productRepository.updateStock(productId, totalStock);
    } else {
      // If no size stocks exist, set total to 0
      await this.productRepository.updateStock(productId, 0);
    }

    // Get final product state
    const finalProduct = await this.productRepository.findById(productId);
    if (!finalProduct) {
      throw new NotFoundException('Product not found after stock update');
    }

    return this.mapToDto(finalProduct);
  }

  private mapToDto(product: ProductWithRelations): ProductDto {
    const stockStatus = this.calculateStockStatus(product);

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      priceCurrent: Number(product.priceCurrent),
      priceOriginal: product.priceOriginal ? Number(product.priceOriginal) : null,
      priceDiscount: product.priceDiscount ? Number(product.priceDiscount) : null,
      stock: product.stock,
      hasSizes: product.hasSizes,
      badge: product.badge,
      ratingValue: Number(product.ratingValue),
      ratingCount: product.ratingCount,
      sizeStocks: product.sizeStocks?.map((ss) => ({
        size: ss.size,
        stock: ss.stock,
      })),
      stockStatus,
      isPublished: product.isPublished,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private calculateStockStatus(
    product: ProductWithRelations,
  ): 'in_stock' | 'low_stock' | 'out_of_stock' {
    if (product.hasSizes && product.sizeStocks?.length > 0) {
      // For products with sizes, check if any size has stock
      const totalStock = product.sizeStocks.reduce((sum, ss) => sum + ss.stock, 0);
      if (totalStock === 0) return 'out_of_stock';
      if (totalStock < 5) return 'low_stock';
      return 'in_stock';
    }

    // For products without sizes, use main stock
    if (product.stock === 0) return 'out_of_stock';
    if (product.stock < 5) return 'low_stock';
    return 'in_stock';
  }

  private calculateStockStatusOf(stock: number): 'in_stock' | 'low_stock' | 'out_of_stock' {
    if (stock === 0) return 'out_of_stock';
    if (stock < 5) return 'low_stock';
    return 'in_stock';
  }
}
