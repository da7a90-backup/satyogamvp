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
}

export const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  const { title, excerpt, category, author, date, slug, imageUrl, readTime } = post;
  
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-100 transition-shadow hover:shadow-md">
      {/* Image Container */}
      <div className="relative aspect-w-16 aspect-h-9 bg-gray-200">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
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
      </div>
      
      {/* Content */}
      <div className="p-5">
        {/* Category */}
        <p className="text-sm font-medium text-gray-600 mb-2">
          {category}
        </p>
        
        {/* Title */}
        <h3 className="text-xl font-bold mb-2 line-clamp-2">
          <Link href={`/blog/${slug}`} className="hover:text-purple-700">
            {title}
          </Link>
        </h3>
        
        {/* Excerpt */}
        <p className="text-gray-600 mb-4 line-clamp-3">
          {excerpt}
        </p>
        
        {/* Author and Date */}
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-200 mr-3 flex-shrink-0">
            {author.imageUrl ? (
              <Image
                src={author.imageUrl}
                alt={author.name}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-sm font-medium text-purple-700">
                  {author.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium">{author.name}</p>
            <p className="text-xs text-gray-500">
              {date} • {readTime} min read
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface BlogSectionProps {
  title?: string;
  description?: string;
  posts: BlogPost[];
  viewAllLink?: string;
}

const BlogSection: React.FC<BlogSectionProps> = ({
  title = "Welcome to our blog",
  description = "Explore transformative insights from Sat Yoga, including deep reflections, spiritual guidance, and practical wisdom to support your journey of self-discovery and liberation.",
  posts = [],
  viewAllLink = "/blog",
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  
  // Logic for pagination dots
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
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div className="max-w-2xl mb-6 md:mb-0">
            <p className="text-purple-600 font-medium mb-2">Latest blog</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
            <p className="text-gray-600">{description}</p>
          </div>
          
          <Link 
            href={viewAllLink}
            className="inline-flex items-center font-medium text-gray-900 hover:text-purple-700"
          >
            View all
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
        
        {/* Blog Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {visiblePosts.map((post, index) => (
            <BlogCard key={index} post={post} />
          ))}
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-10">
            {/* Prev Button */}
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 mr-4 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className={`w-2 h-2 rounded-full ${
                    currentPage === index ? 'bg-gray-800' : 'bg-gray-300'
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
              className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 ml-4 disabled:opacity-50 disabled:cursor-not-allowed"
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