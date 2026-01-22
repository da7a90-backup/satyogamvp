import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import SalesClient from '@/components/dashboard/sales/SalesClient';

export const dynamic = 'force-dynamic';

export default async function SalesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  return <SalesClient />;
}
