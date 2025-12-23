export type ProductSize = 'S' | 'M' | 'L' | 'XL';

export interface ProductImage {
  src: string;
  alt: string;
}

export interface ProductPrice {
  current: number;
  original?: number;
  discount?: number;
}

export interface ProductRating {
  value: number;
  count: number;
}

export interface ProductInfo {
  material?: string;
  color?: string;
  origin?: string;
  warranty?: string;
  [key: string]: string | undefined;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: ProductImage[];
  price: ProductPrice;
  rating: ProductRating;
  features: string[];
  additionalInfo: ProductInfo;
  stock: number;
  hasSizes?: boolean;
  sizes?: ProductSize[];
  badge?: string;
}
