// app/dashboard/user/dharma-bandhara/page.tsx
import { Metadata } from 'next';
import DashboardStoreClient from './DashboardStoreClient';
import { productsApi } from '@/lib/store-api';
import { staticContentAPI } from '@/lib/static-content-api';

export const metadata: Metadata = {
  title: 'The Dharma Bandhara - Sat Yoga',
  description: 'The Sat Yoga Online Store is a treasure trove of life-altering knowledge, in the form of unrepeatable retreats, paradigm-shifting books, beautiful guided meditations, as well as the popular Reading the Sages audio collections.',
};

// Transform products from FastAPI format to DashboardStoreClient format
function transformProductsForDashboard(products: any[]) {
  return products.map(product => ({
    id: product.id,
    slug: product.slug,
    title: product.title,
    price: Number(product.price),
    image: product.featured_image || product.thumbnail_url || '',
    type: product.type,
    short_description: product.short_description || product.description || '',
    description: product.description || '',
    categories: product.categories || [],
    tags: product.tags || [],
    featured: product.featured || false,
    created_at: product.created_at,
  }));
}

// This is a server component that fetches products and categories from the API
export default async function DashboardStorePage() {
  try {
    // Fetch store page content from static content API
    console.log("Fetching store page content from static content API...");
    const pageData = await staticContentAPI.getPage('store');

    // Extract header section content
    const storePageContent = {
      eyebrow: pageData.header?.eyebrow || 'STORE',
      title: pageData.header?.heading || 'The Dharma Bandhara',
      description: pageData.header?.description || ''
    };

    // Fetch all products from FastAPI
    console.log("Fetching products for dashboard store page...");
    const products = await productsApi.getProducts({ limit: 1000 });
    console.log(`Fetched ${products.length} products`);

    // Fetch all categories from FastAPI
    console.log("Fetching product categories...");
    const categoriesData = await productsApi.getCategories();
    console.log(`Fetched ${categoriesData.length} categories from FastAPI`);

    // Transform the categories to simple strings
    const categoryNames = categoriesData.map(cat => cat.name);

    // Create the full categories array with 'All products' at the beginning
    const allCategories = ['All products', ...categoryNames];
    console.log("All categories:", allCategories);

    // Transform the products to match the DashboardStoreClient component format
    const transformedProducts = transformProductsForDashboard(products);

    // Render the DashboardStoreClient component with the transformed products and categories
    return (
      <DashboardStoreClient
        initialProducts={transformedProducts}
        initialCategories={allCategories}
        pageContent={storePageContent}
      />
    );
  } catch (error) {
    console.error("Error loading store page data:", error);

    // Render error message in case of error
    return (
      <div className="min-h-screen lg:min-h-[125vh] bg-[#FAF8F1]">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Store</h1>
          <p className="mb-4">We encountered a problem while loading the store content.</p>
          <p className="text-gray-600 mb-8">Please try again later.</p>
        </div>
      </div>
    );
  }
}
