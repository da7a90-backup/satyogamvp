'use client';

import Link from 'next/link';
import { OnlineRetreat } from '@/lib/data';

interface OnlineRetreatsSectionProps {
  retreat: OnlineRetreat;
  totalRetreats?: number;
}

const OnlineRetreatsSection = ({ retreat, totalRetreats = 0 }: OnlineRetreatsSectionProps) => {
  // Don't render if no retreat data
  if (!retreat || !retreat.fixedDate) {
    return null;
  }

  // Parse the start date to calculate days until retreat
  const parseDate = (dateStr: string) => {
    // Parse "December 27-29, 2025" format
    const match = dateStr.match(/(\w+)\s+(\d+)(?:-\d+)?,\s+(\d{4})/);
    if (match) {
      const [, month, day, year] = match;
      return new Date(`${month} ${day}, ${year}`);
    }
    return new Date(dateStr);
  };

  const startDate = parseDate(retreat.fixedDate);

  const calculateDaysUntil = () => {
    const today = new Date();
    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysUntil = calculateDaysUntil();

  // Format date parts
  const dayOfWeek = startDate.toLocaleDateString('en-US', { weekday: 'short' });
  const dayOfMonth = startDate.getDate();
  const monthYear = startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <section
      className="relative w-full flex flex-col items-start py-16 lg:py-28 px-4 lg:px-16"
      style={{
        backgroundColor: '#FAF8F1'
      }}
    >
      {/* Content Container */}
      <div
        className="w-full flex flex-col items-start max-w-7xl mx-auto"
        style={{
          gap: '32px'
        }}
      >
        {/* Section Header */}
        <div
          className="w-full flex flex-col items-start"
          style={{
            gap: '16px'
          }}
        >
          {/* Tagline */}
          <div className="flex items-center">
            <span
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                lineHeight: '24px',
                color: '#B8860B',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}
            >
              UPCOMING EVENTS
            </span>
          </div>

          {/* Main Title */}
          <h2
            className="text-black w-full"
            style={{
              fontFamily: 'Optima, Georgia, serif',
              fontWeight: 550,
              fontSize: 'clamp(28px, 4vw, 48px)',
              lineHeight: '125%',
              letterSpacing: '-0.02em'
            }}
          >
            Online Retreats
          </h2>

          {/* Description */}
          <p
            className="w-full"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '16px',
              fontWeight: 500,
              lineHeight: '24px',
              color: '#384250'
            }}
          >
            Shunyamurti offers a number of yearly livestreamed retreats. Each one is a stunning and unique event—always more powerful than the last, always relevant and geopolitically informed, and always paradigm-shifting, ego-busting, and shakti-filled. Priceless direct guidance in real time—including the opportunity to pose urgent questions to Shunyamurti live—makes these events imperative for serious seekers.
          </p>
        </div>

        {/* Retreat Count and View All */}
        <div
          className="w-full flex flex-row justify-between items-end"
          style={{
            gap: '40px'
          }}
        >
          {/* Retreat Count */}
          <span
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '18px',
              fontWeight: 600,
              lineHeight: '28px',
              color: '#111927'
            }}
          >
            {totalRetreats} Online Retreat{totalRetreats !== 1 ? 's' : ''}
          </span>

          {/* View All Button */}
          <Link
            href="/retreats/online"
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '10px 16px',
              gap: '6px',
              width: '94px',
              height: '44px',
              background: '#7D1A13',
              boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)',
              borderRadius: '8px',
              border: 'none',
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '20px',
              color: '#FFFFFF',
              cursor: 'pointer',
              textDecoration: 'none'
            }}
          >
            View all
          </Link>
        </div>

        {/* Event Card */}
        <div
          className="w-full flex flex-col lg:flex-row bg-white border rounded-lg overflow-hidden relative"
          style={{
            borderColor: '#D2D6DB',
            borderRadius: '8px'
          }}
        >
          {/* Image Section */}
          <div className="relative w-full lg:w-1/2 h-64 lg:h-96">
            {/* Background Image */}
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(149.44deg, rgba(0, 0, 0, 0.1) 56.92%, rgba(0, 0, 0, 0.3) 74.56%, rgba(0, 0, 0, 0.3) 91.04%), url(${retreat.heroBackground || ''})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />

            {/* Date Badge */}
            <div
              className="absolute top-4 left-4 bg-white rounded-lg p-3 flex flex-col items-center justify-center"
              style={{
                width: '80px',
                height: '90px',
                borderRadius: '8px'
              }}
            >
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  fontWeight: 400,
                  lineHeight: '150%',
                  color: '#384250',
                  textAlign: 'center'
                }}
              >
                {dayOfWeek}
              </span>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '28px',
                  fontWeight: 700,
                  lineHeight: '130%',
                  color: '#000000',
                  textAlign: 'center'
                }}
              >
                {dayOfMonth}
              </span>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  fontWeight: 400,
                  lineHeight: '150%',
                  color: '#384250',
                  textAlign: 'center'
                }}
              >
                {monthYear}
              </span>
            </div>

            {/* Illustration Icon */}
            <div className="absolute bottom-4 right-4">
              <div
                className="relative"
                style={{
                  width: '80px',
                  height: '80px'
                }}
              >
                {/* Blur circle background */}
                <div
                  style={{
                    position: 'absolute',
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.28) 100%)',
                    backdropFilter: 'blur(26.25px)',
                    borderRadius: '50%'
                  }}
                />
                {/* Icon - Removed hardcoded illustration, should come from API */}
              </div>
            </div>

            {/* "In X days" Badge - Mobile */}
            {daysUntil > 0 && (
              <div
                className="absolute top-4 right-4 lg:hidden bg-white border rounded-lg flex items-center justify-center px-3 py-1"
                style={{
                  borderColor: '#D5D7DA',
                  boxShadow: '0px 1px 2px rgba(10, 13, 18, 0.05)',
                  borderRadius: '8px'
                }}
              >
                <span
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '12px',
                    fontWeight: 500,
                    lineHeight: '20px',
                    color: '#414651',
                    textAlign: 'center'
                  }}
                >
                  In {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
                </span>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="w-full lg:w-1/2 p-6 lg:p-8 flex flex-col justify-center relative">
            {/* "In X days" Badge - Desktop */}
            {daysUntil > 0 && (
              <div
                className="hidden lg:flex absolute top-4 right-4 bg-white border rounded-lg items-center justify-center px-3 py-1"
                style={{
                  borderColor: '#D5D7DA',
                  boxShadow: '0px 1px 2px rgba(10, 13, 18, 0.05)',
                  borderRadius: '8px'
                }}
              >
                <span
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    lineHeight: '20px',
                    color: '#414651',
                    textAlign: 'center'
                  }}
                >
                  In {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
                </span>
              </div>
            )}

            <div className="space-y-10">
              {/* Event Details Row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                {/* Date */}
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="3" width="12" height="11" rx="2" stroke="#535862" strokeWidth="1.5"/>
                    <path d="M11 1v4M5 1v4M2 7h12" stroke="#535862" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span
                    style={{
                      fontFamily: 'Avenir Next, sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      lineHeight: '20px',
                      color: '#384250'
                    }}
                  >
                    {retreat.fixedDate}
                  </span>
                </div>

                {/* Divider */}
                <div
                  className="hidden sm:block w-6 h-0 border-t"
                  style={{
                    borderColor: '#D0D0D0',
                    transform: 'rotate(90deg)'
                  }}
                />

                {/* Location */}
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M14 6.67c0 4.67-6 8.67-6 8.67s-6-4-6-8.67a6 6 0 1112 0z" stroke="#535862" strokeWidth="1.5"/>
                    <circle cx="8" cy="6.67" r="1.67" stroke="#535862" strokeWidth="1.5"/>
                  </svg>
                  <span
                    style={{
                      fontFamily: 'Avenir Next, sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      lineHeight: '20px',
                      color: '#384250'
                    }}
                  >
                    {retreat.location}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-6">
                {/* Category/Tagline */}
                <span
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '16px',
                    fontWeight: 600,
                    lineHeight: '140%',
                    color: '#942017'
                  }}
                >
                  {retreat.bookingTagline}
                </span>

                {/* Title */}
                <h3
                  style={{
                    fontFamily: 'Optima, Georgia, serif',
                    fontSize: 'clamp(20px, 3vw, 24px)',
                    fontWeight: 700,
                    lineHeight: '32px',
                    color: '#000000',
                    margin: 0
                  }}
                >
                  {retreat.title}
                </h3>

                {/* Description */}
                <p
                  className="py-2"
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '16px',
                    fontWeight: 500,
                    lineHeight: '24px',
                    color: '#384250',
                    margin: 0
                  }}
                >
                  {retreat.intro1Content[0]}
                </p>
              </div>

              {/* Action Button */}
              <Link href={`/retreats/online/${retreat.slug}`}>
                <button
                  className="w-full sm:w-auto"
                  style={{
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '10px 16px',
                    gap: '6px',
                    minWidth: '135px',
                    height: '44px',
                    background: '#7D1A13',
                    boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Avenir Next, sans-serif',
                      fontSize: '16px',
                      fontWeight: 600,
                      lineHeight: '24px',
                      color: '#FFFFFF'
                    }}
                  >
                    Learn More
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OnlineRetreatsSection;
