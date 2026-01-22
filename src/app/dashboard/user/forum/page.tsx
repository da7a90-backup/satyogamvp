import { Suspense } from 'react';
import ForumCategoriesClient from '@/components/forum/ForumCategoriesClient';

export const metadata = {
  title: 'Forum | Sat Yoga Dashboard',
  description: 'Community forum for Sat Yoga members',
};

export const dynamic = 'force-dynamic';

export default function ForumPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Community Forum</h1>
          <p className="mt-2 text-gray-600">
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
                  className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
                >
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
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
