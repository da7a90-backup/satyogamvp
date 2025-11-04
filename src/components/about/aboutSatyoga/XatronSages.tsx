'use client';

import { useState, useEffect } from 'react';

interface Sage {
  src: string;
  alt: string;
  name: string;
}

interface PatronSagesGalleryProps {
  sages: Sage[];
  heading: string;
  description: string;
}

const PatronSagesGallery = ({ sages: apiSages, heading, description }: PatronSagesGalleryProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Transform API data to component format
  const sages = apiSages.map((sage, index) => ({
    id: index,
    name: sage.name,
    image: sage.src
  }));

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Calculate slides per view and total slides
  const slidesPerView = isMobile ? 1 : 3;
  const totalSlides = isMobile ? sages.length : Math.max(1, sages.length - 2); // Show peek, so subtract 2 for desktop

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section 
      className="relative w-full flex flex-col items-start overflow-hidden py-16 lg:py-28 px-8 lg:px-16"
      style={{
        backgroundColor: '#FAF8F1'
      }}
    >
      {/* Content Container */}
      <div 
        className="w-full flex flex-col items-start"
        style={{
          maxWidth: '1312px',
          margin: '0 auto',
          gap: '80px'
        }}
      >
        {/* Section Title */}
        <h2
          className="text-black w-full"
          style={{
            fontFamily: 'Optima, Georgia, serif',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 550,
            lineHeight: '125%',
            letterSpacing: '-0.02em'
          }}
        >
          {heading}
        </h2>

        {/* Description */}
        <p
          className="text-gray-700 w-full"
          style={{
            fontFamily: 'Avenir Next, sans-serif',
            fontSize: '18px',
            lineHeight: '156%',
            color: '#384250'
          }}
          >
          {description}
        </p>

        {/* Gallery Container */}
        <div className="w-full flex flex-col gap-12">
          {/* Carousel */}
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentSlide * (isMobile ? 100 : 32)}%)`,
                }}
              >
                {sages.map((sage, index) => (
                  <div 
                    key={sage.id}
                    className="flex-shrink-0"
                    style={{
                      width: isMobile ? '100%' : '32%', // Smaller width on desktop to show peek
                      padding: '0 16px'
                    }}
                  >
                    {/* Sage Card */}
                    <div className="flex flex-col items-center gap-4">
                      {/* Image */}
                      <div 
                        className="w-full aspect-square rounded-lg overflow-hidden"
                        style={{
                          maxWidth: '416px',
                          backgroundColor: '#f3f4f6'
                        }}
                      >
                        <img
                          src={sage.image}
                          alt={sage.name}
                          className="w-full h-full object-cover"
                          onError={(e: any) => {
                            // Fallback for missing images
                            e.target.style.backgroundColor = '#e5e7eb';
                            e.target.style.display = 'flex';
                            e.target.style.alignItems = 'center';
                            e.target.style.justifyContent = 'center';
                            e.target.innerHTML = `<span style="color: #6b7280; font-size: 14px; text-align: center;">${sage.name}<br/>Image Not Found</span>`;
                          }}
                        />
                      </div>

                      {/* Name */}
                      <h3 
                        className="text-black text-center"
                        style={{
                          fontFamily: 'Avenir Next, sans-serif',
                          fontSize: '16px',
                          fontWeight: 500,
                          lineHeight: '24px'
                        }}
                      >
                        {sage.name}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex flex-row justify-between items-center w-full">
            {/* Slider Dots - Aligned under first image */}
            <div 
              className="flex items-center gap-2"
              style={{
                marginLeft: isMobile ? '0' : '16px' // Align with first image padding
              }}
            >
              {Array.from({ length: totalSlides }, (_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    currentSlide === index ? 'bg-gray-800' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Navigation Buttons - Right aligned */}
            <div className="flex items-center gap-4">
              {/* Previous Button */}
              <button
                onClick={prevSlide}
                className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors duration-300"
                aria-label="Previous slide"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Next Button */}
              <button
                onClick={nextSlide}
                className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors duration-300"
                aria-label="Next slide"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 15l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PatronSagesGallery;