// app/retreats/ashram/page.tsx

import AshramStayPage from "@/components/retreats/StayingAtAshram";
import { staticContentAPI } from '@/lib/static-content-api';

// Force dynamic rendering (don't pre-render at build time)
export const dynamic = 'force-dynamic';

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

async function getOnlineRetreats() {
  try {
    const res = await fetch(`${FASTAPI_URL}/api/retreats/?retreat_type=online&limit=1`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!res.ok) {
      console.error('Failed to fetch online retreats:', res.status);
      return { retreats: [], total: 0 };
    }
    const data = await res.json();
    return { retreats: data.retreats || [], total: data.total || 0 };
  } catch (error) {
    console.error('Error fetching online retreats:', error);
    return { retreats: [], total: 0 };
  }
}

// This is a server component that fetches data
export default async function AshramRetreat() {
  try {
    console.log("Fetching retreats/ashram data from backend API...");

    // Fetch both page data and online retreats in parallel
    const [pageData, onlineRetreats] = await Promise.all([
      staticContentAPI.getPage('retreats-ashram'),
      getOnlineRetreats()
    ]);

    console.log("Retreats/ashram data loaded successfully:", Object.keys(pageData));
    console.log("Online retreats loaded:", onlineRetreats.total);

    // Pass the data to your client component
    return <AshramStayPage data={pageData} onlineRetreatsData={onlineRetreats} />;
  } catch (error) {
    console.error("Error loading retreats page data:", error);

    // Return an error message
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Retreats Page</h1>
        <p className="mb-4">We encountered a problem while loading the retreats page content.</p>
        <pre className="bg-gray-100 p-4 rounded-md text-left mx-auto max-w-2xl overflow-auto">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }
}