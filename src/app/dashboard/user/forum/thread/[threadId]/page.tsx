import { Suspense } from 'react';
import ForumThreadDetailClient from '@/components/forum/ForumThreadDetailClient';

export const metadata = {
  title: 'Thread | Sat Yoga Forum',
  description: 'View forum thread',
};

interface PageProps {
  params: Promise<{ threadId: string }>;
}

export const dynamic = 'force-dynamic';

export default async function ThreadDetailPage({ params }: PageProps) {
  const { threadId } = await params;

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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense
          fallback={
            <div className="animate-pulse">
              <div className="h-8 rounded w-1/4 mb-4" style={{ backgroundColor: '#E5DED3' }}></div>
              <div className="h-10 rounded w-3/4 mb-6" style={{ backgroundColor: '#E5DED3' }}></div>
              <div className="rounded-lg border p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5DED3' }}>
                <div className="h-4 rounded w-full mb-3" style={{ backgroundColor: '#FAF8F1' }}></div>
                <div className="h-4 rounded w-full mb-3" style={{ backgroundColor: '#FAF8F1' }}></div>
                <div className="h-4 rounded w-2/3" style={{ backgroundColor: '#FAF8F1' }}></div>
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
