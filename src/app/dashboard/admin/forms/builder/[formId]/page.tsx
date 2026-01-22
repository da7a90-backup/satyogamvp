import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import FormBuilderClient from '@/components/dashboard/forms/FormBuilderClient';

export const dynamic = 'force-dynamic';

export default async function FormBuilderPage({ params }: { params: Promise<{ formId: string }> }) {
  const session = await getServerSession(authOptions);
  const { formId } = await params;

  if (!session?.user) {
    redirect('/login');
  }

  // TODO: Check if user is admin
  // if (!session.user.isAdmin) {
  //   redirect('/dashboard/user');
  // }

  return <FormBuilderClient formId={formId} />;
}
