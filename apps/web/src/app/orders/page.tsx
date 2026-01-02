import { Suspense } from 'react';

import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

import { OrdersContent } from './OrdersContent';
import { OrdersLoading } from './OrdersLoading';

export default function OrdersPage() {
  return (
    <div className="bg-wds-background text-wds-text min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <Suspense fallback={<OrdersLoading />}>
            <OrdersContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
