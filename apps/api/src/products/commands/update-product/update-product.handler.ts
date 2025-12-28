import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ProductDto } from '../../dtos/product.dto';
import { ProductRepository } from '../../infrastructure/product.repository';
import { ProductWithRelations } from '../../types/product.types';
import { UpdateProductCommand } from './update-product.command';

@CommandHandler(UpdateProductCommand)
export class UpdateProductHandler implements ICommandHandler<UpdateProductCommand> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: UpdateProductCommand): Promise<ProductDto> {
    const {
      productId,
      name,
      description,
      priceCurrent,
      priceOriginal,
      badge,
      isPublished,
    } = command;

    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    await this.productRepository.update(productId, {
      name,
      description,
      priceCurrent,
      priceOriginal,
      badge,
      isPublished,
    });

    const updatedProduct = await this.productRepository.findById(productId);
    if (!updatedProduct) {
      throw new NotFoundException('Product not found after update');
    }

    return this.mapToDto(updatedProduct);
  }

  private mapToDto(product: ProductWithRelations): ProductDto {
    const stockStatus = this.calculateStockStatus(product);

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      priceCurrent: Number(product.priceCurrent),
      priceOriginal: product.priceOriginal
        ? Number(product.priceOriginal)
        : null,
      priceDiscount: product.priceDiscount
        ? Number(product.priceDiscount)
        : null,
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
    product: ProductWithRelations
  ): 'in_stock' | 'low_stock' | 'out_of_stock' {
    if (product.hasSizes && product.sizeStocks?.length > 0) {
      const totalStock = product.sizeStocks.reduce(
        (sum, ss) => sum + ss.stock,
        0
      );
      if (totalStock === 0) return 'out_of_stock';
      if (totalStock < 5) return 'low_stock';
      return 'in_stock';
    }

    if (product.stock === 0) return 'out_of_stock';
    if (product.stock < 5) return 'low_stock';
    return 'in_stock';
  }
}
