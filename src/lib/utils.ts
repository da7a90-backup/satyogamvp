import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Transform blog posts from Strapi format to the format expected by the BlogCard component
 * @param strapiPosts - Array of posts from Strapi API
 * @returns Array of transformed posts ready for the UI components
 */
export const transformBlogPosts = (strapiPosts: any[]) => {
  if (!Array.isArray(strapiPosts)) {
    console.error("Expected array of blog posts, got:", typeof strapiPosts);
    return [];
  }
  
  return strapiPosts.map(post => {
    // Extract attributes safely
    const attributes = post.attributes || {};
    
    // Format the date from ISO string
    const publishedDate = attributes.publishedAt 
      ? new Date(attributes.publishedAt).toISOString()
      : new Date().toISOString();
    
    // Extract category from relation
    let category = "Uncategorized";
    if (attributes.category?.data?.attributes?.name) {
      category = attributes.category.data.attributes.name;
    }
    
    // Extract featured image URL
    let featuredImageUrl = "";
    if (attributes.featuredImage?.data?.attributes?.url) {
      featuredImageUrl = attributes.featuredImage.data.attributes.url;
    }
    
    // Create the transformed post with required structure
    return {
      id: post.id?.toString() || Math.random().toString(36).substr(2, 9),
      title: attributes.title || "Untitled Post",
      slug: attributes.slug || `post-${post.id}`,
      excerpt: attributes.excerpt || "",
      content: attributes.content || "",
      featuredImage: featuredImageUrl,
      category: category,
      author: {
        id: "1", // Default ID since we're using a text field
        name: attributes.author || "Anonymous",
        imageUrl: "" // No image URL since author is a text field
      },
      publishedAt: publishedDate,
      readTime: attributes.readTime || 5,
      isFeatured: attributes.isFeatured || false
    };
  });
};