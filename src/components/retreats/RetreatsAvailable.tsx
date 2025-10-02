'use client';

import { useState, useEffect, useRef } from 'react';

const RetreatCardsSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Retreat options data - ready for CMS migration
  const retreats = [
    {
      id: 'shakti',
      image: '/ssi.jpg',
      icon: '/progicon.png',
      duration: '1 month',
      type: 'Onsite Retreat',
      category: 'Ashram Immersion program',
      title: 'Shakti Saturation Intensive'
    },
    {
      id: 'darshan',
      image: '/darshan.jpg',
      icon: '/progicon.png',
      duration: '7-Day',
      type: 'Onsite Retreat',
      category: 'Personal encounter with shunyamurti',
      title: 'Private Darshan'
    },
    {
      id: 'sevadhari',
      image: '/sevadhari.jpg',
      icon: '/progicon.png',
      duration: '6 months', 
      type: 'Onsite Retreat',
      category: 'Live and Study at the Ashram!',
      title: 'Become a Sevadhari'
    }
  ];

  // Auto-slide functionality for mobile
  useEffect(() => {
    const timer = setInterval(() => {
      if (window.innerWidth < 1024) {
        setCurrentSlide((prev) => (prev + 1) % retreats.length);
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [retreats.length]);

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
      setCurrentSlide((prev) => (prev + 1) % retreats.length);
    }
    
    if (isRightSwipe && window.innerWidth < 1024) {
      setCurrentSlide((prev) => (prev - 1 + retreats.length) % retreats.length);
    }
  };

  return (
    <section 
      className="relative w-full flex flex-col items-center py-16 lg:py-28 px-4 lg:px-16"
      style={{ backgroundColor: '#FAF8F1' }}
    >
      {/* Desktop Grid */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-8 w-full max-w-7xl mx-auto">
        {retreats.map((retreat) => (
          <RetreatCard key={retreat.id} retreat={retreat} />
        ))}
      </div>

      {/* Mobile Carousel */}
      <div className="lg:hidden w-full max-w-sm mx-auto">
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
            {retreats.map((retreat) => (
              <div 
                key={retreat.id}
                className="w-full flex-shrink-0 px-2"
              >
                <RetreatCard retreat={retreat} isMobile={true} />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {retreats.map((_, index) => (
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
    </section>
  );
};

// Retreat Card Component
const RetreatCard = ({ retreat, isMobile = false }: { retreat: any, isMobile?: boolean }) => {
  return (
    <div className={`flex flex-col bg-white rounded-lg overflow-hidden border border-gray-200 ${isMobile ? 'h-full' : ''}`}>
      {/* Image */}
      <div 
        className="relative w-full"
        style={{ aspectRatio: '4/3', backgroundColor: '#f3f4f6' }}
      >
        <img
          src={retreat.image}
          alt={retreat.title}
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
              src={retreat.icon}
              alt=""
              className="w-12 h-12"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`p-6 flex flex-col gap-4 ${isMobile ? 'flex-1' : ''}`}>
        {/* Event Details Row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          {/* Duration */}
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
              Duration: {retreat.duration}
            </span>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-6 h-0 border-t border-gray-300 rotate-90"/>

          {/* Location */}
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
              {retreat.type}
            </span>
          </div>
        </div>
        
        <div>
          <span 
            className="text-sm font-medium"
            style={{ 
              fontFamily: 'Avenir Next, sans-serif', 
              color: '#942017',
              fontSize: 'clamp(12px, 2vw, 14px)'
            }}
          >
            {retreat.category}
          </span>
          <h3 
            className="font-bold mt-1"
            style={{ 
              fontFamily: 'Optima, sans-serif', 
              color: '#000000',
              fontSize: 'clamp(18px, 3vw, 20px)'
            }}
          >
            {retreat.title}
          </h3>
        </div>
        <a href={"/retreats/"+retreat.id}
          > 
        <button
          className="w-full px-4 py-3 text-white rounded-lg font-medium transition-colors duration-300 hover:opacity-90 mt-auto"
          style={{
            backgroundColor: '#7D1A13',
            fontFamily: 'Avenir Next, sans-serif',
            fontSize: 'clamp(14px, 2.5vw, 16px)'
          }}
        >
         Learn more
        </button>
        </a>
      </div>
    </div>
  );
};

export default RetreatCardsSection;