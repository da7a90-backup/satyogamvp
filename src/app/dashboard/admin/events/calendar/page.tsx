import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import EventsCalendarClient from '@/components/dashboard/events/EventsCalendarClient';

export default async function EventsCalendarPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  // TODO: Check if user is admin
  // if (!session.user.isAdmin) {
  //   redirect('/dashboard/user');
  // }

  return <EventsCalendarClient />;
}
