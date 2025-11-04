import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogPost, BlogPostPage } from '@/components/blog/Blog';
import { getBlogPostBySlug, getBlogPosts } from '@/lib/blog-api';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Transform FastAPI blog post to BlogPostPage format
function transformFastAPIPost(post: any) {
  if (!post) return null;

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || '',
    content: post.content,
    featuredImage: post.featured_image || '/images/blog/default.jpg',
    category: post.category?.name || 'Uncategorized',
    author: {
      id: '0',
      name: post.author_name || 'Sat Yoga',
      imageUrl: post.author_image || '',
    },
    publishedAt: post.published_at || post.created_at,
    readTime: post.read_time || Math.ceil((post.content.length / 1000) * 2),
    isFeatured: post.is_featured || false,
  };
}

// Transform related posts from FastAPI
function transformFastAPIPosts(posts: any[]) {
  if (!posts || posts.length === 0) return [];

  return posts.map((post: any) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || '',
    content: post.content,
    featuredImage: post.featured_image || '/images/blog/default.jpg',
    category: post.category?.name || 'Uncategorized',
    author: {
      id: '0',
      name: post.author_name || 'Sat Yoga',
      imageUrl: post.author_image || '',
    },
    publishedAt: post.published_at || post.created_at,
    readTime: post.read_time || Math.ceil((post.content.length / 1000) * 2),
    isFeatured: post.is_featured || false,
  }));
}

// Generate metadata for the blog post
export async function generateMetadata(
  { params }: BlogPostPageProps
): Promise<Metadata> {
  const { slug } = await params;

  try {
    // Fetch the blog post from FastAPI
    const post = await getBlogPostBySlug(slug);

    // If no post is found, return a generic title
    if (!post) {
      return {
        title: 'Blog Post Not Found - Sat Yoga',
      };
    }

    // Use SEO data if available, otherwise use post title and excerpt
    return {
      title: post.meta_title || `${post.title} - Sat Yoga Blog`,
      description: post.meta_description || post.excerpt,
      keywords: post.meta_keywords?.split(',') || [],
      openGraph: {
        title: post.meta_title || post.title,
        description: post.meta_description || post.excerpt,
        images: post.featured_image
          ? [
              {
                url: post.featured_image,
                alt: post.title,
              },
            ]
          : [],
      },
    };
  } catch (error) {
    console.error('Error fetching blog post for metadata:', error);
    return {
      title: 'Blog - Sat Yoga',
      description: 'Explore transformative insights from Sat Yoga',
    };
  }
}

export default async function BlogPostPageRoute(
  { params }: BlogPostPageProps
) {
  const { slug } = await params;

  try {
    // Fetch the blog post from FastAPI
    const post = await getBlogPostBySlug(slug);

    // If post not found, return 404
    if (!post) {
      notFound();
    }

    // Transform the post data
    const transformedPost = transformFastAPIPost(post);

    // Double-check that transformation worked
    if (!transformedPost) {
      console.error('Post transformation failed');
      notFound();
    }

    // Fetch related posts from the same category
    let relatedPosts = [];
    try {
      if (post.category_id) {
        const relatedPostsData = await getBlogPosts(
          1,
          3,
          undefined,
          post.category_id,
          undefined,
          true
        );
        // Filter out the current post and limit to 2 related posts
        const filteredPosts = relatedPostsData.posts.filter(p => p.id !== post.id).slice(0, 2);
        relatedPosts = transformFastAPIPosts(filteredPosts);
      }
    } catch (relatedError) {
      // Log but don't fail the whole page if related posts can't be fetched
      console.error('Error fetching related posts:', relatedError);
    }

    return <BlogPostPage post={transformedPost} relatedPosts={relatedPosts} />;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    notFound();
  }
}