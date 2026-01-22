"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Heart, Filter } from "lucide-react";
import Image from "next/image";

// Types
interface Author {
  name: string;
  imageUrl?: string;
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  author: Author;
  category: string;
  readTime: number;
  image: string;
  isFeatured?: boolean;
}

interface PageContent {
  eyebrow: string;
  title: string;
  description: string;
}

interface DashboardBlogClientProps {
  initialPosts: BlogPost[];
  initialCategories: string[];
  pageContent: PageContent;
}

export default function DashboardBlogClient({
  initialPosts,
  initialCategories,
  pageContent,
}: DashboardBlogClientProps) {
  const router = useRouter();
  const [posts] = useState<BlogPost[]>(initialPosts);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter posts based on category and search
  const filteredPosts = posts.filter((post) => {
    const categoryMatch =
      activeCategory === "All" ||
      (activeCategory === "Featured articles" && post.isFeatured) ||
      post.category === activeCategory;

    const searchMatch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

    return categoryMatch && searchMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + itemsPerPage);

  // Featured post
  const featuredPost =
    activeCategory === "All"
      ? posts.find((post) => post.isFeatured) || posts[0]
      : filteredPosts[0];

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col bg-[#FAF8F1] min-h-screen lg:min-h-[125vh]">
      {/* Header Section */}
      <div className="flex flex-col px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-6 sm:pb-8 border-b border-[#E5E7EB]">
        {/* Page header with search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1
            className="text-xl sm:text-2xl leading-tight font-[550] text-[#181D27]"
            style={{ fontFamily: "Optima, serif" }}
          >
            Blog
          </h1>

          {/* Search Input */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#D5D7DA] rounded-lg shadow-sm w-full sm:w-[280px] md:w-[320px]">
            <Search className="w-5 h-5 text-[#717680] flex-shrink-0" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearch}
              className="flex-1 text-sm sm:text-base text-[#717680] outline-none bg-transparent min-w-0"
              style={{ fontFamily: "Avenir Next, sans-serif" }}
            />
            <div className="hidden sm:block px-1 py-0.5 border border-[#E9EAEB] rounded text-xs text-[#717680] mix-blend-multiply flex-shrink-0">
              ⌘K
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col p-4 sm:p-6 md:p-8 gap-6">
        {/* Featured Blog Section */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2
              className="text-lg sm:text-xl leading-tight sm:leading-7 font-semibold text-[#181D27]"
              style={{ fontFamily: "Avenir Next, sans-serif" }}
            >
              {pageContent.title}
            </h2>
            <p
              className="text-sm sm:text-base leading-relaxed sm:leading-6 text-[#414651]"
              style={{ fontFamily: "Avenir Next, sans-serif" }}
            >
              {pageContent.description}
            </p>
          </div>

          {/* Featured Blog Card */}
          {featuredPost && (
            <div className="relative flex flex-col md:flex-row w-full md:h-[322px] bg-white border border-[#D2D6DB] rounded-lg overflow-hidden">
              {/* Image Section */}
              <div
                className="relative w-full md:w-[420px] lg:w-[560px] h-[240px] sm:h-[280px] md:h-[322px] flex-shrink-0 cursor-pointer bg-gray-100"
                onClick={() => router.push(`/dashboard/user/blog/${featuredPost.slug}`)}
              >
                {featuredPost.image ? (
                  <Image
                    src={featuredPost.image}
                    alt={featuredPost.title}
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

                {/* Featured Badge */}
                <div className="absolute left-[18px] top-[20px] z-10">
                  <span
                    className="inline-flex items-center px-[10px] py-1 rounded-lg text-sm font-medium bg-white border border-[#D5D7DA] shadow-sm text-[#414651]"
                    style={{ fontFamily: "Avenir Next, sans-serif" }}
                  >
                    Featured blog
                  </span>
                </div>

                {/* Heart Icon */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="absolute top-0 right-0 w-20 h-20 flex items-center justify-center z-10"
                  aria-label="Favorite"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                </button>
              </div>

              {/* Content Section */}
              <div className="flex flex-col justify-between p-6 sm:p-8 md:p-10 lg:p-12 flex-1">
                <div className="flex flex-col gap-3 sm:gap-4 w-full">
                  {/* Read time */}
                  <div>
                    <span
                      className="text-xs sm:text-sm font-semibold text-black"
                      style={{ fontFamily: "Avenir Next, sans-serif" }}
                    >
                      {featuredPost.readTime} min read
                    </span>
                  </div>

                  {/* Title */}
                  <h2
                    className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight sm:leading-[44px] text-black w-full"
                    style={{ fontFamily: "Optima, Georgia, serif", letterSpacing: "-0.02em" }}
                  >
                    {featuredPost.title}
                  </h2>

                  {/* Excerpt */}
                  <p
                    className="text-sm sm:text-base leading-relaxed sm:leading-6 text-[#414651] w-full line-clamp-3"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {featuredPost.excerpt}
                  </p>
                </div>

                {/* Button */}
                <button
                  onClick={() => router.push(`/dashboard/user/blog/${featuredPost.slug}`)}
                  className="inline-flex items-center justify-center px-4 py-2 sm:py-[10px] text-sm sm:text-base font-semibold text-white rounded-lg w-fit bg-[#7D1A13] shadow-[0px_1px_2px_rgba(16,24,40,0.05),inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_rgba(10,13,18,0.05)] hover:shadow-lg transition-all mt-4"
                  style={{ fontFamily: "Avenir Next, sans-serif" }}
                >
                  Read more
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Blog List Section */}
        <div className="flex flex-col gap-4 sm:gap-6 pt-6 sm:pt-8">
          {/* Tabs and Controls */}
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Category Tabs */}
            <div className="border-b border-[#E9EAEB] overflow-x-auto">
              <div className="flex items-center gap-3 sm:gap-4 min-w-max pb-0.5">
                {initialCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-1 pb-3 text-xs sm:text-sm font-semibold whitespace-nowrap ${
                      activeCategory === category
                        ? "border-b-2 border-[#7D1A13] text-[#7D1A13]"
                        : "text-[#717680]"
                    }`}
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Item count and Filters */}
            <div className="flex items-center justify-between">
              <span
                className="text-xs sm:text-sm font-semibold text-[#111927]"
                style={{ fontFamily: "Avenir Next, sans-serif" }}
              >
                {filteredPosts.length} {filteredPosts.length === 1 ? 'item' : 'items'}
              </span>

              <button
                className="flex items-center gap-2 px-3 py-2 bg-white border border-[#D5D7DA] rounded-lg shadow-sm text-xs sm:text-sm font-semibold text-[#414651] hover:bg-gray-50"
                style={{ fontFamily: "Avenir Next, sans-serif" }}
              >
                <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                Filters
              </button>
            </div>
          </div>

          {/* Blog Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {paginatedPosts.map((post) => (
              <div
                key={post.id}
                className="rounded-lg overflow-hidden bg-white border border-[#D2D6DB] h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/dashboard/user/blog/${post.slug}`)}
              >
                {/* Image Section */}
                <div className="relative bg-gray-100 aspect-video">
                  {/* Heart Icon Overlay */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="absolute top-0 right-0 w-20 h-20 flex items-center justify-center z-10"
                    aria-label="Favorite"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                  </button>

                  {post.image ? (
                    <Image
                      src={post.image}
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
                <div className="p-4 sm:p-6 flex-grow flex flex-col gap-2">
                  {/* Category */}
                  <span
                    className="text-xs sm:text-sm font-semibold text-[#942017]"
                    style={{ fontFamily: "Avenir Next, sans-serif" }}
                  >
                    {post.category}
                  </span>

                  {/* Title */}
                  <h3
                    className="text-lg sm:text-xl font-semibold mb-2 line-clamp-2 text-black"
                    style={{ fontFamily: "Avenir Next, sans-serif" }}
                  >
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p
                    className="text-sm sm:text-base mb-4 line-clamp-2 flex-grow text-[#384250]"
                    style={{ fontFamily: "Avenir Next, sans-serif" }}
                  >
                    {post.excerpt}
                  </p>
                </div>

                {/* Author Section */}
                <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                  <div className="flex items-center gap-2">
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
                          <span
                            className="text-sm font-semibold text-gray-600"
                            style={{ fontFamily: "Avenir Next, sans-serif" }}
                          >
                            {post.author.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs sm:text-sm font-semibold truncate text-black"
                        style={{ fontFamily: "Avenir Next, sans-serif" }}
                      >
                        {post.author.name}
                      </p>
                      <div
                        className="flex items-center text-xs sm:text-sm text-black"
                        style={{ fontFamily: "Avenir Next, sans-serif" }}
                      >
                        <span className="truncate">{formatDate(post.publishedAt)}</span>
                        <span className="mx-1 sm:mx-2">•</span>
                        <span className="whitespace-nowrap">{post.readTime} min read</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 sm:gap-3 pt-5 border-t border-[#E9EAEB]">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-2 sm:px-3 py-2 rounded-lg border shadow-sm text-xs sm:text-sm font-semibold ${
                currentPage === 1
                  ? "bg-white border-[#E9EAEB] text-[#A4A7AE] cursor-not-allowed"
                  : "bg-white border-[#E9EAEB] text-[#A4A7AE] hover:bg-gray-50"
              }`}
              style={{ fontFamily: "Avenir Next, sans-serif" }}
            >
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </button>

            <div className="flex gap-0.5 sm:gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium ${
                    currentPage === page
                      ? "bg-[#FAFAFA] text-[#252B37]"
                      : "text-[#535862] hover:bg-gray-50"
                  }`}
                  style={{ fontFamily: "Avenir Next, sans-serif" }}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-2 sm:px-3 py-2 rounded-lg border shadow-sm text-xs sm:text-sm font-semibold ${
                currentPage === totalPages
                  ? "bg-white border-[#D5D7DA] text-[#414651] cursor-not-allowed opacity-50"
                  : "bg-white border-[#D5D7DA] text-[#414651] hover:bg-gray-50"
              }`}
              style={{ fontFamily: "Avenir Next, sans-serif" }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
