'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BookGroupCard as BookGroupCardType, BookGroupStatus } from '@/types/book-group';

interface BookGroupCardProps {
  bookGroup: BookGroupCardType;
  hasAccess?: boolean;
}

export default function BookGroupCard({ bookGroup, hasAccess = false }: BookGroupCardProps) {

  // Get status badge text and color
  const getStatusBadge = () => {
    switch (bookGroup.status) {
      case BookGroupStatus.UPCOMING:
        return { text: 'Upcoming', color: 'bg-[#FDE8E6] text-[#7D1A13] border-[#F4C7C3]' };
      case BookGroupStatus.LIVE:
        return { text: 'Live', color: 'bg-green-100 text-green-700 border-green-200' };
      case BookGroupStatus.COMPLETED:
        return { text: 'Past', color: 'bg-gray-100 text-gray-700 border-gray-200' };
      default:
        return { text: 'Upcoming', color: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  const badge = getStatusBadge();

  // Format date display
  const getDateDisplay = () => {
    if (!bookGroup.start_date) return '';
    const date = new Date(bookGroup.start_date);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Determine button text
  const getButtonText = () => {
    if (hasAccess) return 'View Portal';
    if (bookGroup.status === BookGroupStatus.COMPLETED) return 'View Details';
    return 'View Details';
  };

  // Get link href
  const getLinkHref = () => {
    return `/dashboard/user/book-groups/${bookGroup.slug}`;
  };

  return (
    <Link href={getLinkHref()}>
      <div className="bg-white rounded-lg border border-[#D2D6DB] overflow-hidden transition-all hover:shadow-lg cursor-pointer flex flex-col h-full w-full max-w-[362.67px]">
        {/* Image Section */}
        <div className="relative w-full h-[202px] bg-gray-900">
          {bookGroup.thumbnail ? (
            <Image
              src={bookGroup.thumbnail}
              alt={bookGroup.title}
              fill
              className="object-cover"
              unoptimized={true}
              style={{
                objectPosition: bookGroup.thumbnail_gravity || 'center',
                filter: 'brightness(0.7)',
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 opacity-30">
                <svg
                  className="w-16 h-16 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
            </div>
          )}

          {/* Audio/Video Badges (bottom-left of image) */}
          <div className="absolute left-[13px] bottom-4 flex items-center gap-2 z-10">
            {bookGroup.has_audio && (
              <div className="flex items-center px-[8px] py-[1.35px] rounded-[5.39px] bg-[rgba(82,82,82,0.4)] backdrop-blur-sm">
                <span className="text-[10px] font-medium text-[#F3F4F6]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Audio
                </span>
              </div>
            )}
            {bookGroup.has_video && (
              <div className="flex items-center px-[8px] py-[1.35px] rounded-[5.39px] bg-[rgba(82,82,82,0.4)] backdrop-blur-sm">
                <span className="text-[10px] font-medium text-[#F3F4F6]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Video
                </span>
              </div>
            )}
          </div>

          {/* Status Badge (top-left) */}
          <div className={`absolute left-[9px] top-[10px] z-20 flex items-center px-[6px] py-[2px] rounded-md ${badge.color} border shadow-[0px_1px_2px_rgba(10,13,18,0.05)]`}>
            <span className="text-xs font-medium" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              {badge.text}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-1 p-6 gap-4">
          {/* Event Details Row */}
          <div className="flex items-center gap-4">
            {/* Date */}
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2.5" y="3.5" width="11" height="11" rx="1.5" stroke="#535862" strokeWidth="1.5" />
                <path d="M11 2V5M5 2V5M2 7H14" stroke="#535862" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="text-sm font-semibold text-[#384250]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                {getDateDisplay()}
              </span>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-[#D0D0D0]" />

            {/* Session Count */}
            <div className="flex items-center gap-2">
              <Image src="/book-closed.png" alt="" width={16} height={16} />
              <span className="text-sm font-semibold text-[#384250]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                {bookGroup.session_count} {bookGroup.session_count === 1 ? 'session' : 'sessions'}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-black line-clamp-2" style={{ fontFamily: 'Avenir Next, sans-serif', lineHeight: '30px' }}>
            {bookGroup.title}
          </h3>

          {/* Description */}
          <p className="text-base text-[#384250] line-clamp-2 flex-1" style={{ fontFamily: 'Avenir Next, sans-serif', lineHeight: '24px' }}>
            {bookGroup.short_description || 'Join us for this transformative book group experience.'}
          </p>

          {/* Button */}
          <button
            className="w-full flex items-center justify-center px-[14px] py-[10px] rounded-lg bg-white border border-[#D5D7DA] text-[#414651] font-semibold text-sm transition-all hover:bg-gray-50"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)',
            }}
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </Link>
  );
}
