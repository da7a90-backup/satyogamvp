
// components/sections/BlogSection.tsx (Updated)
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Types
export interface Author {
  name: string;
  imageUrl?: string;
}

export interface BlogPost {
  title: string;
  excerpt: string;
  category: string;
  author: Author;
  date: string;
  slug: string;
  imageUrl?: string;
  readTime: number;
}

interface BlogCardProps {
  post: BlogPost;
  showExcerpts?: boolean;
  showAuthors?: boolean;
  showDates?: boolean;
}

export const BlogCard: React.FC<BlogCardProps> = ({ 
  post, 
  showExcerpts = true, 
  showAuthors = true, 
  showDates = true 
}) => {
  const { title, excerpt, category, author, date, slug, imageUrl, readTime } = post;
  
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-100 transition-shadow hover:shadow-lg group">
      {/* Image Container */}
      <div className="relative aspect-[4/3] bg-gray-200 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <svg
              className="h-12 w-12 text-gray-400"
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
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#300001] text-white">
            {category}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-medium mb-3 line-clamp-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
          <Link href={`/blog/${slug}`} className="hover:text-[#300001] transition-colors">
            {title}
          </Link>
        </h3>
        
        {/* Excerpt */}
        {showExcerpts && (
          <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            {excerpt}
          </p>
        )}
        
        {/* Author and Date */}
        {(showAuthors || showDates) && (
          <div className="flex items-center pt-4 border-t border-gray-100">
            {showAuthors && (
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 mr-3 flex-shrink-0 overflow-hidden">
                  {author.imageUrl ? (
                    <Image
                      src={author.imageUrl}
                      alt={author.name}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#300001] flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {author.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                    {author.name}
                  </p>
                  {showDates && (
                    <p className="text-xs text-gray-500" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                      {date} • {readTime} min read
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {!showAuthors && showDates && (
              <p className="text-sm text-gray-500" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                {date} • {readTime} min read
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface BlogSectionProps {
  title?: string;
  description?: string;
  posts: BlogPost[];
  viewAllLink?: string;
  viewAllText?: string;
  showExcerpts?: boolean;
  showAuthors?: boolean;
  showDates?: boolean;
}

const BlogSection: React.FC<BlogSectionProps> = ({
  title = "Welcome to our blog",
  description = "Explore transformative insights from Sat Yoga, including deep reflections, spiritual guidance, and practical wisdom to support your journey of self-discovery and liberation.",
  posts = [],
  viewAllLink = "/blog",
  viewAllText = "View all posts",
  showExcerpts = true,
  showAuthors = true,
  showDates = true,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  
  // Logic for pagination
  const itemsPerPage = 3;
  const totalPages = Math.ceil(posts.length / itemsPerPage);
  
  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev));
  };
  
  const handleNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
  };
  
  const visiblePosts = posts.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  
  if (posts.length === 0) {
    return null;
  }
  
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12">
          <div className="max-w-2xl mb-6 lg:mb-0">
            <p className="text-sm font-medium tracking-wide uppercase text-amber-600 mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Latest insights
            </p>
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-4" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              {title}
            </h2>
            <p className="text-gray-700 leading-relaxed" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              {description}
            </p>
          </div>
          
          <Link 
            href={viewAllLink}
            className="inline-flex items-center font-medium text-[#300001] hover:text-[#4a0002] transition-colors"
            style={{ fontFamily: 'Avenir Next, sans-serif' }}
          >
            {viewAllText}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
        
        {/* Blog Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {visiblePosts.map((post, index) => (
            <BlogCard 
              key={`${post.slug}-${index}`} 
              post={post} 
              showExcerpts={showExcerpts}
              showAuthors={showAuthors}
              showDates={showDates}
            />
          ))}
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-12">
            {/* Prev Button */}
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 mr-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              aria-label="Previous page"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* Pagination Dots */}
            <div className="flex space-x-2">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    currentPage === index ? 'bg-[#300001]' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                  type="button"
                />
              ))}
            </div>
            
            {/* Next Button */}
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 ml-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              aria-label="Next page"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;