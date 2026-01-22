import { Suspense } from 'react';
import ForumThreadDetailClient from '@/components/forum/ForumThreadDetailClient';

export const metadata = {
  title: 'Thread | Sat Yoga Forum',
  description: 'View forum thread',
};

interface PageProps {
  params: Promise<{ threadId: string }>;
}

export default async function ThreadDetailPage({ params }: PageProps) {
  const { threadId } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense
          fallback={
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-3/4 mb-6"></div>
              <div className="bg-white rounded-lg border p-6">
                <div className="h-4 bg-gray-100 rounded w-full mb-3"></div>
                <div className="h-4 bg-gray-100 rounded w-full mb-3"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
              </div>
            </div>
          }
        >
          <ForumThreadDetailClient threadId={threadId} />
        </Suspense>
      </div>
    </div>
  );
}
