'use client';

import { useState, useEffect, useRef } from 'react';

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

interface UpcomingRetreatsData {
  heading: string;
  viewAllLink?: {
    text: string;
    url: string;
  };
  cards: Card[];
}

// ============================================================================
// COMPONENT
// ============================================================================

const UpcomingRetreatsSection = ({ data }: { data: UpcomingRetreatsData }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Auto-slide for mobile
  useEffect(() => {
    const timer = setInterval(() => {
      if (window.innerWidth < 1024) {
        setCurrentSlide(prev => (prev + 1) % data.cards.length);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [data.cards.length]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && window.innerWidth < 1024) {
      setCurrentSlide((prev) => (prev + 1) % data.cards.length);
    }
    
    if (isRightSwipe && window.innerWidth < 1024) {
      setCurrentSlide((prev) => (prev - 1 + data.cards.length) % data.cards.length);
    }
  };

  return (
    <section 
      className="w-full py-16 px-4 lg:px-16"
      style={{ backgroundColor: '#FAF8F1' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <h2
            style={{
              fontFamily: 'Optima, Georgia, serif',
              fontSize: 'clamp(28px, 4vw, 40px)',
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

        {/* Desktop: Grid Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8">
          {data.cards.map((card, index) => (
            <RetreatCard key={index} card={card} />
          ))}
        </div>

        {/* Mobile: Carousel */}
        <div className="lg:hidden">
          <div 
            className="overflow-hidden rounded-lg cursor-grab active:cursor-grabbing"
            ref={carouselRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${currentSlide * 100}%)`,
              }}
            >
              {data.cards.map((card, index) => (
                <div 
                  key={index}
                  className="w-full flex-shrink-0 px-2"
                >
                  <RetreatCard card={card} />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Dots */}
          <div className="flex justify-center mt-6 space-x-2">
            {data.cards.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  currentSlide === index 
                    ? 'w-6' 
                    : 'hover:bg-gray-600'
                }`}
                style={{
                  backgroundColor: currentSlide === index ? '#374151' : '#D1D5DB'
                }}
                aria-label={`Go to retreat ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Retreat Card Component
const RetreatCard = ({ card }: { card: Card }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 flex flex-col h-full">
      {/* Image with Icon Overlay */}
      <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
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
      <div className="p-6 flex flex-col gap-4 flex-grow">
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