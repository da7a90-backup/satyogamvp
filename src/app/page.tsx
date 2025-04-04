// app/page.tsx (using App Router in Next.js 13+)

import { getHomePageData, getBlogPosts } from '@/lib/api';
import HomePage from '@/components/homepage/HomePage'; // The component I created earlier

// This is a server component that fetches data
export default async function Home() {
  try {
    // Fetch the main homepage data from Strapi
    const homeData = await getHomePageData();
    
    // Fetch the latest blog posts (limit to 5 for the homepage)
    const blogResponse = await getBlogPosts(1, 5);
    const blogPosts = blogResponse.data;
    
    // Combine all data needed for the homepage
    const pageData = {
      ...homeData,
      blogPosts
    };
    
    // Pass the data to your client component
    return <HomePage data={pageData} />;
  } catch (error) {
    console.error("Error loading homepage data:", error);
    
    // You might want to render an error state or fallback content
    return <div>Error loading homepage content</div>;
  }
}