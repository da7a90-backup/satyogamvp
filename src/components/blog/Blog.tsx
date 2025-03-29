'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Types
export interface Author {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  category: string;
  author: Author;
  publishedAt: string;
  readTime: number;
  isFeatured?: boolean;
}

export type BlogCategory = 'All' | 'Featured articles' | 'Ashram Life' | 'Arts & Culture' | 'Recipes' | 'Essays';

// Featured Blog Component
interface FeaturedBlogProps {
  post: BlogPost;
}

export const FeaturedBlog: React.FC<FeaturedBlogProps> = ({ post }) => {
  if (!post) return null;
  
  return (
    <div className="grid md:grid-cols-2 gap-6 overflow-hidden rounded-lg border border-gray-200 mb-12">
      <div className="relative bg-gray-200 min-h-[300px] md:min-h-full">
        <span className="absolute top-3 left-3 text-xs font-medium py-1 px-2 bg-white rounded z-10">
          Featured blog
        </span>
        
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg 
              className="h-24 w-24 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
          </div>
        )}
      </div>
      
      <div className="p-6 flex flex-col justify-between">
        <div>
          <div className="text-sm text-gray-500 mb-3">
            {post.readTime} min read
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            <Link href={`/blog/${post.slug}`} className="hover:text-purple-700">
              {post.title}
            </Link>
          </h2>
          
          <p className="text-gray-700 mb-6">
            {post.excerpt}
          </p>
        </div>
        
        <Link 
          href={`/blog/${post.slug}`}
          className="inline-block bg-gray-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800 w-fit"
        >
          Read more
        </Link>
      </div>
    </div>
  );
};

