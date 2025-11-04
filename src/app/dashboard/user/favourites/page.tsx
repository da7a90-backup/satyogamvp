import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import FavouritesClient from './FavouritesClient';

export const metadata = {
  title: 'My Favourites | Dashboard',
  description: 'View your favorite teachings',
};

async function getFavorites(token: string) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:8000';
    const url = `${API_URL}/api/teachings/favorites/list`;
    console.log('[Server] Fetching favorites from:', url);
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
      console.error('[Server] Failed to fetch favorites:', response.status, errorText);
      return [];
    }

    const data = await response.json();
    console.log('[Server] Favorites data:', data);
    console.log('[Server] Favorites count:', data.favorites?.length || 0);
    return data.favorites || [];
  } catch (error) {
    console.error('[Server] Error fetching favorites:', error);
    return [];
  }
}

export default async function FavouritesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard/user/favourites');
  }

  const accessToken = session.user.accessToken;
  const favorites = await getFavorites(accessToken);

  return <FavouritesClient favorites={favorites} />;
}
