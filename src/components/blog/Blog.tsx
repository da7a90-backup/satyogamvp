'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MarkdownRenderer from './MarkdownRenderer';

// Add custom fonts configuration
const avenirNext = {
  fontFamily: 'Avenir Next, system-ui, -apple-system, sans-serif',
};

const optima = {
  fontFamily: 'Optima, Georgia, serif',
};

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

export type BlogCategory = string;

// Featured Blog Component
interface FeaturedBlogProps {
  post: BlogPost;
}

export const FeaturedBlog: React.FC<FeaturedBlogProps> = ({ post }) => {
  if (!post) return null;

  return (
    <div
      className="mb-12 mx-auto overflow-hidden rounded-lg border border-[#D2D6DB] bg-white shadow-sm hover:shadow-md transition-shadow"
      style={{
        width: '923px',
        maxWidth: '100%',
        aspectRatio: '923 / 337'
      }}
    >
      <div className="flex flex-col md:flex-row h-full">
        {/* Image Section */}
        <div className="relative bg-gray-100 w-full md:w-[33.6%] h-[200px] md:h-full">
          {/* Featured Badge */}
          <div className="absolute top-4 left-4 z-10">
            <span
              className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium border"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#D5D7DA',
                color: '#414651',
                ...avenirNext
              }}
            >
              Featured blog
            </span>
          </div>

          {/* Heart Icon */}
          <button
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors z-10"
            aria-label="Favorite"
          >
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>

          {post.featuredImage ? (
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <svg
                className="h-24 w-24 text-gray-300"
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

        {/* Content Section */}
        <div className="w-full md:w-[66.4%] p-6 md:p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-4">
            <span
              className="text-sm font-semibold"
              style={{ color: '#000000', ...avenirNext }}
            >
              {post.readTime} min read
            </span>
          </div>

          <h2
            className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight"
            style={{ ...optima }}
          >
            <Link
              href={`/blog/${post.slug}`}
              className="hover:text-[#7D1A13] transition-colors"
            >
              {post.title}
            </Link>
          </h2>

          <p
            className="text-base md:text-lg mb-6 leading-relaxed line-clamp-2"
            style={{ color: '#414651', ...avenirNext }}
          >
            {post.excerpt}
          </p>

          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white rounded-lg w-fit transition-all hover:shadow-lg"
            style={{
              backgroundColor: '#7D1A13',
              ...avenirNext
            }}
          >
            Read more
          </Link>
        </div>
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
    <div className="rounded-lg overflow-hidden bg-white border border-[#D2D6DB] h-full flex flex-col hover:shadow-lg transition-shadow">
      {/* Image Section */}
      <div className="relative bg-gray-100 aspect-video">
        {/* Heart Icon Overlay */}
        <button
          className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors z-10"
          aria-label="Favorite"
        >
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
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
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <svg
              className="h-16 w-16 text-gray-300"
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

      {/* Content Section */}
      <div className="p-6 flex-grow flex flex-col">
        {/* Category */}
        <div className="mb-2">
          <span
            className="text-sm font-semibold"
            style={{ color: '#942017', ...avenirNext }}
          >
            {post.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold mb-2 line-clamp-2" style={{ ...avenirNext }}>
          <Link
            href={`/blog/${post.slug}`}
            className="hover:text-[#7D1A13] transition-colors"
          >
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p
          className="text-base mb-4 line-clamp-3 flex-grow"
          style={{ color: '#384250', ...avenirNext }}
        >
          {post.excerpt}
        </p>
      </div>

      {/* Author Section */}
      <div className="px-6 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
            {post.author.imageUrl ? (
              <Image
                src={post.author.imageUrl}
                alt={post.author.name}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-600" style={{ ...avenirNext }}>
                  {post.author.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ ...avenirNext }}>
              {post.author.name}
            </p>
            <div className="flex items-center text-sm" style={{ color: '#000000', ...avenirNext }}>
              <span className="truncate">
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span className="mx-2">•</span>
              <span className="whitespace-nowrap">{post.readTime} min read</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Blog Category Filter
interface BlogCategoryFilterProps {
  categories: Array<string>;  // Changed from Array<BlogCategory>
  activeCategory: string;     // Changed from BlogCategory
  onCategoryChange: (category: string) => void;  // Changed from (category: BlogCategory) => void
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

// Main Blog Page Component with Dynamic Categories
interface BlogPageProps {
  initialPosts?: BlogPost[];
  initialCategory?: string;
  initialCategories?: string[];
}

export const BlogPage: React.FC<BlogPageProps> = ({
  initialPosts = [],
  initialCategory = 'All',
  initialCategories,
}) => {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(initialPosts);
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const postsPerPage = 6;
  
  // Use the categories passed from the server or fallback to default
  // This is where we replace the hardcoded array with dynamic categories from Strapi
  const categories = initialCategories || ['All', 'Featured articles'];
  
  // Featured post is the first featured post or the first post
  const featuredPost = posts.find(post => post.isFeatured) || posts[0];
  
  // Filter posts based on active category
  const filterPosts = (category: string, allPosts: BlogPost[]) => {
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
  const handleCategoryChange = (category: string) => {
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
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F1' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-12 md:py-20">
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16">
          <div
            className="text-base font-semibold tracking-wide uppercase mb-4"
            style={{ color: '#9C7520', ...avenirNext }}
          >
            BLOG
          </div>
          <h1
            className="text-5xl md:text-7xl font-medium mb-6 tracking-tight"
            style={{ ...optima, letterSpacing: '-0.02em', lineHeight: '1.25' }}
          >
            Sat Yoga Blog
          </h1>
          <p
            className="text-lg leading-relaxed"
            style={{ color: '#414651', ...avenirNext }}
          >
            Reflections, teachings, and stories from the spiritual path—offering insight, inspiration, and a glimpse into life at the Sat Yoga Ashram.
          </p>
        </div>

        {/* Featured Blog Post */}
        {featuredPost && <FeaturedBlog post={featuredPost} />}

        {/* Category Tabs */}
        <div className="border-b mb-8 overflow-x-auto" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex min-w-max gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`py-3 px-1 text-sm font-semibold whitespace-nowrap transition-colors relative ${
                  activeCategory === category
                    ? 'border-b-2'
                    : 'hover:text-gray-900'
                }`}
                style={{
                  color: activeCategory === category ? '#7D1A13' : '#717680',
                  borderColor: activeCategory === category ? '#7D1A13' : 'transparent',
                  ...avenirNext,
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Controls */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-lg font-semibold" style={{ color: '#111927', ...avenirNext }}>
            <span className="font-semibold">{filteredPosts.length}</span> items
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleFilterClick}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border transition-all hover:bg-white"
              style={{
                borderColor: '#D5D7DA',
                color: '#535862',
                ...avenirNext,
              }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.67}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filters
            </button>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {currentPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 py-8 border-t" style={{ borderColor: '#E9EAEB' }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white"
              style={{
                borderColor: '#E9EAEB',
                color: currentPage === 1 ? '#A4A7AE' : '#414651',
                ...avenirNext,
              }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.67}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous
            </button>

            <div className="flex items-center gap-0.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className="w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-colors"
                  style={{
                    backgroundColor: currentPage === page ? '#FAFAFA' : 'transparent',
                    color: currentPage === page ? '#252B37' : '#535862',
                    ...avenirNext,
                  }}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white"
              style={{
                borderColor: '#D5D7DA',
                color: currentPage === totalPages ? '#A4A7AE' : '#414651',
                ...avenirNext,
              }}
            >
              Next
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.67}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Blog Post Page Component
interface BlogPostPageProps {
  post: BlogPost;
  relatedPosts?: BlogPost[];
  basePath?: string;
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({
  post,
  relatedPosts = [],
  basePath = '/blog',
}) => {
  if (!post) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F1' }}>
      {/* Hero Section with Background Image */}
      <div
        className="relative h-[500px] md:h-[693px] flex items-center justify-center"
        style={{
          backgroundImage: post.featuredImage ? `linear-gradient(0deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${post.featuredImage})` : 'linear-gradient(180deg, #7D1A13 0%, #4E2223 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-3xl mx-auto px-4 text-center z-10">
          {/* Category Badge */}
          <div className="mb-4">
            <span
              className="inline-block px-4 py-1 text-base font-semibold uppercase tracking-wide"
              style={{ color: '#FFFFFF', ...avenirNext }}
            >
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-medium mb-12 text-white leading-tight"
            style={{ ...optima, letterSpacing: '-0.02em' }}
          >
            {post.title}
          </h1>

          {/* Author Info */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
              {post.author.imageUrl ? (
                <Image
                  src={post.author.imageUrl}
                  alt={post.author.name}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-600" style={{ ...avenirNext }}>
                    {post.author.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white mb-1" style={{ ...avenirNext }}>
                {post.author.name}
              </p>
              <div className="flex items-center gap-2 text-sm text-white" style={{ ...avenirNext }}>
                <span>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span>•</span>
                <span>{post.readTime} min read</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
        {/* Back Button */}
        <Link
          href={basePath}
          className="inline-flex items-center gap-2 mb-8 text-sm font-semibold transition-colors"
          style={{ color: '#7D1A13', ...avenirNext }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.67}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back
        </Link>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-8 text-base" style={{ ...avenirNext }}>
          <Link href={basePath} className="hover:text-[#7D1A13] transition-colors">
            Blog
          </Link>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
          <span>{post.category}</span>
        </div>

        {/* Share Buttons (Top) */}
        <div className="flex justify-between items-center mb-8 pb-8 border-b" style={{ borderColor: '#E5E7EB' }}>
          <div className="text-base" style={{ ...avenirNext }}>Share this post</div>
          <div className="flex items-center gap-2">
            <button
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
              aria-label="Copy link"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </button>
            <button
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
              aria-label="Share on LinkedIn"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
              </svg>
            </button>
            <button
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
              aria-label="Share on X"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>
            <button
              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
              aria-label="Share on Facebook"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Article Body */}
        <div
          className="prose prose-lg max-w-none mb-12"
          style={{
            ...avenirNext,
            fontSize: '18px',
            lineHeight: '28px',
            color: '#414651',
          }}
        >
          <MarkdownRenderer content={post.content} />
        </div>

        {/* Share & Tags Section */}
        <div className="flex flex-col items-center gap-12 py-12 border-t border-b" style={{ borderColor: '#E5E7EB' }}>
          {/* Share This Post */}
          <div className="flex flex-col items-center gap-4">
            <div className="text-lg font-semibold" style={{ ...avenirNext }}>
              Share this post
            </div>
            <div className="flex items-center gap-2">
              <button
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                aria-label="Copy link"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </button>
              <button
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                aria-label="Share on LinkedIn"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                </svg>
              </button>
              <button
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                aria-label="Share on X"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
              <button
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                aria-label="Share on Facebook"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2">
            <Link
              href={`${basePath}?category=${post.category}`}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors text-sm font-semibold"
              style={{ ...avenirNext }}
            >
              {post.category}
            </Link>
          </div>

          {/* Author Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
              {post.author.imageUrl ? (
                <Image
                  src={post.author.imageUrl}
                  alt={post.author.name}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-600" style={{ ...avenirNext }}>
                    {post.author.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold mb-1" style={{ ...avenirNext }}>
                {post.author.name}
              </p>
              <p className="text-sm text-gray-600" style={{ ...avenirNext }}>
                Author
              </p>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-16 pt-12 border-t" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="text-3xl md:text-4xl font-medium mb-8" style={{ ...optima }}>
            Comments
          </h2>

          {/* Comment Form */}
          <div className="mb-12 p-6 bg-white rounded-lg border" style={{ borderColor: '#E5E7EB' }}>
            <h3 className="text-xl font-semibold mb-4" style={{ ...avenirNext }}>
              Leave a comment
            </h3>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: '#414651', ...avenirNext }}>
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                  style={{ borderColor: '#D2D6DB', ...avenirNext }}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#414651', ...avenirNext }}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                  style={{ borderColor: '#D2D6DB', ...avenirNext }}
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="comment" className="block text-sm font-medium mb-2" style={{ color: '#414651', ...avenirNext }}>
                  Comment
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent resize-none"
                  style={{ borderColor: '#D2D6DB', ...avenirNext }}
                  placeholder="Share your thoughts..."
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 text-sm font-semibold text-white rounded-lg transition-all hover:shadow-lg"
                style={{ backgroundColor: '#7D1A13', ...avenirNext }}
              >
                Post Comment
              </button>
            </form>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4" style={{ ...avenirNext }}>
              1 Comment
            </h3>

            {/* Sample Comment */}
            <div className="p-6 bg-white rounded-lg border" style={{ borderColor: '#E5E7EB' }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-600" style={{ ...avenirNext }}>
                    J
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold" style={{ ...avenirNext }}>John Doe</span>
                    <span className="text-sm text-gray-500" style={{ ...avenirNext }}>
                      • 2 days ago
                    </span>
                  </div>
                  <p className="text-base leading-relaxed mb-3" style={{ color: '#414651', ...avenirNext }}>
                    Thank you for this insightful article. The perspectives shared here really resonated with my own journey of self-discovery.
                  </p>
                  <button className="text-sm font-medium hover:underline" style={{ color: '#7D1A13', ...avenirNext }}>
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-4xl md:text-5xl font-medium mb-12 text-center" style={{ ...optima }}>
              Related posts
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
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