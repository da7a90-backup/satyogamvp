// app/blog/page.tsx
import { Metadata } from 'next';
import { BlogPage } from '@/components/blog/Blog';
import { blogApi } from '@/lib/strapi';
import { transformBlogPosts } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Blog - Sat Yoga',
  description: 'Explore transformative insights, spiritual wisdom, and practical guidance from the Sat Yoga community.',
};

// This is a server component that fetches blog posts and categories from the API
export default async function BlogPageRoute() {
  try {
    // Fetch all blog posts
    console.log("Fetching blog posts for blog page...");
    const blogResponse: any = await blogApi.getPosts(1, 20, "", "publishedAt:desc");
    console.log(`Fetched ${blogResponse?.data?.length || 0} blog posts`);
    
    // Fetch all blog categories from Strapi
    console.log("Fetching blog categories...");
    const categoriesResponse = await blogApi.getAllCategories();
    const strapiCategories = categoriesResponse?.data || [];
    console.log(`Fetched ${strapiCategories.length} categories from Strapi`);
    
    // Transform the categories from Strapi format to simple strings
    const categoryNames = strapiCategories.map((cat:any) => 
      cat.attributes.name as string
    );
    
    // Create the full categories array with 'All' and 'Featured articles' at the beginning
    const allCategories = ['All', 'Featured articles', ...categoryNames];
    console.log("All categories:", allCategories);
    
    // Transform the blog posts to match the BlogPage component format
    const transformedPosts = transformBlogPosts(blogResponse?.data || []);
    
    // Render the BlogPage component with the transformed posts and categories
    return <BlogPage 
      initialPosts={transformedPosts} 
      initialCategories={allCategories}
    />;
  } catch (error) {
    console.error("Error loading blog page data:", error);
    
    // Render the BlogPage with an empty array in case of error
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Blog</h1>
        <p className="mb-4">We encountered a problem while loading the blog content.</p>
        <p className="text-gray-600 mb-8">Please try again later.</p>
      </div>
    );
  }
}