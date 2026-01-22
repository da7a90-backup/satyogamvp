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

export default async function CategoryThreadsPage({ params, searchParams }: PageProps) {
  const { categoryId } = await params;
  const searchParamsResolved = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense
          fallback={
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border p-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
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
