import type { Product, ProductSizeStock, ProductSlug } from '../generated/prisma/client';
import { ApiError } from '../lib/errors';
import { db } from '../lib/prisma';
import { goTime } from '../lib/util';
import { route } from '../lib/http';

export const VALID_SLUGS = ['AO_THUN', 'PAD_CHUOT', 'DAY_DEO', 'MOC_KHOA'] as const;

function statusOf(stock: number): string {
  if (stock === 0) return 'out_of_stock';
  if (stock < 5) return 'low_stock';
  return 'in_stock';
}

type ProductRow = Product & { sizeStocks: ProductSizeStock[] };

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

async function productBySlug(slug: string): Promise<ProductRow> {
  if (!(VALID_SLUGS as readonly string[]).includes(slug)) {
    throw new ApiError(404, `Product with slug ${slug} not found`);
  }
  const p = await db().product.findFirst({
    where: { slug: slug as ProductSlug },
    include: { sizeStocks: true },
  });
  if (p === null) throw new ApiError(404, `Product with slug ${slug} not found`);
  return p;
}

export const productsRoutes = [
  route('GET', '/products', async () => {
    const rows = await db().product.findMany({
      where: { isPublished: true },
      include: { sizeStocks: true },
    });
    return { products: rows.map(toDTO), total: rows.length };
  }),
  route('GET', '/products/:slug', async (ctx) => toDTO(await productBySlug(ctx.params.slug!))),
  route('GET', '/products/:slug/stock', async (ctx) => {
    const slug = ctx.params.slug!;
    const p = await productBySlug(slug);
    const size = ctx.query.size ?? '';
    if (!p.hasSizes) {
      return { stock: p.stock, stockStatus: statusOf(p.stock), sizeStocks: null };
    }
    const sizes = p.sizeStocks.map((s) => ({ size: s.size, stock: s.stock }));
    if (size !== '') {
      const hit = p.sizeStocks.find((s) => s.size === size);
      if (hit === undefined) throw new ApiError(404, `Size ${size} not found for product ${slug}`);
      return { stock: hit.stock, stockStatus: statusOf(hit.stock), sizeStocks: sizes };
    }
    const total = p.sizeStocks.reduce((sum, s) => sum + s.stock, 0);
    return { stock: total, stockStatus: statusOf(total), sizeStocks: sizes };
  }),
];
