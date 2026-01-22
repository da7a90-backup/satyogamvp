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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
          <ForumCreateThreadClient initialCategoryId={searchParamsResolved.category} />
        </Suspense>
      </div>
    </div>
  );
}
