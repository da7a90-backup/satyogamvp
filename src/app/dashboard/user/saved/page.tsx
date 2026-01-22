import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import SavedProductsClient from './SavedProductsClient';

export const metadata = {
  title: 'Saved for Later | Dashboard',
  description: 'View your saved products',
};

async function getBookmarkedProducts(token: string) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:8000';
    const url = `${API_URL}/api/products/bookmarks/list`;
    console.log('[Server] Fetching bookmarks from:', url);

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
      console.error('[Server] Failed to fetch bookmarks:', response.status, errorText);
      return [];
    }

    const data = await response.json();
    console.log('[Server] Bookmarks data:', data);
    console.log('[Server] Bookmarks count:', data.bookmarks?.length || 0);
    return data.bookmarks || [];
  } catch (error) {
    console.error('[Server] Error fetching bookmarks:', error);
    return [];
  }
}

export default async function SavedPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard/user/saved');
  }

  const accessToken = session.user.accessToken;
  const bookmarkedProducts = await getBookmarkedProducts(accessToken);

  return <SavedProductsClient bookmarks={bookmarkedProducts} />;
}
