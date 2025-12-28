import { notFound } from 'next/navigation';

// Required by cacheComponents - must return at least one result
export async function generateStaticParams() {
  // Return placeholder since this route always shows notFound
  // but cacheComponents requires at least one param
  return [{ id: 'placeholder' }];
}

export default function OrderDetailPage() {
  notFound();
}
