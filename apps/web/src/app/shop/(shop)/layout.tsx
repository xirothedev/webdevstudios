import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

export default function ShopProductLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-wds-background text-wds-text selection:bg-wds-accent/30 selection:text-wds-text min-h-screen">
      <Navbar />

      {/* Background ambient glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="bg-wds-accent/20 absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] rounded-full bg-purple-500/20 blur-[120px]" />
      </div>

      <main className="relative z-10 pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-6">{children}</div>
      </main>

      <Footer />
    </div>
  );
}
