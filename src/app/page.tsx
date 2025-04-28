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
    const blogResponse = await homeApi.getFeaturedBlogPosts(5);
    
    // Log the first blog post structure
    if (blogResponse?.data?.[0]) {
      console.log("Sample blog post structure:", 
        JSON.stringify(blogResponse.data[0], null, 2)
      );
    }
    
    const blogPostsData = blogResponse?.data || [];
    console.log(`Fetched ${blogPostsData.length} blog posts`);
    
    // Transform blog posts from Strapi format to what BlogCard expects
    const transformedBlogPosts = blogPostsData.map((post: any) => {
      // Extract attributes from the post
      const postData = post.attributes || {};
      
      // Format the date
      const publishDate = postData.publishedAt 
        ? new Date(postData.publishedAt).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })
        : 'No date';
      
      // Create the blog post with a simple author object
      // Since author is just a text field, we create an author object with just the name
      return {
        title: postData.title || 'Untitled',
        excerpt: postData.excerpt || 'No excerpt available.',
        category: postData.category || 'Uncategorized',
        author: {
          name: postData.author || 'Unknown',  // Extract author from the text field
          imageUrl: ''  // No image URL since it's just a text field
        },
        date: publishDate,
        slug: postData.slug || `post-${post.id}`,
        imageUrl: postData.featuredImage?.data?.attributes?.url || '',
        readTime: postData.readTime || 5
      };
    });
    
    // Log the transformed blog posts
    console.log("First transformed blog post:", 
      transformedBlogPosts.length > 0 ? JSON.stringify(transformedBlogPosts[0], null, 2) : "No posts"
    );
    
    // Combine all data needed for the homepage
    const pageData = {
      ...homeData,
      blogPosts: transformedBlogPosts
    };
    
    // Pass the data to your client component
    return <HomePage data={pageData} />;
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