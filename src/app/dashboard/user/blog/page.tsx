// app/dashboard/user/blog/page.tsx
import { Metadata } from 'next';
import DashboardBlogClient from './DashboardBlogClient';
import { getBlogPosts, getBlogCategories } from '@/lib/blog-api';

export const metadata: Metadata = {
  title: 'Blog - Sat Yoga',
  description: 'Explore transformative insights, spiritual wisdom, and practical guidance from the Sat Yoga community.',
};

// Transform blog posts from FastAPI format to DashboardBlogClient format
function transformPostsForDashboard(posts: any[]) {
  return posts.map(post => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || '',
    publishedAt: post.published_at || post.created_at,
    author: {
      name: post.author_name || 'Sat Yoga',
      imageUrl: post.author_image || ''
    },
    category: post.category?.name || 'Uncategorized',
    readTime: post.read_time || 5,
    image: post.featured_image || '',
    isFeatured: post.is_featured,
  }));
}

// This is a server component that fetches blog posts and categories from the API
export default async function DashboardBlogPage() {
  try {
    // Blog page content
    const blogPageContent = {
      eyebrow: 'BLOG',
      title: 'Sat Yoga Blog',
      description: 'Reflections, teachings, and stories from the spiritual path—offering insight, inspiration, and a glimpse into life at the Sat Yoga Ashram.'
    };

    // Fetch published blog posts from FastAPI
    console.log("Fetching blog posts for dashboard blog page...");
    const blogResponse = await getBlogPosts(1, 20, undefined, undefined, undefined, true);
    console.log(`Fetched ${blogResponse.posts.length} blog posts`);

    // Fetch all blog categories from FastAPI
    console.log("Fetching blog categories...");
    const categories = await getBlogCategories();
    console.log(`Fetched ${categories.length} categories from FastAPI`);

    // Transform the categories to simple strings
    const categoryNames = categories.map(cat => cat.name);

    // Create the full categories array with 'All' and 'Featured articles' at the beginning
    const allCategories = ['All', 'Featured articles', ...categoryNames];
    console.log("All categories:", allCategories);

    // Transform the blog posts to match the DashboardBlogClient component format
    const transformedPosts = transformPostsForDashboard(blogResponse.posts);

    // Render the DashboardBlogClient component with the transformed posts and categories
    return (
      <DashboardBlogClient
        initialPosts={transformedPosts}
        initialCategories={allCategories}
        pageContent={blogPageContent}
      />
    );
  } catch (error) {
    console.error("Error loading blog page data:", error);

    // Render error message in case of error
    return (
      <div className="min-h-screen lg:min-h-[125vh] bg-[#FAF8F1]">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Blog</h1>
          <p className="mb-4">We encountered a problem while loading the blog content.</p>
          <p className="text-gray-600 mb-8">Please try again later.</p>
        </div>
      </div>
    );
  }
}
