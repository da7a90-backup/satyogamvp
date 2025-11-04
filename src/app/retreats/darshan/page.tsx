// app/retreats/darshan/page.tsx

import DarshanPage from "@/components/retreats/darshan/Darshan";
import { staticContentAPI } from '@/lib/static-content-api';

// Force dynamic rendering (don't pre-render at build time)
export const dynamic = 'force-dynamic';

// This is a server component that fetches data
export default async function Darshan() {
  try {
    console.log("Fetching retreats/darshan data from backend API...");

    const pageData = await staticContentAPI.getPage('retreats-darshan');

    console.log("Retreats/darshan data loaded successfully:", Object.keys(pageData));

    // Pass the data to your client component
    return <DarshanPage data={pageData} />;
  } catch (error) {
    console.error("Error loading retreats/darshan page data:", error);

    // Return an error message
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Darshan Retreat Page</h1>
        <p className="mb-4">We encountered a problem while loading the retreat page content.</p>
        <pre className="bg-gray-100 p-4 rounded-md text-left mx-auto max-w-2xl overflow-auto">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }
}