import { Schema } from 'effect';
import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiGroup } from 'effect/unstable/httpapi';
import { wrap } from '../lib/http';
import type { Product, ProductSizeStock } from '../generated/prisma/client';
import { ApiError } from '../lib/errors';
import type { DatabaseClient } from '../lib/prisma';
import { goTime } from '../lib/util';

import { VALID_SLUGS, isProductSlug } from '../lib/slugs';

export { VALID_SLUGS };

function statusOf(stock: number): string {
  if (stock === 0) return 'out_of_stock';
  if (stock < 5) return 'low_stock';
  return 'in_stock';
}

type ProductRow = Product & { sizeStocks: ProductSizeStock[] };

const Str = Schema.String;
const Opt = Schema.NullOr;

const SizeStock = Schema.Struct({ size: Str, stock: Schema.Number });

const ProductDto = Schema.Struct({
  id: Str,
  slug: Str,
  name: Str,
  description: Opt(Str),
  priceCurrent: Schema.Number,
  priceOriginal: Opt(Schema.Number),
  priceDiscount: Opt(Schema.Number),
  stock: Schema.Number,
  hasSizes: Schema.Boolean,
  badge: Opt(Str),
  ratingValue: Schema.Number,
  ratingCount: Schema.Number,
  sizeStocks: Schema.Array(SizeStock),
  stockStatus: Str,
  isPublished: Schema.Boolean,
  createdAt: Opt(Str),
  updatedAt: Opt(Str),
});

const ProductList = Schema.Struct({
  products: Schema.Array(ProductDto),
  total: Schema.Number,
});

const StockDto = Schema.Struct({
  stock: Schema.Number,
  stockStatus: Str,
  sizeStocks: Opt(Schema.Array(SizeStock)),
});

export const productsGroup = HttpApiGroup.make('products').add(
  HttpApiEndpoint.get('listProducts', '/v1/products', { success: ProductList }),
  HttpApiEndpoint.get('getProduct', '/v1/products/:slug', {
    params: Schema.Struct({ slug: Str }),
    success: ProductDto,
  }),
  HttpApiEndpoint.get('getProductStock', '/v1/products/:slug/stock', {
    params: Schema.Struct({ slug: Str }),
    success: StockDto,
  }),
);

export const productsLocal = HttpApi.make('api-effect').add(productsGroup);

function toDTO(p: ProductRow) {
  let stock = p.stock;
  if (p.hasSizes && p.sizeStocks.length > 0) {
    stock = p.sizeStocks.reduce((sum, s) => sum + s.stock, 0);
  }
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    priceCurrent: Number(p.priceCurrent),
    priceOriginal: p.priceOriginal === null ? null : Number(p.priceOriginal),
    priceDiscount: p.priceDiscount === null ? null : Number(p.priceDiscount),
    stock: p.stock,
    hasSizes: p.hasSizes,
    badge: p.badge,
    ratingValue: Number(p.ratingValue),
    ratingCount: p.ratingCount,
    sizeStocks: p.sizeStocks.map((s) => ({ size: s.size, stock: s.stock })),
    stockStatus: statusOf(stock),
    isPublished: p.isPublished,
    createdAt: goTime(p.createdAt),
    updatedAt: goTime(p.updatedAt),
  };
}

async function productBySlug(db: DatabaseClient, slug: string): Promise<ProductRow> {
  if (!isProductSlug(slug)) {
    throw new ApiError(404, `Product with slug ${slug} not found`);
  }
  const p = await db.product.findFirst({
    where: { slug },
    include: { sizeStocks: true },
  });
  if (p === null) throw new ApiError(404, `Product with slug ${slug} not found`);
  return p;
}

export const productsHandlers = HttpApiBuilder.group(productsLocal, 'products', (h) =>
  h
    .handle(
      'listProducts',
      wrap(true, async (ctx) => {
        const rows = await ctx.db.product.findMany({
          where: { isPublished: true },
          include: { sizeStocks: true },
        });
        return { products: rows.map(toDTO), total: rows.length };
      }),
    )
    .handle(
      'getProduct',
      wrap(true, async (ctx) => toDTO(await productBySlug(ctx.db, ctx.param('slug')))),
    )
    .handle(
      'getProductStock',
      wrap(true, async (ctx) => {
        const slug = ctx.param('slug');
        const p = await productBySlug(ctx.db, slug);
        const size = ctx.query.size ?? '';
        if (!p.hasSizes) {
          return { stock: p.stock, stockStatus: statusOf(p.stock), sizeStocks: null };
        }
        const sizes = p.sizeStocks.map((s) => ({ size: s.size, stock: s.stock }));
        if (size !== '') {
          const hit = p.sizeStocks.find((s) => s.size === size);
          if (hit === undefined)
            throw new ApiError(404, `Size ${size} not found for product ${slug}`);
          return { stock: hit.stock, stockStatus: statusOf(hit.stock), sizeStocks: sizes };
        }
        const total = p.sizeStocks.reduce((sum, s) => sum + s.stock, 0);
        return { stock: total, stockStatus: statusOf(total), sizeStocks: sizes };
      }),
    ),
);
