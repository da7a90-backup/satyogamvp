// app/about/ashram/page.tsx

import AboutAshramPage from "@/components/aboutPage/AboutAshram";
import { staticContentAPI } from '@/lib/static-content-api';

// This is a server component that fetches data
export default async function AboutAshram() {
  try {
    console.log("Fetching about/ashram data from backend API...");

    // Fetch about-ashram page data from FastAPI backend
    const pageData = await staticContentAPI.getPage('about-ashram');
    console.log("About/ashram data loaded successfully:", Object.keys(pageData));

    // Pass the data to your client component
    return <AboutAshramPage data={pageData} />;
  } catch (error) {
    console.error("Error loading about page data:", error);

    // Return an error message
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading about page</h1>
        <p className="mb-4">We encountered a problem while loading the about page content.</p>
        <pre className="bg-gray-100 p-4 rounded-md text-left mx-auto max-w-2xl overflow-auto">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }
}