// Blog Card Component
interface BlogCardProps {
  post: BlogPost;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  return (
    <div className="rounded-lg overflow-hidden bg-white border border-gray-200 h-full flex flex-col">
      <div className="relative bg-gray-200 aspect-video">
        <button 
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-gray-500 hover:text-gray-900 z-10"
          aria-label="Bookmark article"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
        
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg 
              className="h-16 w-16 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
          </div>
        )}
      </div>
      
      <div className="p-4 flex-grow">
        <div className="text-sm font-medium text-gray-600 mb-2">
          {post.category}
        </div>
        
        <h3 className="text-lg font-bold mb-2 line-clamp-2">
          <Link href={`/blog/${post.slug}`} className="hover:text-purple-700">
            {post.title}
          </Link>
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-2">
          {post.excerpt}
        </p>
      </div>
      
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-200 mr-3 flex-shrink-0">
            {post.author.imageUrl ? (
              <Image
                src={post.author.imageUrl}
                alt={post.author.name}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {post.author.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium">{post.author.name}</p>
            <div className="flex items-center text-xs text-gray-500">
              <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span className="mx-1">•</span>
              <span>{post.readTime} min read</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Blog Category Filter
interface BlogCategoryFilterProps {
  categories: Array<BlogCategory>;
  activeCategory: BlogCategory;
  onCategoryChange: (category: BlogCategory) => void;
}

export const BlogCategoryFilter: React.FC<BlogCategoryFilterProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <div className="border-b border-gray-200 mb-8 overflow-x-auto">
      <div className="flex min-w-max">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`py-3 px-4 text-sm font-medium whitespace-nowrap ${
              activeCategory === category
                ? 'text-gray-900 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

// Blog Pagination
interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const BlogPagination: React.FC<BlogPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const displayPages = 5; // Number of page buttons to display
  
  // Calculate start and end page for the pagination display
  let startPage = Math.max(1, currentPage - Math.floor(displayPages / 2));
  let endPage = Math.min(totalPages, startPage + displayPages - 1);
  
  // Adjust startPage if endPage limit is reached
  if (endPage - startPage + 1 < displayPages && startPage > 1) {
    startPage = Math.max(1, endPage - displayPages + 1);
  }
  
  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  
  return (
    <div className="flex items-center justify-between py-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center text-sm font-medium ${
          currentPage === 1
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:text-purple-700'
        }`}
      >
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </button>
      
      <div className="flex space-x-1">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 flex items-center justify-center text-sm rounded-md ${
              currentPage === page
                ? 'bg-gray-900 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="w-8 h-8 flex items-center justify-center text-sm text-gray-500">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="w-8 h-8 flex items-center justify-center text-sm rounded-md text-gray-700 hover:bg-gray-100"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center text-sm font-medium ${
          currentPage === totalPages
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:text-purple-700'
        }`}
      >
        Next
        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

// Blog Filter and Sort Controls
interface BlogControlsProps {
  totalItems: number;
  onSortChange: (sort: string) => void;
  onFilterClick: () => void;
}

export const BlogControls: React.FC<BlogControlsProps> = ({
  totalItems,
  onSortChange,
  onFilterClick,
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="text-sm text-gray-600">
        <span className="font-medium">{totalItems}</span> items
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center text-sm">
          <span className="mr-2">Sort by</span>
          <select 
            onChange={(e) => onSortChange(e.target.value)}
            className="py-1 px-2 border border-gray-300 rounded-md bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
        
        <button
          onClick={onFilterClick}
          className="flex items-center py-1 px-3 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </button>
      </div>
    </div>
  );
};

// Main Blog Page Component
interface BlogPageProps {
  initialPosts?: BlogPost[];
  initialCategory?: BlogCategory;
}

export const BlogPage: React.FC<BlogPageProps> = ({
  initialPosts = [],
  initialCategory = 'All',
}) => {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(initialPosts);
  const [activeCategory, setActiveCategory] = useState<BlogCategory>(initialCategory);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const postsPerPage = 6;
  
  // Available categories - could be dynamic based on your data
  const categories: BlogCategory[] = ['All', 'Featured articles', 'Ashram Life', 'Arts & Culture', 'Recipes', 'Essays'];
  
  // Featured post is the first featured post or the first post
  const featuredPost = posts.find(post => post.isFeatured) || posts[0];
  
  // Filter posts based on active category
  const filterPosts = (category: BlogCategory, allPosts: BlogPost[]) => {
    if (category === 'All') {
      return allPosts;
    } else if (category === 'Featured articles') {
      return allPosts.filter((post) => post.isFeatured);
    } else {
      return allPosts.filter((post) => post.category === category);
    }
  };
  
  // Sort posts based on the selected sort option
  const sortPosts = (postsToSort: BlogPost[], sortOption: string) => {
    const sortedPosts = [...postsToSort];
    
    switch (sortOption) {
      case 'newest':
        return sortedPosts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      case 'oldest':
        return sortedPosts.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
      case 'popular':
        // This would ideally be based on view count or some popularity metric
        // For this example, we'll just use read time as a proxy for popularity
        return sortedPosts.sort((a, b) => b.readTime - a.readTime);
      default:
        return sortedPosts;
    }
  };
  
  // Apply filtering and sorting
  useEffect(() => {
    let result = filterPosts(activeCategory, posts);
    result = sortPosts(result, sortBy);
    setFilteredPosts(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [activeCategory, posts, sortBy]);
  
  // Get current posts for pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  
  // Change page
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Change category
  const handleCategoryChange = (category: BlogCategory) => {
    setActiveCategory(category);
  };
  
  // Change sort
  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };
  
  // Handle filter button click
  const handleFilterClick = () => {
    // This would typically open a filter modal or dropdown
    console.log('Filter button clicked');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <div className="text-purple-600 text-sm font-medium mb-2">Blog</div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Sat Yoga Blog</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.
        </p>
      </div>
      
      {/* Featured Blog Post */}
      {featuredPost && <FeaturedBlog post={featuredPost} />}
      
      {/* Category Filter */}
      <BlogCategoryFilter
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />
      
      {/* Blog Controls */}
      <BlogControls
        totalItems={filteredPosts.length}
        onSortChange={handleSortChange}
        onFilterClick={handleFilterClick}
      />
      
      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentPosts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <BlogPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

// Blog Post Page Component
interface BlogPostPageProps {
  post: BlogPost;
  relatedPosts?: BlogPost[];
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({
  post,
  relatedPosts = [],
}) => {
  if (!post) return null;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/blog" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8">
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Blog
      </Link>
      
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-gray-200 mr-3">
              {post.author.imageUrl ? (
                <Image
                  src={post.author.imageUrl}
                  alt={post.author.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {post.author.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="font-medium">{post.author.name}</p>
              <div className="flex items-center text-sm text-gray-500">
                <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span className="mx-1">•</span>
                <span>{post.readTime} min read</span>
              </div>
            </div>
          </div>
        </div>
        
        {post.featuredImage && (
          <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        
        <div className="prose prose-lg max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
        
        <div className="border-t border-gray-200 pt-8 mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-sm font-medium mr-2">Tags:</div>
              <div className="flex items-center space-x-2">
                <Link href={`/blog/category/${post.category.toLowerCase().replace(' ', '-')}`} className="text-sm bg-gray-100 text-gray-700 py-1 px-3 rounded-full hover:bg-gray-200">
                  {post.category}
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
              <button className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {relatedPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {relatedPosts.map((relatedPost) => (
                <BlogCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Export all the components
//export { FeaturedBlog, BlogCard, BlogCategoryFilter, BlogPagination, BlogControls, BlogPage, BlogPostPage };