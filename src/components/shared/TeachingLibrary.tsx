'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

// ============================================================================
// TYPES
// ============================================================================

interface Teaching {
  id: string;
  thumbnail: string;
  title: string;
  description: string;
  date: string;
  duration: string;
  accessType: 'free' | 'restricted';
  mediaType: 'video' | 'audio' | 'text';
  pageCount?: number;
  slug: string;
  categoryType: 'video_teaching' | 'guided_meditation' | 'qa' | 'essay';
}

interface TeachingLibraryData {
  isLoggedIn: boolean;
  sectionTitle: string;
  viewAllLink?: {
    text: string;
    url: string;
  };
  featuredTeaching: Teaching;
  categories: Array<{
    label: string;
    key: 'video_teaching' | 'guided_meditation' | 'qa' | 'essay';
  }>;
  allTeachings: Teaching[];
  totalCount: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

interface TeachingLibrarySectionProps {
  data: TeachingLibraryData;
  showAllTeachings?: boolean; // If true, show all teachings (not limited to 9)
  listFormat?: 'pagination' | 'infinite'; // Display format
  userTier?: string; // For tier-based access control
  isDashboard?: boolean; // Flag for dashboard-specific features
}

const TeachingLibrarySection = ({
  data,
  showAllTeachings = false,
  listFormat = 'pagination',
  userTier,
  isDashboard = false,
}: TeachingLibrarySectionProps) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [savedTeachings, setSavedTeachings] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Show 12 teachings per page in pagination mode

