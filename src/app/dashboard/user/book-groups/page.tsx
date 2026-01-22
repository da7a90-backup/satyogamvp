import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import BookGroupsClient from '@/components/dashboard/book-groups/BookGroupsClient';
import { BookGroupListResponse, FeaturedBookGroup } from '@/types/book-group';

const API_BASE_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

// Fetch featured book group
async function getFeaturedBookGroup(accessToken?: string): Promise<FeaturedBookGroup | null> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/book-groups/featured`, {
      cache: 'no-store',
      headers,
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      console.error('Failed to fetch featured book group:', response.status);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching featured book group:', error);
    return null;
  }
}

// Fetch all book groups
async function getBookGroups(accessToken?: string): Promise<BookGroupListResponse> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/book-groups?page=1&page_size=100`,
      {
        cache: 'no-store',
        headers,
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch book groups:', response.status);
      return { total: 0, items: [], page: 1, page_size: 100 };
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching book groups:', error);
    return { total: 0, items: [], page: 1, page_size: 100 };
  }
}

// Fetch user's book group accesses
async function getUserBookGroupAccesses(accessToken: string): Promise<string[]> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    };

    // Get all book groups to check access for each
    const bookGroupsResponse = await fetch(
      `${API_BASE_URL}/api/book-groups?page=1&page_size=100`,
      {
        cache: 'no-store',
        headers,
      }
    );

    if (!bookGroupsResponse.ok) {
      return [];
    }

    const bookGroupsData: BookGroupListResponse = await bookGroupsResponse.json();
    const accessIds: string[] = [];

    // For now, we'll do a simple check based on membership
    // In a real implementation, you'd query the book_group_accesses table
    // For this implementation, we'll assume Gyani+ users have access to non-purchase book groups
    // This is a simplified version - the backend will handle the full logic

    // Note: This is a temporary solution. The proper way would be to add an endpoint
    // like GET /api/book-groups/my-accesses that returns all book group IDs the user has access to

    // For now, return empty array - the backend will handle access checks on individual portals
    return accessIds;
  } catch (error) {
    console.error('Error fetching user book group accesses:', error);
    return [];
  }
}

export const dynamic = 'force-dynamic';

export default async function BookGroupsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const accessToken = session.user.accessToken;

  if (!accessToken) {
    console.error('No access token available in session');
    return (
      <div className="min-h-screen bg-[#FAF8F1] p-8">
        <div className="max-w-7xl mx-auto">
          <h1
            className="text-4xl font-bold text-[#000000] mb-4"
            style={{ fontFamily: 'Optima, serif' }}
          >
            Book Groups
          </h1>
          <p className="text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            Authentication error. Please try logging in again.
          </p>
        </div>
      </div>
    );
  }

  // Fetch all data in parallel
  const [featuredBookGroup, bookGroupsData, userAccessIds] = await Promise.all([
    getFeaturedBookGroup(accessToken),
    getBookGroups(accessToken),
    getUserBookGroupAccesses(accessToken),
  ]);

  return (
    <BookGroupsClient
      featuredBookGroup={featuredBookGroup}
      bookGroups={bookGroupsData.items}
      userAccessIds={userAccessIds}
    />
  );
}
