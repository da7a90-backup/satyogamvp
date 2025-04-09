import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogPost, BlogPostPage } from '@/components/blog/Blog';
import { blogApi } from '@/lib/strapi';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

// Transform a single Strapi blog post to the expected format
function transformStrapiPost(post: any) {
  if (!post) return null;
  
  const attrs = post.attributes;
  console.log("Post attributes:", JSON.stringify(attrs, null, 2));
  console.log("Author data:", JSON.stringify(attrs.author, null, 2));
  
  // Get the author data, handling different possible structures
  let authorData = {
    id: '0',
    name: 'Unknown',
    imageUrl: '',
  };
  
  if (attrs.author) {
    // If author is just a string (simple name)
    if (typeof attrs.author === 'string') {
      authorData = {
        id: '0',
        name: attrs.author,
        imageUrl: '',
      };
    }
    // If author is a data object (relational field)
    else if (attrs.author.data) {
      const authorAttrs = attrs.author.data.attributes;
      authorData = {
        id: attrs.author.data.id.toString(),
        name: authorAttrs.name || authorAttrs.username || 'Unknown',
        imageUrl: authorAttrs.avatar?.data?.attributes?.url || '',
      };
    } 
    // If author is directly embedded (not in data property)
    else if (attrs.author.name || attrs.author.username) {
      authorData = {
        id: attrs.author.id?.toString() || '0',
        name: attrs.author.name || attrs.author.username || 'Unknown',
        imageUrl: attrs.author.avatar?.url || '',
      };
    }
  }
  
  return {
    id: post.id.toString(),
    title: attrs.title || '',
    slug: attrs.slug || '',
    excerpt: attrs.excerpt || '',
    content: attrs.content || '',
    featuredImage: attrs.featuredImage?.data?.attributes?.url || '',
    category: attrs.category?.data?.attributes?.name || 'Uncategorized',
    author: authorData,
    publishedAt: attrs.publishedAt || new Date().toISOString(),
    readTime: attrs.readTime || Math.ceil(((attrs.content || '').length / 1000) * 2), // Estimate reading time
    isFeatured: attrs.isFeatured || false,
  };
}

// Transform related posts
function transformStrapiPosts(strapiData: any) {
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
      readTime: attrs.readTime || Math.ceil(((attrs.content || '').length / 1000) * 2),
      isFeatured: attrs.isFeatured || false,
    };
  });
}

// Generate metadata for the blog post
export async function generateMetadata(
  { params }: BlogPostPageProps
): Promise<Metadata> {
  // Wait for the params object to be fully available
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;
  
  try {
    // Fetch the blog post from Strapi using blogApi
    const post = await blogApi.getBlogPostBySlug(slug);
    
    // If no post is found, return a generic title
    if (!post) {
      return {
        title: 'Blog Post Not Found - Sat Yoga',
      };
    }
    
    const attrs = post.attributes;
    
    // Use SEO data if available, otherwise use post title and excerpt
    return {
      title: attrs.seo?.metaTitle || `${attrs.title} - Sat Yoga Blog`,
      description: attrs.seo?.metaDescription || attrs.excerpt,
      keywords: attrs.seo?.keywords?.split(',') || [],
      openGraph: {
        title: attrs.seo?.metaTitle || attrs.title,
        description: attrs.seo?.metaDescription || attrs.excerpt,
        images: attrs.featuredImage?.data ? [
          {
            url: attrs.featuredImage.data.attributes.url,
            alt: attrs.title,
          }
        ] : [],
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
  // Wait for the params object to be fully available
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;
  
  try {
    // Fetch the blog post from Strapi using blogApi
    const post = await blogApi.getBlogPostBySlug(slug);
    
    // If post not found, return 404
    if (!post) {
      notFound();
    }
    
    // Transform the post data
    const transformedPost = transformStrapiPost(post);
    
    // Double-check that transformation worked
    if (!transformedPost) {
      console.error('Post transformation failed');
      notFound();
    }
    
   // Get the category ID for related posts
   const categoryId = post.attributes.category?.data?.id;
   const postId = post.id;
   
   // Fetch related posts with the same category
   let relatedPosts = [];
   try {
     // Make sure we pass numbers or valid strings that can be parsed to integers
     const relatedPostsData = await blogApi.getRelatedPosts(
       String(categoryId || ''), 
       String(postId), 
       2
     );
     relatedPosts = transformStrapiPosts(relatedPostsData);
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