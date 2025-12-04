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

// Fetch online retreats from the API
async function getOnlineRetreats() {
  try {
    const res = await fetch(`${FASTAPI_URL}/api/online-retreats?limit=1`, {
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
// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export default async function AboutShunyamurti() {
  try {
    console.log("Fetching about/shunyamurti data from backend API...");

    // Fetch page data, books, and online retreats in parallel
    const [pageData, books, onlineRetreatsData] = await Promise.all([
      staticContentAPI.getPage('about-shunyamurti'),
      getBooks(),
      getOnlineRetreats()
    ]);

    console.log("About/shunyamurti data loaded successfully:", Object.keys(pageData));
    console.log(`Fetched ${books.length} books`);
    console.log(`Fetched ${onlineRetreatsData.total} online retreats`);

    // Pass the data to your client component
    return <AboutShunyaPage data={pageData} books={books} onlineRetreatsData={onlineRetreatsData} />;
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
