import { Suspense } from 'react';
import { DynamicForm } from '@/components/forms/DynamicForm';

interface ApplyPageProps {
  searchParams: Promise<{ form?: string }>;
}

async function ApplyContent({ searchParams }: ApplyPageProps) {
  const params = await searchParams;
  const formSlug = params.form || 'shakti-saturation-application';

  return <DynamicForm formSlug={formSlug} />;
}

export default function ApplyPage({ searchParams }: ApplyPageProps) {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      }>
        <ApplyContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}