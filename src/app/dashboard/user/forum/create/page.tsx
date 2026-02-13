import { Suspense } from 'react';
import ForumCreateThreadClient from '@/components/forum/ForumCreateThreadClient';

export const metadata = {
  title: 'Create Thread | Sat Yoga Forum',
  description: 'Start a new discussion',
};

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export const dynamic = 'force-dynamic';

export default async function CreateThreadPage({ searchParams }: PageProps) {
  const searchParamsResolved = await searchParams;

  return (
    <div
      className="w-full"
      style={{
        backgroundColor: '#FAF8F1',
        minHeight: '100vh',
        height: '100%',
        position: 'relative',
        paddingBottom: '2rem'
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Suspense fallback={
          <div className="animate-pulse">
            <div className="h-8 rounded w-1/4 mb-6" style={{ backgroundColor: '#E5DED3' }}></div>
          </div>
        }>
          <ForumCreateThreadClient initialCategoryId={searchParamsResolved.category} />
        </Suspense>
      </div>
    </div>
  );
}