  const toggleSave = (teachingId: string) => {
    setSavedTeachings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(teachingId)) {
        newSet.delete(teachingId);
      } else {
        newSet.add(teachingId);
      }
      return newSet;
    });
  };

  // Filter teachings based on active category
  const filteredTeachings = useMemo(() => {
    const categoryKey = data.categories[activeCategory].key;

    let filtered = data.allTeachings.filter(t => t.categoryType === categoryKey);

    // If not logged in and not showing all teachings, prioritize free teachings and fill up to 9
    if (!data.isLoggedIn && !showAllTeachings) {
      const freeTeachings = filtered.filter(t => t.accessType === 'free');
      const restrictedTeachings = filtered.filter(t => t.accessType === 'restricted');

      // Take up to 9 teachings: prioritize free, then add restricted
      const limit = 9;
      if (freeTeachings.length >= limit) {
        return freeTeachings.slice(0, limit);
      } else {
        const remainingSlots = limit - freeTeachings.length;
        return [...freeTeachings, ...restrictedTeachings.slice(0, remainingSlots)];
      }
    }

    // Dashboard: Show all teachings
    return filtered;
  }, [activeCategory, data.allTeachings, data.isLoggedIn, data.categories, showAllTeachings]);

  // Paginate teachings if in pagination mode
  const paginatedTeachings = useMemo(() => {
    if (!showAllTeachings || listFormat !== 'pagination') {
      return filteredTeachings;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTeachings.slice(startIndex, endIndex);
  }, [filteredTeachings, currentPage, itemsPerPage, showAllTeachings, listFormat]);

  const totalPages = Math.ceil(filteredTeachings.length / itemsPerPage);

  // Handlers for pagination
  const goToPage = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of teachings grid
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section 
      className="w-full py-16 lg:py-28 px-4 lg:px-16"
      style={{ backgroundColor: '#FAF8F1' }}
    >
      <div className="max-w-[1312px] mx-auto">
        {/* Header */}
        {data.sectionTitle && (
          <div className="flex justify-between items-center mb-8">
            <h2
              style={{
                fontFamily: 'Optima, Georgia, serif',
                fontSize: '24px',
                fontWeight: 700,
                lineHeight: '32px',
                color: '#000000'
              }}
            >
              {data.sectionTitle}
            </h2>
            {data.viewAllLink && (
            <button
              className="px-4 py-2.5 border rounded-lg hover:bg-gray-50 transition-colors"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #D5D7DA',
                boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)',
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '16px',
                fontWeight: 600,
                color: '#414651'
              }}
            >
              {data.viewAllLink.text}
            </button>
          )}
        </div>
        )}

        {/* Featured Teaching Card - NOW CLICKABLE */}
        {!isDashboard && (
        <Link
          href={`/teachings/${data.featuredTeaching.slug}`}
          className="bg-white border rounded-lg mb-8 overflow-hidden block hover:shadow-lg transition-shadow"
          style={{ borderColor: '#D2D6DB' }}
        >
          <div className="flex flex-col lg:flex-row">
            {/* Featured Image */}
            <div className="relative lg:w-[744px] h-[440px] flex-shrink-0">
              <img
                src={data.featuredTeaching.thumbnail}
                alt={data.featuredTeaching.title}
                className="w-full h-full object-cover"
              />
              {/* Play Button Overlay */}
              {(data.featuredTeaching.mediaType === 'video' || data.featuredTeaching.mediaType === 'audio') && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div 
                      className="absolute inset-0"
                      style={{
                        width: '200px',
                        height: '160px',
                        background: 'rgba(0, 0, 0, 0.15)',
                        borderRadius: '50%',
                        filter: 'blur(20px)'
                      }}
                    />
                    <div 
                      className="relative w-16 h-16 rounded-full bg-white flex items-center justify-center"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M5 3l12 7-12 7V3z" fill="#000000"/>
                      </svg>
                    </div>
                  </div>
                </div>
              )}
              {/* Bookmark Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleSave(data.featuredTeaching.id);
                }}
                className="absolute top-4 right-4 w-[52px] h-[52px] rounded-full flex items-center justify-center hover:bg-white/50 transition-colors"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.4)'
                }}
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill={savedTeachings.has(data.featuredTeaching.id) ? "#7D1A13" : "none"}
                  stroke="#FFFFFF"
                  strokeWidth="1.67"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
            </div>

            {/* Featured Content */}
            <div className="p-6 flex flex-col justify-end flex-1">
              <div className="flex items-center gap-4 mb-6">
                <span style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  lineHeight: '20px',
                  color: '#7D1A13'
                }}>
                  {data.featuredTeaching.date}
                </span>
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="#535862" strokeWidth="1.5"/>
                    <path d="M8 4v4l2.5 1.5" stroke="#535862" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    lineHeight: '20px',
                    color: '#384250'
                  }}>
                    {data.featuredTeaching.duration}
                  </span>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    className="mb-2"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '20px',
                      fontWeight: 700,
                      lineHeight: '140%',
                      color: '#111927'
                    }}
                  >
                    {data.featuredTeaching.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'Avenir Next, sans-serif',
                      fontSize: '18px',
                      fontWeight: 500,
                      lineHeight: '28px',
                      color: '#384250'
                    }}
                  >
                    {data.featuredTeaching.description}
                  </p>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    className="px-3.5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                    style={{
                      backgroundColor: '#7D1A13',
                      boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)',
                      fontFamily: 'Avenir Next, sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#FFFFFF'
                    }}
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Link>
        )}

        {/* Category Tabs */}
        <div className="mb-8">
          <div 
            className="border-b flex gap-3"
            style={{ borderColor: '#E9EAEB' }}
          >
            {data.categories.map((category, index) => (
              <button
                key={index}
                onClick={() => setActiveCategory(index)}
                className="pb-3 px-1 relative"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  lineHeight: '20px',
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

        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <p
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '18px',
              fontWeight: 600,
              lineHeight: '28px',
              color: '#111927'
            }}
          >
            {filteredTeachings.length} Items
            {showAllTeachings && listFormat === 'pagination' && totalPages > 1 && (
              <span style={{ color: '#717680', fontSize: '16px', marginLeft: '8px' }}>
                (Page {currentPage} of {totalPages})
              </span>
            )}
          </p>
          <div className="flex gap-3">
            <button
              className="px-3 py-2 rounded-lg"
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: '#535862'
              }}
            >
              Sort by
            </button>
            <button
              className="px-3 py-2 rounded-lg border hover:bg-gray-50 transition-colors flex items-center gap-2"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#D5D7DA',
                boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)',
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: '#414651'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2.5 5h15M5 10h10M7.5 15h5" stroke="#414651" strokeWidth="1.66667" strokeLinecap="round"/>
              </svg>
              Filters
            </button>
          </div>
        </div>

        {/* Teaching Grid with Overlay */}
        <div className={`relative ${!data.isLoggedIn ? 'pb-[480px]' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedTeachings.map((teaching) => (
              <TeachingCard
                key={teaching.id}
                teaching={teaching}
                isSaved={savedTeachings.has(teaching.id)}
                onToggleSave={() => toggleSave(teaching.id)}
                isDashboard={isDashboard}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {showAllTeachings && listFormat === 'pagination' && totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#D5D7DA',
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#414651'
                }}
              >
                Previous
              </button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className="w-10 h-10 rounded-lg transition-colors"
                        style={{
                          backgroundColor: page === currentPage ? '#7D1A13' : '#FFFFFF',
                          color: page === currentPage ? '#FFFFFF' : '#414651',
                          border: page === currentPage ? 'none' : '1px solid #D5D7DA',
                          fontFamily: 'Avenir Next, sans-serif',
                          fontSize: '14px',
                          fontWeight: 600,
                        }}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="flex items-center">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#D5D7DA',
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#414651'
                }}
              >
                Next
              </button>
            </div>
          )}

          {/* Login CTA Overlay */}
          {!data.isLoggedIn && !isDashboard && (
            <div 
              className="absolute left-0 right-0 flex flex-col items-center px-4 lg:px-16"
              style={{
                bottom: 0,
                paddingTop: '100px',
                paddingBottom: '100px',
                background: 'linear-gradient(180deg, rgba(250, 248, 241, 0) 0%, rgba(250, 248, 241, 0.7) 20%, rgba(250, 248, 241, 0.9) 40%, #FAF8F1 60%, #FAF8F1 100%)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)'
              }}
            >
              <div className="relative z-10 max-w-[832px] text-center mb-8">
                <h2
                  className="mb-6"
                  style={{
                    fontFamily: 'Optima, Georgia, serif',
                    fontSize: 'clamp(32px, 5vw, 48px)',
                    fontWeight: 550,
                    lineHeight: '1.25',
                    letterSpacing: '-0.02em',
                    color: '#000000'
                  }}
                >
                  Continue Browsing—Sign Up for Your Free Dashboard
                </h2>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '18px',
                    lineHeight: '150%',
                    color: '#414651'
                  }}
                >
                  Create your free account to continue browsing the library and access exclusive teachings, 500+ publications, and a complimentary meditation course—all from your personal dashboard.
                </p>
              </div>

              <div className="relative z-10 w-full max-w-[480px]">
                <div className="flex flex-col gap-3 mb-4">
                  <button
                    className="w-full px-4 py-2.5 border rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#D5D7DA',
                      boxShadow: '0px 1px 2px rgba(10, 13, 18, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)'
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC04"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#414651'
                    }}>
                      Sign in with Google
                    </span>
                  </button>

                  <button
                    className="w-full px-4 py-2.5 border rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#D5D7DA',
                      boxShadow: '0px 1px 2px rgba(10, 13, 18, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)'
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                    </svg>
                    <span style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#414651'
                    }}>
                      Sign in with Facebook
                    </span>
                  </button>

                  <button
                    className="w-full px-4 py-2.5 border rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#D5D7DA',
                      boxShadow: '0px 1px 2px rgba(10, 13, 18, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)'
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="#000000"/>
                    </svg>
                    <span style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#414651'
                    }}>
                      Sign in with Apple
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-2 my-4 px-0 py-4">
                  <div className="flex-1 border-t" style={{ borderColor: '#898989' }} />
                  <span style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '18px',
                    color: '#898989'
                  }}>
                    OR
                  </span>
                  <div className="flex-1 border-t" style={{ borderColor: '#898989' }} />
                </div>

                <button
                  className="w-full underline hover:no-underline"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#000000'
                  }}
                >
                  Continue with email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// TEACHING CARD COMPONENT - NOW CLICKABLE
// ============================================================================

const TeachingCard = ({
  teaching,
  isSaved,
  onToggleSave,
  isDashboard = false
}: {
  teaching: Teaching;
  isSaved: boolean;
  onToggleSave: () => void;
  isDashboard?: boolean;
}) => {
  const teachingUrl = isDashboard
    ? `/dashboard/user/teachings/${teaching.slug}`
    : `/teachings/${teaching.slug}`;

  return (
    <Link
      href={teachingUrl}
      className="bg-white border rounded-lg overflow-hidden relative flex flex-col hover:shadow-lg transition-shadow"
      style={{ borderColor: '#D2D6DB' }}
      data-testid="teaching-card"
    >
      {/* Thumbnail */}
      <div className="relative h-[202px]">
        <img
          src={teaching.thumbnail}
          alt={teaching.title}
          className="w-full h-full object-cover"
          style={{
            background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2))'
          }}
        />

        {/* Play Button Overlay */}
        {(teaching.mediaType === 'video' || teaching.mediaType === 'audio') && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div 
                className="absolute inset-0"
                style={{
                  width: '128px',
                  height: '102.4px',
                  background: 'rgba(0, 0, 0, 0.15)',
                  borderRadius: '50%',
                  filter: 'blur(15px)',
                  transform: 'translate(-50%, -50%)',
                  top: '50%',
                  left: '50%'
                }}
              />
              <div 
                className="relative w-16 h-16 rounded-full bg-white flex items-center justify-center"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 2l10 6-10 6V2z" fill="#000000"/>
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Access Badge */}
        <div className="absolute top-[14px] left-[15px]">
          <div 
            className="px-2.5 py-1 rounded-lg flex items-center gap-1 border"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#D5D7DA',
              boxShadow: '0px 1px 2px rgba(10, 13, 18, 0.05)'
            }}
          >
            {teaching.accessType === 'restricted' ? (
              <>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 5V4a3 3 0 016 0v1m-7 0h8a1 1 0 011 1v4a1 1 0 01-1 1H2a1 1 0 01-1-1V6a1 1 0 011-1z" stroke="#414651" strokeWidth="1.2"/>
                </svg>
                <span style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '20px',
                  color: '#414651'
                }}>
                  Membership
                </span>
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" stroke="#414651" strokeWidth="1.2"/>
                  <path d="M6 3v3l2 1" stroke="#414651" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                <span style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '20px',
                  color: '#414651'
                }}>
                  Free
                </span>
              </>
            )}
          </div>
        </div>

        {/* Bookmark Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleSave();
          }}
          className="absolute top-4 right-4 w-[52px] h-[52px] rounded-full flex items-center justify-center hover:bg-white/50 transition-colors"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.4)'
          }}
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill={isSaved ? "#7D1A13" : "none"}
            stroke="#FFFFFF"
            strokeWidth="1.67"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        {/* Meta Info */}
        <div className="flex items-center gap-4 mb-4">
          <span style={{
            fontFamily: 'Avenir Next, sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '20px',
            color: '#7D1A13'
          }}>
            {teaching.date}
          </span>
          <div className="flex items-center gap-2">
            {teaching.pageCount ? (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 1h6l3 3v9a1 1 0 01-1 1H3a1 1 0 01-1-1V2a1 1 0 011-1z" stroke="#535862" strokeWidth="1.2"/>
                  <path d="M9 1v3h3" stroke="#535862" strokeWidth="1.2"/>
                </svg>
                <span style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  lineHeight: '20px',
                  color: '#384250'
                }}>
                  {teaching.pageCount} pages
                </span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="#535862" strokeWidth="1.5"/>
                  <path d="M8 4v4l2.5 1.5" stroke="#535862" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  lineHeight: '20px',
                  color: '#384250'
                }}>
                  {teaching.duration}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <h3
          className="mb-2"
          style={{
            fontFamily: 'Avenir Next, sans-serif',
            fontSize: '20px',
            fontWeight: 600,
            lineHeight: '30px',
            color: '#000000'
          }}
        >
          {teaching.title}
        </h3>

        {/* Description */}
        <p
          className="flex-1"
          style={{
            fontFamily: 'Avenir Next, sans-serif',
            fontSize: '18px',
            fontWeight: 500,
            lineHeight: '28px',
            color: '#384250',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {teaching.description}
        </p>
      </div>
    </Link>
  );
};

export default TeachingLibrarySection;