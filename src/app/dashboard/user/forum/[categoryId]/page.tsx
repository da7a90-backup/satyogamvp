import { Suspense } from 'react';
import ForumThreadListClient from '@/components/forum/ForumThreadListClient';

export const metadata = {
  title: 'Forum Threads | Sat Yoga Dashboard',
  description: 'Browse forum threads',
};

interface PageProps {
  params: Promise<{ categoryId: string }>;
  searchParams: Promise<{ page?: string; search?: string }>;
}

export const dynamic = 'force-dynamic';

export default async function CategoryThreadsPage({ params, searchParams }: PageProps) {
  const { categoryId } = await params;
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
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Suspense
          fallback={
            <div className="animate-pulse">
              <div className="h-8 rounded w-1/4 mb-6" style={{ backgroundColor: '#E5DED3' }}></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="rounded-lg border p-4" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5DED3' }}>
                    <div className="h-6 rounded w-3/4 mb-2" style={{ backgroundColor: '#E5DED3' }}></div>
                    <div className="h-4 rounded w-1/2" style={{ backgroundColor: '#FAF8F1' }}></div>
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <ForumThreadListClient
            categoryId={categoryId}
            initialPage={searchParamsResolved.page ? parseInt(searchParamsResolved.page) : 1}
            initialSearch={searchParamsResolved.search}
          />
        </Suspense>
      </div>
    </div>
  );
}
