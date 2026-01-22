import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import AuditLogClient from '@/components/dashboard/audit/AuditLogClient';

export const metadata = {
  title: 'Activity Log - Admin Dashboard',
  description: 'Comprehensive audit trail of all admin actions in the system',
};

export default async function ActivityLogPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  // TODO: Check if user is admin
  // if (!session.user.isAdmin) {
  //   redirect('/dashboard/user');
  // }

  return <AuditLogClient />;
}
