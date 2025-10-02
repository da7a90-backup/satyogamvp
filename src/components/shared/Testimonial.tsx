'use client';

import { useState, useEffect } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  location: string;
  video: string;
}

interface TestimonialCarouselData {
  tagline: string;
  testimonials: Testimonial[];
}

// ============================================================================
// COMPONENT
// ============================================================================

const TestimonialCarousel = ({ data }: { data: TestimonialCarouselData }) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % data.testimonials.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [data.testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % data.testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + data.testimonials.length) % data.testimonials.length);
  };

  return (
    <section 
      className="relative w-full flex flex-col items-center py-16 lg:py-28 px-4 lg:px-16"
      style={{ backgroundColor: '#FAF8F1' }}
    >
      {/* Desktop Layout */}
      <div className="hidden lg:flex w-full items-center max-w-7xl mx-auto" style={{ gap: '80px' }}>
        {/* Testimonial Text */}
        <div className="flex-1 flex flex-col gap-6" style={{ maxWidth: '500px' }}>
          <span 
            className="text-sm font-medium uppercase tracking-wider"
            style={{ fontFamily: 'Avenir Next, sans-serif', color: '#B8860B' }}
          >
            {data.tagline}
          </span>
          
          <p 
            className="text-xl italic"
            style={{
              fontFamily: 'Optima, sans-serif',
              fontSize: '24px',
              lineHeight: '36px',
              color: '#000000'
            }}
          >
            "{data.testimonials[currentTestimonial].quote}"
          </p>
          
          <div>
            <p style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '16px', fontWeight: 600, color: '#000000' }}>
              {data.testimonials[currentTestimonial].author}
            </p>
            <p style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '14px', color: '#6B7280' }}>
              {data.testimonials[currentTestimonial].location}
            </p>
          </div>
        </div>

        {/* Video Testimonial */}
        <div className="flex-1 w-full" style={{ maxWidth: '616px' }}>
          <div 
            className="relative w-full overflow-hidden cursor-pointer"
            style={{
              aspectRatio: '16/10',
              borderRadius: '16px',
              backgroundImage: `url(${data.testimonials[currentTestimonial].video})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center justify-center w-20 h-20 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M8 5v14l11-7L8 5z" fill="#7D1A13"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Video on top */}
      <div className="lg:hidden w-full max-w-md mx-auto flex flex-col items-center" style={{ gap: '32px' }}>
        {/* Video Testimonial - Top on mobile */}
        <div className="w-full">
          <div 
            className="relative w-full overflow-hidden cursor-pointer"
            style={{
              aspectRatio: '16/10',
              borderRadius: '16px',
              backgroundImage: `url(${data.testimonials[currentTestimonial].video})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center justify-center w-16 h-16 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M8 5v14l11-7L8 5z" fill="#7D1A13"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial Text - Bottom on mobile */}
        <div className="w-full flex flex-col items-center gap-4 text-center px-4">
          <span 
            className="text-sm font-medium uppercase tracking-wider"
            style={{ fontFamily: 'Avenir Next, sans-serif', color: '#B8860B' }}
          >
            {data.tagline}
          </span>
          
          <p 
            className="text-lg italic"
            style={{
              fontFamily: 'Optima, sans-serif',
              fontSize: 'clamp(18px, 3vw, 24px)',
              lineHeight: '140%',
              color: '#000000'
            }}
          >
            "{data.testimonials[currentTestimonial].quote}"
          </p>
          
          <div>
            <p style={{ 
              fontFamily: 'Avenir Next, sans-serif', 
              fontSize: 'clamp(14px, 2.5vw, 16px)', 
              fontWeight: 600, 
              color: '#000000' 
            }}>
              {data.testimonials[currentTestimonial].author}
            </p>
            <p style={{ 
              fontFamily: 'Avenir Next, sans-serif', 
              fontSize: 'clamp(12px, 2vw, 14px)', 
              color: '#6B7280' 
            }}>
              {data.testimonials[currentTestimonial].location}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation - Desktop */}
      <div className="hidden lg:flex justify-between items-center mt-8 w-full max-w-7xl mx-auto">
        {/* Slider Dots */}
        <div className="flex items-center gap-2">
          {data.testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentTestimonial === index ? 'bg-gray-800 w-6' : 'bg-gray-300 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
        
        {/* Slider Buttons */}
        <div className="flex items-center gap-4">
          <button 
            onClick={prevTestimonial}
            className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors duration-300"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button 
            onClick={nextTestimonial}
            className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors duration-300"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 15l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation - Mobile (dots only, auto-slides) */}
      <div className="lg:hidden flex justify-center mt-6">
        <div className="flex items-center space-x-2">
          {data.testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                currentTestimonial === index 
                  ? 'w-6' 
                  : 'hover:bg-gray-600'
              }`}
              style={{
                backgroundColor: currentTestimonial === index ? '#374151' : '#D1D5DB'
              }}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;