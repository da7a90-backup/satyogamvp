'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Retreat } from '@/types/retreat';

interface RetreatCardProps {
  retreat: Retreat;
  isRegistered?: boolean;
  accessType?: string | null;
  accessExpiresAt?: string | null;
  canAccess?: boolean;
}

export default function RetreatCard({
  retreat,
  isRegistered = false,
  accessType,
  accessExpiresAt,
  canAccess = false,
}: RetreatCardProps) {
  // Calculate days remaining for 12-day access
  const getDaysRemaining = () => {
    if (!accessExpiresAt) return null;
    const expiresDate = new Date(accessExpiresAt);
    const now = new Date();
    const diffTime = expiresDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = getDaysRemaining();

  // Determine badge text
  const getBadgeText = () => {
    // For non-registered retreats, check the date status
    if (!isRegistered) {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison

      const startDate = retreat.start_date ? new Date(retreat.start_date) : null;
      const endDate = retreat.end_date ? new Date(retreat.end_date) : null;

      if (startDate) startDate.setHours(0, 0, 0, 0);
      if (endDate) endDate.setHours(0, 0, 0, 0);

      // Past: end date has passed
      if (endDate && endDate < now) {
        return 'Past';
      }

      // Ongoing: today is between start and end date (inclusive)
      if (startDate && endDate && startDate <= now && now <= endDate) {
        return 'Ongoing';
      }

      // Upcoming: start date is in the future
      if (startDate && startDate > now) {
        return 'Upcoming';
      }

      // Default if no dates available
      return 'Upcoming';
    }

    // For registered retreats, show access status
    if (accessType === 'lifetime') return 'Lifetime';
    if (accessType === 'limited_12day' && daysRemaining !== null) {
      return daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired';
    }
    return 'Registered';
  };

  // Determine button text
  const getButtonText = () => {
    if (isRegistered && canAccess) return 'Enter Portal';
    if (isRegistered) return 'View Details';
    return `Buy $${(retreat.price || 195).toFixed(0)}`;
  };

  // Determine link destination
  const getLinkHref = () => {
    if (isRegistered) {
      // Go to portal if registered
      return `/dashboard/user/retreats/${retreat.slug}`;
    } else {
      // Go to purchase page if not registered
      return `/dashboard/user/online-retreats/${retreat.slug}`;
    }
  };

  // Format date display like "December 27-29, 2025" or "September 29-October 1, 2025"
  const getDateDisplay = () => {
    if (retreat.fixed_date) return retreat.fixed_date;
    if (retreat.start_date && retreat.end_date) {
      const start = new Date(retreat.start_date);
      const end = new Date(retreat.end_date);
      const startMonth = start.toLocaleDateString('en-US', { month: 'long' });
      const endMonth = end.toLocaleDateString('en-US', { month: 'long' });
      const year = start.getFullYear();
      const startDay = start.getDate();
      const endDay = end.getDate();

      // Check if dates are in the same month
      if (start.getMonth() === end.getMonth()) {
        return `${startMonth} ${startDay}-${endDay}, ${year}`;
      } else {
        // Different months: "September 29-October 1, 2025"
        return `${startMonth} ${startDay}-${endMonth} ${endDay}, ${year}`;
      }
    }
    return '';
  };

  return (
    <Link href={getLinkHref()}>
      <div
        className="
          bg-white rounded-lg border border-[#D2D6DB] overflow-hidden
          transition-all hover:shadow-lg cursor-pointer
          flex flex-col h-full
        "
        style={{
          width: '362.67px',
          height: '439px',
        }}
      >
        {/* Image Section */}
        <div className="relative w-full h-[202px] bg-gray-900">
          {(retreat.hero_background || retreat.thumbnail_url || retreat.store_product_image_url) ? (
            <Image
              src={retreat.hero_background || retreat.thumbnail_url || retreat.store_product_image_url || ''}
              alt={retreat.title}
              fill
              className="object-cover"
              unoptimized={true}
              style={{
                filter: 'brightness(0.7)',
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 opacity-30">
                <svg className="w-16 h-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          )}

          {/* Audio/Video Badges (bottom-left of image) */}
          <div className="absolute left-[13px] bottom-4 flex items-center gap-2 z-10">
            {retreat.has_audio && (
              <div
                className="
                  flex items-center px-[8px] py-[1.35px] rounded-[5.39px]
                  bg-[rgba(82,82,82,0.4)] backdrop-blur-sm
                "
              >
                <span
                  className="text-[10px] font-medium text-[#F3F4F6]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Audio
                </span>
              </div>
            )}
            {retreat.has_video && (
              <div
                className="
                  flex items-center px-[8px] py-[1.35px] rounded-[5.39px]
                  bg-[rgba(82,82,82,0.4)] backdrop-blur-sm
                "
              >
                <span
                  className="text-[10px] font-medium text-[#F3F4F6]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Video
                </span>
              </div>
            )}
          </div>

          {/* Upcoming/Status Badge (top-left) */}
          <div
            className="
              absolute left-[9px] top-[10px] z-20
              flex items-center px-[6px] py-[2px] rounded-md
              bg-white border border-[#D5D7DA]
              shadow-[0px_1px_2px_rgba(10,13,18,0.05)]
            "
          >
            <span
              className="text-xs font-medium text-[#414651]"
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              {getBadgeText()}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-1 p-6 gap-4">
          {/* Event Details Row */}
          <div className="flex items-center gap-4">
            {/* Date */}
            <div className="flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="2.5"
                  y="3.5"
                  width="11"
                  height="11"
                  rx="1.5"
                  stroke="#535862"
                  strokeWidth="1.5"
                />
                <path
                  d="M11 2V5M5 2V5M2 7H14"
                  stroke="#535862"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span
                className="text-sm font-semibold text-[#384250]"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                {getDateDisplay()}
              </span>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-[#D0D0D0]" />

            {/* Online Retreat with Globe Icon */}
            <div className="flex items-center gap-2">
              <Image src="/globe.png" alt="" width={16} height={16} />
              <span
                className="text-sm font-semibold text-[#384250]"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                Online Retreat
              </span>
            </div>
          </div>

          {/* Title */}
          <h3
            className="text-xl font-semibold text-black line-clamp-1"
            style={{ fontFamily: 'Avenir Next, sans-serif', lineHeight: '30px' }}
          >
            {retreat.title}
          </h3>

          {/* Description */}
          <p
            className="text-base text-[#384250] line-clamp-2 flex-1"
            style={{ fontFamily: 'Avenir Next, sans-serif', lineHeight: '24px' }}
          >
            {retreat.description || 'Join us for this transformative retreat experience.'}
          </p>

          {/* Button */}
          <button
            className="
              w-full flex items-center justify-center px-[14px] py-[10px] rounded-lg
              bg-white border border-[#D5D7DA] text-[#414651]
              font-semibold text-sm transition-all
              hover:bg-gray-50
            "
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              boxShadow:
                '0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)',
            }}
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </Link>
  );
}
