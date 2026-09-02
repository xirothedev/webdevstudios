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

import { fetchProductForSSR } from '@/lib/api/server-products';
import { ProductDescription } from '@/components/shop/ProductDescription';

import { ProductPageContent } from '../ProductPageContent';

export default async function PadChuotPage() {
  const initialProduct = await fetchProductForSSR('PAD_CHUOT');
  return (
    <ProductPageContent
      productSlug="pad-chuot"
      productName="Pad chuột"
      initialProduct={initialProduct}
      descriptionNode={
        initialProduct ? (
          <ProductDescription markdown={initialProduct.description ?? ''} />
        ) : undefined
      }
    />
  );
}
