import { Metadata } from 'next';
import { BlogPage } from '@/components/blog/Blog';
import { blogApi } from '@/lib/strapi';

export const metadata: Metadata = {
  title: 'Blog - Sat Yoga',
  description: 'Explore transformative insights, spiritual wisdom, and practical guidance from the Sat Yoga community.',
};

// Transform Strapi data to the format expected by the BlogPage component
function transformStrapiData(strapiData: any) {
  if (!strapiData || !strapiData.data) return [];
  
  return strapiData.data.map((post: any) => {
    const attrs = post.attributes;
    return {
      id: post.id.toString(),
      title: attrs.title || '',
      slug: attrs.slug || '',
      excerpt: attrs.excerpt || '',
      content: attrs.content || '',
      featuredImage: attrs.featuredImage?.data?.attributes?.url || '',
      category: attrs.category?.data?.attributes?.name || 'Uncategorized',
      author: {
        id: attrs.author?.data?.id?.toString() || '0',
        name: attrs.author?.data?.attributes?.name || 'Unknown',
        imageUrl: attrs.author?.data?.attributes?.avatar?.data?.attributes?.url || '',
      },
      publishedAt: attrs.publishedAt || new Date().toISOString(),
      readTime: attrs.readTime || Math.ceil(((attrs.content || '').length / 1000) * 2), // Estimate reading time
      isFeatured: attrs.isFeatured || false,
    };
  });
}

// This is a server component that fetches blog posts from the API
export default async function BlogPageRoute() {
  try {
    // Fetch blog posts from Strapi using blogApi
    const data = await blogApi.getPosts(1, 12); // page 1, 12 posts per page
    
    // Transform data for the component
    const posts = transformStrapiData(data);
    
    return <BlogPage initialPosts={posts} />;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    
    // Return empty array if fetch fails - you could show an error state instead
    return <BlogPage initialPosts={[]} />;
  }
}