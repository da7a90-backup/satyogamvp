// app/blog/page.tsx
import { Metadata } from 'next';
import { BlogPage } from '@/components/blog/Blog';
import { getBlogPosts, getBlogCategories } from '@/lib/blog-api';

export const metadata: Metadata = {
  title: 'Blog - Sat Yoga',
  description: 'Explore transformative insights, spiritual wisdom, and practical guidance from the Sat Yoga community.',
};

// Transform blog posts from FastAPI format to BlogPage format
function transformPostsForBlogPage(posts: any[]) {
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
    image: post.featured_image || '/images/blog/default.jpg',
    isFeatured: post.is_featured,
  }));
}

// This is a server component that fetches blog posts and categories from the API
export default async function BlogPageRoute() {
  try {
    // Fetch published blog posts from FastAPI
    console.log("Fetching blog posts for blog page...");
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

    // Transform the blog posts to match the BlogPage component format
    const transformedPosts = transformPostsForBlogPage(blogResponse.posts);

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