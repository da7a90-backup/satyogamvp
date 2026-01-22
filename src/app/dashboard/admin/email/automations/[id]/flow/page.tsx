import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import AutomationFlowBuilder from '@/components/dashboard/email/AutomationFlowBuilder';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AutomationFlowPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Visual Flow Builder</h1>
      <AutomationFlowBuilder automationId={id} />
    </div>
  );
}
