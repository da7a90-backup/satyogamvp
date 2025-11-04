// app/about/shunyamurti/page.tsx

import AboutShunyaPage from "@/components/aboutPage/AboutShunyamurti";
import { staticContentAPI } from '@/lib/static-content-api';

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

// Fetch books from the API
async function getBooks() {
  try {
    const res = await fetch(`${FASTAPI_URL}/api/products?product_type=EBOOK&limit=10`, {
      cache: 'no-store' // Disable caching for fresh data
    });

    if (!res.ok) {
      console.error('Failed to fetch books:', res.status);
      return [];
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
}

// This is a server component that fetches data
export default async function AboutShunyamurti() {
  try {
    console.log("Fetching about/shunyamurti data from backend API...");

    // Fetch page data and books in parallel
    const [pageData, books] = await Promise.all([
      staticContentAPI.getPage('about-shunyamurti'),
      getBooks()
    ]);

    console.log("About/shunyamurti data loaded successfully:", Object.keys(pageData));
    console.log(`Fetched ${books.length} books`);

    // Pass the data to your client component
    return <AboutShunyaPage data={pageData} books={books} />;
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
