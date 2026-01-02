import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

import { CartContent } from './CartContent';

export default function CartPage() {
  return (
    <div className="bg-wds-background text-wds-text min-h-screen">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <CartContent />
        </div>
      </main>
      <Footer />
    </div>
  );
}
