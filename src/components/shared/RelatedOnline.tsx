'use client';

// ============================================================================
// TYPES
// ============================================================================

interface Card {
  image: string;
  iconOverlay: string;
  duration: string;
  type: string;
  date?: string;
  category?: string;
  title: string;
  description?: string;
  button: {
    text: string;
    url: string;
  };
}

interface FeaturedRetreat {
  slug: string;
  title: string;
  subtitle?: string;
  fixedDate: string;
  location: string;
  bookingTagline: string;
  heroBackground: string;
  intro1Content: string[];
}

interface UpcomingRetreatsData {
  heading: string;
  viewAllLink?: {
    text: string;
    url: string;
  };
  cards: Card[];
  featuredRetreat?: FeaturedRetreat | null;
}

// ============================================================================
// COMPONENT
// ============================================================================

const UpcomingRetreatsSection = ({ data }: { data: UpcomingRetreatsData }) => {
  // Calculate days until retreat starts
  const calculateDaysUntil = (dateStr: string) => {
    const parseDate = (str: string) => {
      const match = str.match(/(\w+)\s+(\d+)(?:-\d+)?,\s+(\d{4})/);
      if (match) {
        const [, month, day, year] = match;
        return new Date(`${month} ${day}, ${year}`);
      }
      return new Date(str);
    };

    const startDate = parseDate(dateStr);
    const today = new Date();
    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <section
      className="w-full py-16 px-4 lg:px-16"
      style={{ backgroundColor: '#FAF8F1' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Featured Retreat Card */}
        {data.featuredRetreat && (
          <div className="mb-16">
            <h2
              className="mb-8"
              style={{
                fontFamily: 'Optima, Georgia, serif',
                fontSize: 'clamp(28px, 4vw, 40px)',
                fontWeight: 550,
                lineHeight: '120%',
                color: '#000000'
              }}
            >
              Featured Retreat
            </h2>
            <FeaturedRetreatCard retreat={data.featuredRetreat} calculateDaysUntil={calculateDaysUntil} />
          </div>
        )}

        {/* List Header */}
        {data.cards.length > 0 && (
          <div className="flex justify-between items-center mb-8">
            <h2
              style={{
                fontFamily: 'Optima, Georgia, serif',
                fontSize: 'clamp(24px, 3vw, 32px)',
                fontWeight: 550,
                lineHeight: '120%',
                color: '#000000'
              }}
            >
              {data.heading}
            </h2>
            {data.viewAllLink && (
              <a
                href={data.viewAllLink.url}
                className="bg-[#7D1A13] text-white px-8 py-3 rounded-md font-semibold hover:opacity-90 transition-opacity"
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: 'clamp(14px, 2.5vw, 16px)'
                }}
              >
                {data.viewAllLink.text}
              </a>
            )}
          </div>
        )}

        {/* Desktop & Mobile: Vertical List */}
        <div className="flex flex-col gap-6">
          {data.cards.map((card, index) => (
            <RetreatCard key={index} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Featured Retreat Card Component (like in /about/shunyamurti)
const FeaturedRetreatCard = ({ retreat, calculateDaysUntil }: { retreat: FeaturedRetreat; calculateDaysUntil: (dateStr: string) => number }) => {
  const parseDate = (dateStr: string) => {
    const match = dateStr.match(/(\w+)\s+(\d+)(?:-\d+)?,\s+(\d{4})/);
    if (match) {
      const [, month, day, year] = match;
      return new Date(`${month} ${day}, ${year}`);
    }
    return new Date(dateStr);
  };

  const startDate = parseDate(retreat.fixedDate);
  const daysUntil = calculateDaysUntil(retreat.fixedDate);
  const dayOfWeek = startDate.toLocaleDateString('en-US', { weekday: 'short' });
  const dayOfMonth = startDate.getDate();
  const monthYear = startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <div
      className="w-full flex flex-col lg:flex-row bg-white border rounded-lg overflow-hidden"
      style={{
        borderColor: '#D2D6DB',
        borderRadius: '8px'
      }}
    >
      {/* Image Section */}
      <div className="relative w-full lg:w-1/2 h-64 lg:h-96">
        <div
          className="w-full h-full"
          style={{
            background: `linear-gradient(149.44deg, rgba(0, 0, 0, 0.1) 56.92%, rgba(0, 0, 0, 0.3) 74.56%, rgba(0, 0, 0, 0.3) 91.04%), url(${retreat.heroBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        {/* Date Badge */}
        <div
          className="absolute top-4 left-4 bg-white rounded-lg p-3 flex flex-col items-center justify-center"
          style={{ width: '80px', height: '90px', borderRadius: '8px' }}
        >
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 400, lineHeight: '150%', color: '#384250', textAlign: 'center' }}>
            {dayOfWeek}
          </span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '28px', fontWeight: 700, lineHeight: '130%', color: '#000000', textAlign: 'center' }}>
            {dayOfMonth}
          </span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 400, lineHeight: '150%', color: '#384250', textAlign: 'center' }}>
            {monthYear}
          </span>
        </div>

        {/* "In X days" Badge - Mobile */}
        {daysUntil > 0 && (
          <div
            className="absolute top-4 right-4 lg:hidden bg-white border rounded-lg flex items-center justify-center px-3 py-1"
            style={{ borderColor: '#D5D7DA', boxShadow: '0px 1px 2px rgba(10, 13, 18, 0.05)', borderRadius: '8px' }}
          >
            <span style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '12px', fontWeight: 500, lineHeight: '20px', color: '#414651', textAlign: 'center' }}>
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
            style={{ borderColor: '#D5D7DA', boxShadow: '0px 1px 2px rgba(10, 13, 18, 0.05)', borderRadius: '8px' }}
          >
            <span style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '14px', fontWeight: 500, lineHeight: '20px', color: '#414651', textAlign: 'center' }}>
              In {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
            </span>
          </div>
        )}

        <div className="space-y-10">
          {/* Event Details Row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="3" width="12" height="11" rx="2" stroke="#535862" strokeWidth="1.5"/>
                <path d="M11 1v4M5 1v4M2 7h12" stroke="#535862" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '14px', fontWeight: 600, lineHeight: '20px', color: '#384250' }}>
                {retreat.fixedDate}
              </span>
            </div>

            <div className="hidden sm:block w-6 h-0 border-t" style={{ borderColor: '#D0D0D0', transform: 'rotate(90deg)' }} />

            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 6.67c0 4.67-6 8.67-6 8.67s-6-4-6-8.67a6 6 0 1112 0z" stroke="#535862" strokeWidth="1.5"/>
                <circle cx="8" cy="6.67" r="1.67" stroke="#535862" strokeWidth="1.5"/>
              </svg>
              <span style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '14px', fontWeight: 600, lineHeight: '20px', color: '#384250' }}>
                {retreat.location}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <span style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '16px', fontWeight: 600, lineHeight: '140%', color: '#942017' }}>
              {retreat.bookingTagline}
            </span>

            <h3 style={{ fontFamily: 'Optima, Georgia, serif', fontSize: 'clamp(20px, 3vw, 24px)', fontWeight: 700, lineHeight: '32px', color: '#000000', margin: 0 }}>
              {retreat.title}
            </h3>

            <p className="py-2" style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '16px', fontWeight: 500, lineHeight: '24px', color: '#384250', margin: 0 }}>
              {retreat.intro1Content[0]}
            </p>
          </div>

          {/* Action Button */}
          <a href={`/retreats/online/${retreat.slug}`}>
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
              <span style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '16px', fontWeight: 600, lineHeight: '24px', color: '#FFFFFF' }}>
                Learn More
              </span>
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};

// Retreat Card Component (smaller list format)
const RetreatCard = ({ card }: { card: Card }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 flex flex-col lg:flex-row">
      {/* Image with Icon Overlay */}
      <div className="relative w-full lg:w-1/3" style={{ aspectRatio: '4/3' }}>
        <img
          src={card.image}
          alt={card.title}
          className="w-full h-full object-cover"
        />
        {/* Shadow gradient and icon in bottom right corner */}
        <div 
          className="absolute bottom-0 right-0 flex items-center justify-center"
          style={{
            width: '50%',
            height: '50%',
            background: 'radial-gradient(ellipse at bottom right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 25%, rgba(0,0,0,0.15) 45%, transparent 65%)',
            borderRadius: '0 0 8px 0'
          }}
        >
          <div className="w-12 h-12 flex items-center justify-center absolute bottom-3 right-3">
            <img
              src={card.iconOverlay}
              alt=""
              className="w-12 h-12"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 lg:w-2/3 flex flex-col gap-4 flex-grow">
        {/* Metadata */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="3" width="12" height="11" rx="2" stroke="#535862" strokeWidth="1.5"/>
              <path d="M11 1v4M5 1v4M2 7h12" stroke="#535862" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: 'clamp(12px, 2vw, 14px)',
                fontWeight: 600,
                lineHeight: '20px',
                color: '#384250'
              }}
            >
              {card.duration}
            </span>
          </div>

          <div className="hidden sm:block w-6 h-0 border-t border-gray-300 rotate-90"/>

          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 6.67c0 4.67-6 8.67-6 8.67s-6-4-6-8.67a6 6 0 1112 0z" stroke="#535862" strokeWidth="1.5"/>
              <circle cx="8" cy="6.67" r="1.67" stroke="#535862" strokeWidth="1.5"/>
            </svg>
            <span
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: 'clamp(12px, 2vw, 14px)',
                fontWeight: 600,
                lineHeight: '20px',
                color: '#384250'
              }}
            >
              {card.type}
            </span>
          </div>
        </div>

        {/* Date */}
        {card.date && (
          <p
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: 'clamp(12px, 2vw, 14px)',
              fontWeight: 600,
              color: '#7D1A13'
            }}
          >
            {card.date}
          </p>
        )}

        {/* Category & Title */}
        <div>
          <span
            className="text-sm font-medium"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              color: '#942017',
              fontSize: 'clamp(12px, 2vw, 14px)'
            }}
          >
            {card.category}
          </span>
          <h3
            className="font-bold mt-1"
            style={{
              fontFamily: 'Optima, sans-serif',
              color: '#000000',
              fontSize: 'clamp(18px, 3vw, 20px)'
            }}
          >
            {card.title}
          </h3>
        </div>

        {/* Description */}
        {card.description && (
          <p
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: 'clamp(14px, 2vw, 16px)',
              color: '#384250',
              lineHeight: '1.6'
            }}
          >
            {card.description}
          </p>
        )}

        {/* Button */}
        <a
          href={card.button.url}
          className="w-full px-4 py-3 text-white rounded-lg font-medium text-center transition-opacity hover:opacity-90 mt-auto"
          style={{
            backgroundColor: '#7D1A13',
            fontFamily: 'Avenir Next, sans-serif',
            fontSize: 'clamp(14px, 2.5vw, 16px)'
          }}
        >
          {card.button.text}
        </a>
      </div>
    </div>
  );
};

export default UpcomingRetreatsSection;