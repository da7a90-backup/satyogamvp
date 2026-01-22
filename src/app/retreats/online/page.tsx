// app/retreats/online/page.tsx

import OnlinePage from "@/components/retreats/online/Online";
import { staticContentAPI } from '@/lib/static-content-api';

// Force dynamic rendering (don't pre-render at build time)
export const dynamic = 'force-dynamic';

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

// Fetch products from store (past retreat portal products only)
async function getStoreProducts() {
  try {
    // Use trailing slash and filter by type in API call for efficiency
    const res = await fetch(`${FASTAPI_URL}/api/products/?published=true&product_type=RETREAT_PORTAL_ACCESS&limit=3`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      console.error('Failed to fetch products:', res.status);
      return [];
    }

    const data = await res.json();
    console.log(`Fetched ${data.length} RETREAT_PORTAL_ACCESS products:`, data.map((p: any) => p.title));

    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Fetch online retreats from API
async function getOnlineRetreats() {
  try {
    const res = await fetch(`${FASTAPI_URL}/api/retreats/?retreat_type=online`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      console.error('Failed to fetch online retreats:', res.status);
      return [];
    }

    const data = await res.json();
    return data.retreats || [];
  } catch (error) {
    console.error('Error fetching online retreats:', error);
    return [];
  }
}

// This is a server component that fetches data
export default async function OnlineRetreat() {
  try {
    console.log("Fetching retreats/online page data from backend API...");

    // Fetch page data from backend
    const pageData = await staticContentAPI.getPage('retreats-online');

    // Fetch online retreats
    const retreats = await getOnlineRetreats();
    console.log(`Fetched ${retreats.length} online retreats`);

    // Fetch products for past retreats section
    const products = await getStoreProducts();
    console.log(`Fetched ${products.length} products`);

    console.log("Retreats/online data loaded successfully:", Object.keys(pageData));

    // Pass all data sources to the component
    return <OnlinePage data={pageData} retreats={retreats} products={products} />;
  } catch (error) {
    console.error("Error loading page data:", error);

    // Return an error message
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Online Retreats Page</h1>
        <p className="mb-4">We encountered a problem while loading the page content.</p>
        <pre className="bg-gray-100 p-4 rounded-md text-left mx-auto max-w-2xl overflow-auto">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }
}