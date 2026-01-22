// app/page.tsx (using App Router in Next.js 13+)

import HomePage from '@/components/homepage/Homepage';
import { staticContentAPI } from '@/lib/static-content-api';
import { unstable_noStore as noStore } from 'next/cache';

// Enable static generation by default, but opt out dynamically for preview
export const revalidate = 3600; // Revalidate every hour in production

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
  try {
    // Check if we're in preview mode
    const params = await searchParams;
    const isPreview = params.preview === 'true';

    if (isPreview) {
      // Opt out of caching for preview mode to prevent stale data
      noStore();
      console.log("[Preview Mode] Loading homepage data...");
    } else {
      console.log("Fetching homepage data from backend API...");
    }

    // Fetch homepage data from FastAPI backend
    const homePageData = await staticContentAPI.getHomepage();

    console.log("Homepage data loaded successfully:", Object.keys(homePageData));

    // Pass the data to your client component
    return <HomePage data={homePageData}/>;
  } catch (error) {
    console.error("Error loading homepage data:", error);

    // Return an error message
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Homepage</h1>
        <p className="mb-4">We encountered a problem while loading the homepage content.</p>
        <pre className="bg-gray-100 p-4 rounded-md text-left mx-auto max-w-2xl overflow-auto">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }
}