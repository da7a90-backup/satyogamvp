'use client';

import { useState, useEffect, useRef } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface Testimonial {
  quote: string;
  name: string;
  location: string;
  avatar: string;
}

interface TestimonialSecondaryData {
  title: string;
  subtitle?: string;
  testimonials: Testimonial[];
}

// ============================================================================
// COMPONENT
// ============================================================================

const TestimonialSecondarySection = ({ data }: { data: TestimonialSecondaryData }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Auto-slide for mobile
  useEffect(() => {
    const timer = setInterval(() => {
      if (window.innerWidth < 1024) {
        setCurrentSlide(prev => (prev + 1) % data.testimonials.length);
      }
    }, 6000);

    return () => clearInterval(timer);
  }, [data.testimonials.length]);

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
      setCurrentSlide((prev) => (prev + 1) % data.testimonials.length);
    }
    
    if (isRightSwipe && window.innerWidth < 1024) {
      setCurrentSlide((prev) => (prev - 1 + data.testimonials.length) % data.testimonials.length);
    }
  };

  return (
    <section 
      className="w-full py-16 px-4 lg:px-16"
      style={{ backgroundColor: '#FAF8F1' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            style={{
              fontFamily: 'Optima, Georgia, serif',
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 550,
              lineHeight: '120%',
              color: '#000000',
              marginBottom: '16px'
            }}
          >
            {data.title}
          </h2>
          {data.subtitle && (
            <p
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: 'clamp(16px, 2vw, 18px)',
                color: '#535862',
                lineHeight: '1.6'
              }}
            >
              {data.subtitle}
            </p>
          )}
        </div>

        {/* Desktop: Grid Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {data.testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
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
              {data.testimonials.map((testimonial, index) => (
                <div 
                  key={index}
                  className="w-full flex-shrink-0 px-2"
                >
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Dots */}
          <div className="flex justify-center mt-6 space-x-2">
            {data.testimonials.map((_, index) => (
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
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Testimonial Card Component
const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <div 
      className="bg-white rounded-lg p-8 border border-gray-200 flex flex-col h-full"
      style={{ minHeight: '280px' }}
    >
      {/* Quote */}
      <p
        className="flex-grow mb-8"
        style={{
          fontFamily: 'Avenir Next, sans-serif',
          fontSize: 'clamp(15px, 2vw, 17px)',
          color: '#2C2C2C',
          lineHeight: '1.7'
        }}
      >
        "{testimonial.quote}"
      </p>

      {/* Author Info */}
      <div className="flex items-center gap-4">
        <div 
          className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0"
          style={{ backgroundColor: '#E5E7EB' }}
        >
          <img
            src={testimonial.avatar}
            alt={testimonial.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: 'clamp(14px, 2vw, 16px)',
              fontWeight: 600,
              color: '#000000',
              marginBottom: '2px'
            }}
          >
            {testimonial.name}
          </p>
          <p
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: 'clamp(13px, 2vw, 15px)',
              color: '#6B7280'
            }}
          >
            {testimonial.location}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialSecondarySection;