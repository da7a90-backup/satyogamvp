// app/retreats/sevadhari/page.tsx

import SevadhariPage from "@/components/retreats/sevadhari/Sevadhari";
import { staticContentAPI } from '@/lib/static-content-api';

// This is a server component that fetches data
export default async function Sevadhari() {
  try {
    console.log("Fetching retreats/sevadhari data from backend API...");

    const pageData = await staticContentAPI.getPage('retreats-sevadhari');

    console.log("Retreats/sevadhari data loaded successfully:", Object.keys(pageData));

    // Pass the data to your client component
    return <SevadhariPage data={pageData} />;
  } catch (error) {
    console.error("Error loading retreats/sevadhari page data:", error);

    // Return an error message
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Sevadhari Retreat Page</h1>
        <p className="mb-4">We encountered a problem while loading the retreat page content.</p>
        <pre className="bg-gray-100 p-4 rounded-md text-left mx-auto max-w-2xl overflow-auto">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }
}