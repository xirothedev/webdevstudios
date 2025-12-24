import { Footer } from '@/components/Footer';
import { LastUpdatedProvider } from '@/components/legal/last-updated-provider';
import { Navbar } from '@/components/Navbar';
import { getFileCommitDate } from '@/lib/git-utils';

import Content from './content.mdx';

export default function TermsPage() {
  const commitDate = getFileCommitDate(
    'apps/web/src/app/(legal)/terms/content.mdx'
  );

  return (
    <div className="bg-wds-background text-wds-text selection:bg-wds-accent/30 selection:text-wds-text min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 py-24">
        <article className="mx-auto max-w-none">
          <LastUpdatedProvider date={commitDate}>
            <Content />
          </LastUpdatedProvider>
        </article>
      </main>

      <Footer />
    </div>
  );
}
