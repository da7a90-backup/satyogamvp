// app/page.tsx (using App Router in Next.js 13+)

import HomePage from '@/components/homepage/Homepage';

// This is a server component that fetches data
export default async function Home() {
  try {
    console.log("Fetching homepage data from Strapi...");
  
    
    // Pass the data to your client component
    return <HomePage />;
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