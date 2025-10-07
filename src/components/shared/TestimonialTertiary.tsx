'use client';

import { useState, useEffect } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface Testimonial {
  quote: string;
  name: string;
  location: string;
  avatar: string;
}

interface TestimonialCarouselTertiaryData {
  tagline: string;
  heading: string;
  testimonials: Testimonial[];
}

// ============================================================================
// COMPONENT
// ============================================================================

const TestimonialCarouselTertiary = ({ data }: { data: TestimonialCarouselTertiaryData }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Calculate total pages based on screen size
  const getTotalPages = () => {
    if (typeof window === 'undefined') return 1;
    if (window.innerWidth >= 1024) {
      return Math.ceil(data.testimonials.length / 3);
    } else if (window.innerWidth >= 768) {
      return Math.ceil(data.testimonials.length / 2);
    }
    return data.testimonials.length;
  };

  const [totalPages, setTotalPages] = useState(getTotalPages());

  useEffect(() => {
    const handleResize = () => {
      setTotalPages(getTotalPages());
      setCurrentIndex(0);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [data.testimonials.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

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

    if (isLeftSwipe) {
      handleNext();
    }
    
    if (isRightSwipe) {
      handlePrevious();
    }
  };

  return (
    <section 
      className="w-full py-16 px-4 lg:px-16 relative"
      style={{ backgroundColor: '#FAF8F1' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p
            className="mb-4"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: 'clamp(12px, 2vw, 14px)',
              fontWeight: 600,
              color: '#B8860B',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
          >
            {data.tagline}
          </p>
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
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 z-10 w-12 h-12 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Previous testimonials"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#2C2C2C" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 z-10 w-12 h-12 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Next testimonials"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#2C2C2C" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          {/* Testimonials Grid */}
          <div 
            className="overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`
              }}
            >
              {Array.from({ length: totalPages }).map((_, pageIndex) => (
                <div 
                  key={pageIndex}
                  className="w-full flex-shrink-0"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
                    {data.testimonials
                      .slice(
                        pageIndex * 3,
                        pageIndex * 3 + 3
                      )
                      .map((testimonial, index) => (
                        <TestimonialCard key={index} testimonial={testimonial} />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dots Navigation */}
        <div className="flex justify-center mt-12 gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className="w-2 h-2 rounded-full transition-all duration-200"
              style={{
                backgroundColor: currentIndex === index ? '#2C2C2C' : '#D1D5DB',
                width: currentIndex === index ? '24px' : '8px'
              }}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// Testimonial Card Component
const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <div className="flex flex-col items-center text-center px-4">
      {/* Quote */}
      <p
        className="mb-8"
        style={{
          fontFamily: 'Avenir Next, sans-serif',
          fontSize: 'clamp(15px, 2vw, 17px)',
          color: '#535862',
          lineHeight: '1.7',
          minHeight: '140px'
        }}
      >
        "{testimonial.quote}"
      </p>

      {/* Avatar */}
      <div 
        className="w-16 h-16 rounded-full overflow-hidden mb-4"
        style={{ backgroundColor: '#E5E7EB' }}
      >
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Name */}
      <p
        style={{
          fontFamily: 'Avenir Next, sans-serif',
          fontSize: 'clamp(15px, 2vw, 17px)',
          fontWeight: 600,
          color: '#000000',
          marginBottom: '4px'
        }}
      >
        {testimonial.name}
      </p>

      {/* Location */}
      <p
        style={{
          fontFamily: 'Avenir Next, sans-serif',
          fontSize: 'clamp(14px, 2vw, 16px)',
          color: '#6B7280'
        }}
      >
        {testimonial.location}
      </p>
    </div>
  );
};

export default TestimonialCarouselTertiary;