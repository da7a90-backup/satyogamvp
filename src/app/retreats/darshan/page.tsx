// app/page.tsx (using App Router in Next.js 13+)

import DarshanPage from "@/components/retreats/darshan/Darshan";



// This is a server component that fetches data
export default async function Darshan() {
  try {
    console.log("Fetching homepage data from Strapi...");
  
    
    // Pass the data to your client component
    return <DarshanPage
     />;
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