import { Suspense } from 'react';
import { DynamicForm } from '@/components/forms/DynamicForm';

interface QuestionnairePageProps {
  searchParams: Promise<{ form?: string }>;
}

async function QuestionnaireContent({ searchParams }: QuestionnairePageProps) {
  const params = await searchParams;
  const formSlug = params.form || 'pragyani-questionnaire';

  return <DynamicForm formSlug={formSlug} />;
}

export const dynamic = 'force-dynamic';

export default function QuestionnairePage({ searchParams }: QuestionnairePageProps) {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      }>
        <QuestionnaireContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
