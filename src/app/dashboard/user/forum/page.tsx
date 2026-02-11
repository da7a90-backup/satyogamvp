import { Suspense } from 'react';
import ForumCategoriesClient from '@/components/forum/ForumCategoriesClient';

export const metadata = {
  title: 'Forum | Sat Yoga Dashboard',
  description: 'Community forum for Sat Yoga members',
};

export const dynamic = 'force-dynamic';

export default function ForumPage() {
  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#FAF8F1', minHeight: '100vh' }}>
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1
            className="text-4xl md:text-5xl font-semibold mb-4"
            style={{
              fontFamily: 'Optima, Georgia, serif',
              color: '#2C1810',
              lineHeight: '1.2'
            }}
          >
            Community Forum
          </h1>
          <p
            className="text-lg md:text-xl max-w-2xl mx-auto"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              color: '#5C4D42',
              lineHeight: '1.6'
            }}
          >
            Connect with fellow members, share insights, and discuss teachings
          </p>
        </div>

        {/* Categories */}
        <Suspense
          fallback={
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border p-8 animate-pulse"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5DED3'
                  }}
                >
                  <div className="h-6 rounded w-1/4 mb-4" style={{ backgroundColor: '#E5DED3' }}></div>
                  <div className="h-4 rounded w-3/4" style={{ backgroundColor: '#FAF8F1' }}></div>
                </div>
              ))}
            </div>
          }
        >
          <ForumCategoriesClient />
        </Suspense>
      </div>
    </div>
  );
}
