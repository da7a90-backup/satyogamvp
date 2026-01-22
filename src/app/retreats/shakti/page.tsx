// app/retreats/shakti/page.tsx

import ShaktiPage from "@/components/retreats/shakti/Shakti";
import { staticContentAPI } from '@/lib/static-content-api';

// Force dynamic rendering (don't pre-render at build time)
export const dynamic = 'force-dynamic';

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

async function getRetreatData(slug: string) {
  try {
    const res = await fetch(`${FASTAPI_URL}/api/retreats/${slug}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!res.ok) {
      console.error('Failed to fetch retreat data:', res.status);
      return null;
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching retreat data:', error);
    return null;
  }
}

// This is a server component that fetches data
export default async function Shakti() {
  try {
    console.log("Fetching retreats/shakti data from backend API...");

    // Fetch both page content and retreat data in parallel
    const [pageData, retreatData] = await Promise.all([
      staticContentAPI.getPage('retreats-shakti'),
      getRetreatData('shakti')
    ]);

    console.log("Retreats/shakti data loaded successfully:", Object.keys(pageData));
    if (retreatData) {
      console.log("Retreat booking data loaded from API");
    }

    // Pass the data to your client component
    return <ShaktiPage data={pageData} retreatData={retreatData} />;
  } catch (error) {
    console.error("Error loading retreats/shakti page data:", error);

    // Return an error message
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Shakti Retreat Page</h1>
        <p className="mb-4">We encountered a problem while loading the retreat page content.</p>
        <pre className="bg-gray-100 p-4 rounded-md text-left mx-auto max-w-2xl overflow-auto">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }
}