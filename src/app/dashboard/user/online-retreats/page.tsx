import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import RetreatsClient from "@/components/dashboard/retreat/RetreatsClient";

// Fetch user's registered online retreats
async function getUserOnlineRetreats(accessToken: string) {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
    const response = await fetch(`${API_BASE_URL}/api/retreats/my-registrations`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch user retreats:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    // Transform registrations to retreat format for the client
    // Filter only ONLINE retreats
    const retreats = (data.registrations || [])
      .filter((reg: any) => reg.retreat?.type === 'ONLINE')
      .map((reg: any) => ({
        ...reg.retreat,
        // Add registration metadata
        registered_at: reg.registered_at,
        registration_status: reg.status,
        access_type: reg.access_type,
        access_expires_at: reg.access_expires_at,
        can_access: reg.can_access,
        is_registered: true,
      }));

    return retreats;
  } catch (error) {
    console.error('Error fetching user online retreats:', error);
    return [];
  }
}

// Fetch all available online retreats
async function getAvailableOnlineRetreats(accessToken?: string) {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available (optional user for this endpoint)
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/retreats/?retreat_type=online`, {
      cache: 'no-store',
      headers,
    });

    if (!response.ok) {
      console.error('Failed to fetch retreats:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    return data.retreats || [];
  } catch (error) {
    console.error('Error fetching available online retreats:', error);
    return [];
  }
}

export default async function OnlineRetreatsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  // Get the FastAPI access token from session
  const accessToken = session.user.accessToken;

  if (!accessToken) {
    console.error('No access token available in session');
    return (
      <div className="min-h-screen bg-[#FAF8F1] p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-[#000000] mb-4">My Online Retreats</h1>
          <p className="text-[#717680]">Authentication error. Please try logging in again.</p>
        </div>
      </div>
    );
  }

  // Fetch retreats data server-side
  const [userRetreats, availableRetreats] = await Promise.all([
    getUserOnlineRetreats(accessToken),
    getAvailableOnlineRetreats(accessToken),
  ]);

  return (
    <RetreatsClient
      userRetreats={userRetreats}
      availableRetreats={availableRetreats}
    />
  );
}
