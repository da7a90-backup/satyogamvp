// app/about/shunyamurti/page.tsx

import AboutShunyaPage from "@/components/aboutPage/AboutShunyamurti";
import { staticContentAPI } from '@/lib/static-content-api';

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

// Fetch books from Hidden Tags API
async function getBooks() {
  try {
    // Fetch books tagged for this page via Hidden Tags API
    const res = await fetch(`${FASTAPI_URL}/api/hidden-tags/page/about/shunyamurti/books`, {
      cache: 'no-store' // Disable caching for fresh data
    });

    if (!res.ok) {
      console.error('Failed to fetch books from hidden tags:', res.status);
      return [];
    }

    const taggedData = await res.json();

    // Extract the entity_data from each tagged item
    const books = taggedData.map((tag: any) => tag.entity_data);

    return books;
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
}

// Fetch online retreats from the API (using new unified retreats API)
async function getOnlineRetreats() {
  try {
    const res = await fetch(`${FASTAPI_URL}/api/retreats?type=online&limit=1`, {
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
    const retreats = (data.retreats || []).map((retreat: any) => ({
      ...retreat,
      // Add computed fields for card display
      price: retreat.price || retreat.price_lifetime || retreat.price_limited || 195,
      fixed_date: retreat.fixed_date || computeFixedDate(retreat.start_date, retreat.end_date),
    }));

    return { retreats, total: data.total || 0 };
  } catch (error) {
    console.error('Error fetching online retreats:', error);
    return { retreats: [], total: 0 };
  }
}

// Helper to format date
function computeFixedDate(startDate: string | null, endDate: string | null): string | null {
  if (!startDate || !endDate) return null;
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startMonth = start.toLocaleDateString('en-US', { month: 'long' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'long' });
    const year = start.getFullYear();
    if (start.getMonth() === end.getMonth()) {
      return `${startMonth} ${start.getDate()}-${end.getDate()}, ${year}`;
    }
    return `${startMonth} ${start.getDate()}-${endMonth} ${end.getDate()}, ${year}`;
  } catch {
    return null;
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
