import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, test } from 'bun:test';

import { ProductSize, ProductSlug } from '@prisma/client';

import { UpdateProductDto, UpdateProductSizesDto, UpdateProductStockDto } from '../dto';
import { ProductRepo } from '../repo';
import { ProductsService } from './products.service';

// pins the ProductsService seam: stock math, size guards, and the
// recalculate-total-after-upsert invariant

type SS = { productId: string; size: ProductSize; stock: number };

type Row = {
  id: string;
  slug: ProductSlug;
  name: string;
  description?: string;
  priceCurrent: unknown;
  priceOriginal?: unknown;
  priceDiscount?: unknown;
  stock: number;
  hasSizes: boolean;
  badge: string | null;
  ratingValue: unknown;
  ratingCount: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  sizeStocks: SS[];
};

const row = (extra: Partial<Row> = {}): Row => ({
  id: 'p1',
  slug: 'AO_THUN' as ProductSlug,
  name: 'Áo thun',
  priceCurrent: '299000',
  stock: 10,
  hasSizes: false,
  badge: null,
  ratingValue: '4.5',
  ratingCount: 12,
  isPublished: true,
  createdAt: new Date(0),
  updatedAt: new Date(0),
  sizeStocks: [],
  ...extra,
});

const makeRepo = (products: Row[]) => {
  const db = new Map(products.map((p) => [p.id, p]));
  const calls = {
    updated: [] as Array<[string, Record<string, unknown>]>,
    stock: [] as Array<[string, number]>,
    sizeStock: [] as Array<[string, ProductSize, number]>,
  };
  const repo = {
    findBySlug: async (slug: ProductSlug) => [...db.values()].find((p) => p.slug === slug) ?? null,
    findAll: async () => [...db.values()],
    findById: async (id: string) => db.get(id) ?? null,
    update: async (id: string, data: Record<string, unknown>) => {
      calls.updated.push([id, data]);
      Object.assign(db.get(id)!, data);
    },
    updateStock: async (id: string, stock: number) => {
      calls.stock.push([id, stock]);
      const p = db.get(id)!;
      p.stock = stock;
      p.updatedAt = new Date();
    },
    updateSizeStock: async (id: string, size: ProductSize, stock: number) => {
      calls.sizeStock.push([id, size, stock]);
      const p = db.get(id)!;
      const existing = p.sizeStocks.find((ss) => ss.size === size);
      if (existing) {
        existing.stock = stock;
      } else {
        p.sizeStocks.push({ productId: id, size, stock });
      }
    },
  };
  return { calls, repo: repo as unknown as ProductRepo };
};

const serviceFor = (products: Row[]) => {
  const { calls, repo } = makeRepo(products);
  return { calls, service: new ProductsService(repo) };
};

describe('ProductsService.getProductBySlug', () => {
  test('maps the product to a dto with numeric prices', async () => {
    const { service } = serviceFor([row({ priceOriginal: '399000', priceDiscount: null })]);

    const dto = await service.getProductBySlug('AO_THUN');

    expect(dto.priceCurrent).toBe(299000);
    expect(dto.priceOriginal).toBe(399000);
    expect(dto.priceDiscount).toBeNull();
    expect(dto.ratingValue).toBe(4.5);
    expect(dto.stockStatus).toBe('in_stock');
  });

  test('rejects an unknown slug', async () => {
    const { service } = serviceFor([]);
    expect(service.getProductBySlug('NOPE' as ProductSlug)).rejects.toThrow(NotFoundException);
  });
});

describe('ProductsService.listProducts', () => {
  test('lists products with total', async () => {
    const { service } = serviceFor([
      row(),
      row({ id: 'p2', hasSizes: true, sizeStocks: [{ productId: 'p2', size: 'M', stock: 2 }] }),
      row({ id: 'p3', hasSizes: true, sizeStocks: [{ productId: 'p3', size: 'S', stock: 0 }] }),
      row({ id: 'p4', hasSizes: true, stock: 3 }),
    ]);

    const list = await service.listProducts();

    expect(list.total).toBe(4);
    expect(list.products.map((p) => p.stockStatus)).toEqual([
      'in_stock',
      'low_stock',
      'out_of_stock',
      'low_stock',
    ]);
  });
});

describe('ProductsService.getProductStock', () => {
  test('returns one size stock when a size is requested', async () => {
    const { service } = serviceFor([
      row({
        hasSizes: true,
        stock: 0,
        sizeStocks: [
          { productId: 'p1', size: 'M', stock: 7 },
          { productId: 'p1', size: 'L', stock: 0 },
        ],
      }),
    ]);

    const info = await service.getProductStock('AO_THUN', 'M');

    expect(info.stock).toBe(7);
    expect(info.stockStatus).toBe('in_stock');
    expect(info.sizeStocks).toHaveLength(2);
  });

  test('sums all sizes and flags low stock', async () => {
    const { service } = serviceFor([
      row({
        hasSizes: true,
        sizeStocks: [
          { productId: 'p1', size: 'M', stock: 2 },
          { productId: 'p1', size: 'L', stock: 1 },
        ],
      }),
    ]);

    const info = await service.getProductStock('AO_THUN');

    expect(info.stock).toBe(3);
    expect(info.stockStatus).toBe('low_stock');
  });

  test('rejects a size the product does not carry', async () => {
    const { service } = serviceFor([
      row({ hasSizes: true, sizeStocks: [{ productId: 'p1', size: 'M', stock: 2 }] }),
    ]);

    expect(service.getProductStock('AO_THUN', 'XL')).rejects.toThrow(NotFoundException);
  });

  test('uses main stock for unsized products', async () => {
    const { service } = serviceFor([row({ stock: 0 })]);

    const info = await service.getProductStock('AO_THUN');

    expect(info).toEqual({ stock: 0, stockStatus: 'out_of_stock', sizeStocks: null });
  });

  test('rejects an unknown slug', async () => {
    const { service } = serviceFor([]);
    expect(service.getProductStock('NOPE' as ProductSlug)).rejects.toThrow(NotFoundException);
  });
});

