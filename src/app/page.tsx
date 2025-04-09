// app/page.tsx (using App Router in Next.js 13+)

import { homeApi } from '@/lib/strapi';
import HomePage from '@/components/homepage/HomePage';

// This is a server component that fetches data
export default async function Home() {
  try {
    console.log("Fetching homepage data from Strapi...");
    
    // Fetch the main homepage data from Strapi
    const homeData = await homeApi.getHomePageData();
    console.log("Homepage data fetched successfully");
    
    // Fetch the latest blog posts (limit to 5 for the homepage)
    console.log("Fetching blog posts...");
    const blogResponse: any = await homeApi.getFeaturedBlogPosts(5);
    console.log("Blog response structure:", JSON.stringify(blogResponse, null, 2).substring(0, 300) + "...");
    
    const blogPostsData = blogResponse?.data || [];
    console.log(`Fetched ${blogPostsData.length} blog posts`);
    
    // Transform blog posts from Strapi format to what BlogCard expects
    const transformedBlogPosts = blogPostsData.map((post: any) => {
      // Extract data from Strapi structure
      const postData = post.attributes || {};
      
      // Format the date
      const publishDate = postData.publishedAt 
        ? new Date(postData.publishedAt).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })
        : 'No date';
      
      // Get category name
      const category = postData.category?.data?.attributes?.name || 'Uncategorized';
      
      // Extract author data
      const authorData = {
        name: postData.author?.data?.attributes?.name || 'Anonymous',
        imageUrl: postData.author?.data?.attributes?.avatar?.data?.attributes?.url || ''
      };
      
      // Get image URL
      const imageUrl = postData.featuredImage?.data?.attributes?.url || '';
      
      // Return transformed post data
      return {
        title: postData.title || 'Untitled',
        excerpt: postData.excerpt || 'No excerpt available.',
        category: category,
        author: authorData,
        date: publishDate,
        slug: postData.slug || `post-${post.id}`,
        imageUrl: imageUrl,
        readTime: postData.readTime || 5
      };
    });
    
    // Combine all data needed for the homepage
    const pageData = {
      ...homeData,
      blogPosts: transformedBlogPosts
    };
    
    // Log the transformed blog posts for verification
    console.log("Transformed blog posts:", JSON.stringify(transformedBlogPosts, null, 2));
    
    // Pass the data to your client component
    return <HomePage data={pageData} />;
  } catch (error) {
    console.error("Error loading homepage data:", error);
    
    // Return an error message
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Homepage</h1>
        <p className="mb-4">We encountered a problem while loading the homepage content.</p>
        <p className="text-gray-600 mb-8">Please check the browser console for detailed error information.</p>
        <p className="bg-gray-100 p-4 rounded-md text-left mx-auto max-w-2xl overflow-auto">
          <code>{error instanceof Error ? error.message : String(error)}</code>
        </p>
      </div>
    );
  }
}