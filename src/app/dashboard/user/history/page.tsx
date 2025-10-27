import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import HistoryClient from './HistoryClient';

export const metadata = {
  title: 'My History | Dashboard',
  description: 'View your watch history',
};

async function getHistory(token: string) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:8000';
    const response = await fetch(`${API_URL}/api/teachings/history/list?limit=100`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch history:', response.status);
      return [];
    }

    const data = await response.json();
    return data.history || [];
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
}

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard/user/history');
  }

  const accessToken = (session as any).accessToken;
  const history = await getHistory(accessToken);

  return <HistoryClient history={history} />;
}