describe('ProductsService.updateProduct', () => {
  test('applies only the provided fields and returns the fresh row', async () => {
    const { calls, service } = serviceFor([row()]);
    const dto = { name: 'New', priceCurrent: 100000 } as UpdateProductDto;

    const dtoOut = await service.updateProduct('p1', dto);

    expect(calls.updated[0][1]).toMatchObject({ name: 'New', priceCurrent: 100000 });
    expect(dtoOut.name).toBe('New');
  });

  test('rejects an unknown id', async () => {
    const { service } = serviceFor([]);
    expect(service.updateProduct('ghost', {} as UpdateProductDto)).rejects.toThrow(
      NotFoundException,
    );
  });
});

describe('ProductsService.updateProductStock', () => {
  test('rejects negative stock before touching the repo', async () => {
    const { calls, service } = serviceFor([row()]);

    expect(
      service.updateProductStock('p1', { stock: -1 } as UpdateProductStockDto),
    ).rejects.toThrow(BadRequestException);
    expect(calls.stock).toHaveLength(0);
  });

  test('rejects an unknown id', async () => {
    const { service } = serviceFor([]);
    expect(
      service.updateProductStock('ghost', { stock: 1 } as UpdateProductStockDto),
    ).rejects.toThrow(NotFoundException);
  });

  test('updates one size then recalculates the total from all sizes', async () => {
    const { calls, service } = serviceFor([
      row({
        hasSizes: true,
        sizeStocks: [
          { productId: 'p1', size: 'M', stock: 4 },
          { productId: 'p1', size: 'L', stock: 6 },
        ],
      }),
    ]);

    await service.updateProductStock('p1', { stock: 1, size: 'M' } as UpdateProductStockDto);

    expect(calls.sizeStock[0]).toEqual(['p1', 'M', 1]);
    expect(calls.stock).toEqual([['p1', 7]]);
  });

  test('rejects size updates on unsized products', async () => {
    const { service } = serviceFor([row()]);

    expect(
      service.updateProductStock('p1', { stock: 1, size: 'M' } as UpdateProductStockDto),
    ).rejects.toThrow(BadRequestException);
  });

  test('rejects plain stock updates on sized products', async () => {
    const { service } = serviceFor([
      row({ hasSizes: true, sizeStocks: [{ productId: 'p1', size: 'M', stock: 4 }] }),
    ]);

    expect(service.updateProductStock('p1', { stock: 9 } as UpdateProductStockDto)).rejects.toThrow(
      BadRequestException,
    );
  });

  test('sets main stock for unsized products', async () => {
    const { calls, service } = serviceFor([row()]);

    await service.updateProductStock('p1', { stock: 2 } as UpdateProductStockDto);

    expect(calls.stock).toEqual([['p1', 2]]);
  });
});

describe('ProductsService.updateProductSizes', () => {
  const sizedRow = (): Row =>
    row({
      hasSizes: true,
      sizeStocks: [
        { productId: 'p1', size: 'M', stock: 1 },
        { productId: 'p1', size: 'L', stock: 2 },
      ],
    });

  test('upserts every given size and recalculates the total', async () => {
    const { calls, service } = serviceFor([sizedRow()]);
    const dto = {
      sizeStocks: [
        { size: 'M', stock: 5 },
        { size: 'XL', stock: 4 },
      ],
    } as UpdateProductSizesDto;

    const out = await service.updateProductSizes('p1', dto);

    expect(out.sizeStocks).toEqual([
      { size: 'M', stock: 5 },
      { size: 'L', stock: 2 },
      { size: 'XL', stock: 4 },
    ]);
    expect(calls.stock).toEqual([['p1', 11]]);
  });

  test('rejects an empty list', async () => {
    const { service } = serviceFor([sizedRow()]);
    expect(
      service.updateProductSizes('p1', { sizeStocks: [] } as UpdateProductSizesDto),
    ).rejects.toThrow(BadRequestException);
  });

  test('rejects negative stock entries', async () => {
    const { service } = serviceFor([sizedRow()]);
    expect(
      service.updateProductSizes('p1', {
        sizeStocks: [{ size: 'M', stock: -1 }],
      } as UpdateProductSizesDto),
    ).rejects.toThrow(BadRequestException);
  });

  test('rejects an unknown id', async () => {
    const { service } = serviceFor([]);
    expect(
      service.updateProductSizes('ghost', {
        sizeStocks: [{ size: 'M', stock: 1 }],
      } as UpdateProductSizesDto),
    ).rejects.toThrow(NotFoundException);
  });

  test('rejects unsized products', async () => {
    const { service } = serviceFor([row()]);
    expect(
      service.updateProductSizes('p1', {
        sizeStocks: [{ size: 'M', stock: 1 }],
      } as UpdateProductSizesDto),
    ).rejects.toThrow(BadRequestException);
  });
});
