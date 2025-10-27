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
    const response = await fetch(`${API_URL}/api/teachings/favorites/list`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch favorites:', response.status);
      return [];
    }

    const data = await response.json();
    return data.favorites || [];
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
}

export default async function FavouritesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard/user/favourites');
  }

  const accessToken = (session.user as any).accessToken;
  const favorites = await getFavorites(accessToken);

  return <FavouritesClient favorites={favorites} />;
}
