'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Heart, Play } from 'lucide-react';

interface Teaching {
  id: string;
  thumbnail_url: string;
  title: string;
  description: string;
  duration: number;
  slug: string;
  category_type: string;
}

interface TeachingLibraryData {
  featuredTeaching: Teaching;
  categories: Array<{
    label: string;
    key: string;
  }>;
  allTeachings: Teaching[];
}

interface DashboardTeachingLibraryProps {
  data: TeachingLibraryData;
  userTier: string;
  userId: string;
}

export default function DashboardTeachingLibrary({
  data,
  userTier,
  userId,
}: DashboardTeachingLibraryProps) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter teachings based on active category
  const filteredTeachings = useMemo(() => {
    const categoryKey = data.categories[activeCategory].key;
    return data.allTeachings.filter(t => t.category_type === categoryKey);
  }, [activeCategory, data.allTeachings, data.categories]);

  // Paginate teachings
  const paginatedTeachings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTeachings.slice(startIndex, endIndex);
  }, [filteredTeachings, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredTeachings.length / itemsPerPage);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Featured Teaching - Dashboard Style */}
      {data.featuredTeaching && (
        <section className="w-full">
          <div className="flex flex-row items-start justify-between mb-4">
            <h2 className="text-base lg:text-lg font-semibold text-[#181D27]">Featured teaching</h2>
          </div>

          <Link href={`/dashboard/user/teachings/${data.featuredTeaching.slug}`}>
            <div className="relative w-full min-h-[200px] lg:h-[240px] bg-white border border-[#D1D1D1] rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row h-full">
                {/* Thumbnail */}
                <div className="relative w-full lg:w-[426px] h-[200px] lg:h-full bg-gray-900 flex-shrink-0">
                  {data.featuredTeaching.thumbnail_url && (
                    <Image
                      src={data.featuredTeaching.thumbnail_url}
                      alt={data.featuredTeaching.title}
                      fill
                      className="object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20" />

                  {/* Play button */}
                  <button className="absolute inset-0 m-auto w-16 h-16 flex items-center justify-center bg-white rounded-full hover:scale-105 transition">
                    <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
                  </button>

                  {/* Duration badge */}
                  <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/40 backdrop-blur-sm rounded text-white text-xs font-medium">
                    Video
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col p-4 gap-4 flex-grow">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-[#7D1A13]">Video Teaching</span>
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#384250]">
                        <Clock className="w-4 h-4 text-[#535862]" />
                        {Math.floor((data.featuredTeaching.duration || 2700) / 60)} minutes
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-[#181D27] line-clamp-2">
                      {data.featuredTeaching.title}
                    </h3>
                    <p className="text-base text-[#535862] line-clamp-3">
                      {data.featuredTeaching.description}
                    </p>
                  </div>
                </div>

                {/* Favorite button */}
                <button className="absolute top-4 right-4 w-13 h-13 flex items-center justify-center bg-white/40 rounded-full hover:bg-white/60 transition">
                  <div className="w-12 h-12 flex items-center justify-center bg-white/40 rounded-full">
                    <Heart className="w-5 h-5" />
                  </div>
                </button>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Category Tabs */}
      <div className="mb-2 -mx-4 sm:mx-0">
        <div
          className="border-b flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-0"
          style={{
            borderColor: '#E9EAEB',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {data.categories.map((category, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveCategory(index);
                setCurrentPage(1);
              }}
              className="pb-3 px-2 sm:px-1 relative whitespace-nowrap flex-shrink-0 min-h-[44px] flex items-center text-sm font-semibold"
              style={{
                color: activeCategory === index ? '#AB261B' : '#717680'
              }}
            >
              {category.label}
              {activeCategory === index && (
                <div
                  className="absolute bottom-0 left-0 right-0"
                  style={{
                    height: '2px',
                    backgroundColor: '#942017'
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Teachings Count */}
      <div className="flex flex-row items-start justify-between">
        <p className="text-base sm:text-lg font-semibold text-[#111927]">
          {filteredTeachings.length} Items
          {totalPages > 1 && (
            <span className="text-sm sm:text-base text-[#717680] ml-2">
              (Page {currentPage} of {totalPages})
            </span>
          )}
        </p>
      </div>

      {/* Teachings Grid - Dashboard Style */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        {paginatedTeachings.map((teaching: Teaching) => (
          <Link key={teaching.id} href={`/dashboard/user/teachings/${teaching.slug}`} className="flex flex-col">
            <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden mb-3">
              {teaching.thumbnail_url && (
                <Image
                  src={teaching.thumbnail_url}
                  alt={teaching.title}
                  fill
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/15" />

              <button className="absolute inset-0 m-auto w-16 h-16 flex items-center justify-center bg-white rounded-full hover:scale-105 transition">
                <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
              </button>

              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded text-white text-[10px] font-medium">
                Video
              </div>

              <button className="absolute top-4 right-4 w-13 h-13 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition">
                <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full">
                  <Heart className="w-5 h-5 text-white" />
                </div>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-[#7D1A13]">Video Teaching</span>
                <div className="flex items-center gap-2 text-sm font-semibold text-[#384250]">
                  <Clock className="w-4 h-4 text-[#535862]" />
                  {Math.floor((teaching.duration || 2700) / 60)} min
                </div>
              </div>
              <h3 className="text-xl font-semibold text-black line-clamp-2">
                {teaching.title}
              </h3>
              <p className="text-base text-[#384250] line-clamp-3">
                {teaching.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 sm:gap-4 mt-8">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 sm:px-4 py-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm font-semibold text-[#414651]"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#D5D7DA',
            }}
          >
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </button>

          <div className="flex gap-1 sm:gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-colors text-sm font-semibold"
                    style={{
                      backgroundColor: page === currentPage ? '#7D1A13' : '#FFFFFF',
                      color: page === currentPage ? '#FFFFFF' : '#414651',
                      border: page === currentPage ? 'none' : '1px solid #D5D7DA',
                    }}
                  >
                    {page}
                  </button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="flex items-center text-sm">...</span>;
              }
              return null;
            })}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 sm:px-4 py-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm font-semibold text-[#414651]"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#D5D7DA',
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
