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
    const url = `${API_URL}/api/teachings/history/list?limit=100`;
    console.log('[Server] Fetching history from:', url);
    console.log('[Server] Token:', token?.substring(0, 20) + '...');

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('[Server] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Server] Failed to fetch history:', response.status, errorText);
      return [];
    }

    const data = await response.json();
    console.log('[Server] History data:', data);
    console.log('[Server] History count:', data.history?.length || 0);
    return data.history || [];
  } catch (error) {
    console.error('[Server] Error fetching history:', error);
    return [];
  }
}

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard/user/history');
  }

  const accessToken = session.user.accessToken;
  const history = await getHistory(accessToken);

  return <HistoryClient history={history} />;
}
