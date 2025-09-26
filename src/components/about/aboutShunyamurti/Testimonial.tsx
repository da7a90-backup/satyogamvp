'use client';

import { useState } from 'react';

const EncountersSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const encounters = [
    {
      id: 1,
      text: "In this heartfelt compilation, seekers from around the world share their encounters with Shunyamurti—moments of insight, transformation, and remembrance. Each is a testament to the uncanny and life-transforming power of a true encounter—a transmission that changes everything.",
      author: "Lauren",
      location: "The Netherlands"
    },
    {
      id: 2,
      text: "Meeting Shunyamurti was like coming home to a truth I had always known but forgotten. His presence awakened something deep within me that had been dormant for years. The transformation was immediate and lasting.",
      author: "Michael",
      location: "United States"
    },
    {
      id: 3,
      text: "Through Shunyamurti's teachings, I discovered the joy of surrender and the peace that comes from letting go of the ego's constant demands. His wisdom opened doorways I never knew existed.",
      author: "Sofia",
      location: "Spain"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % encounters.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + encounters.length) % encounters.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section 
      className="relative w-full flex flex-col lg:flex-row items-center py-16 lg:py-28 px-8 lg:px-16"
      style={{
        backgroundColor: '#FAF8F1',
        gap: '80px'
      }}
    >
      {/* Content Container */}
      <div 
        className="w-full flex flex-col lg:flex-row items-center"
        style={{
          maxWidth: '1312px',
          margin: '0 auto',
          gap: '80px'
        }}
      >
        {/* Left Column - Video */}
        <div 
          className="flex-1 w-full"
          style={{
            maxWidth: '616px'
          }}
        >
          <div 
            className="relative w-full overflow-hidden cursor-pointer"
            style={{
              aspectRatio: '616/400',
              borderRadius: '16px',
              background: 'url(/qna.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Play Button */}
            <div 
              className="absolute inset-0 flex items-center justify-center"
            >
              <div 
                className="flex items-center justify-center w-20 h-20 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-300"
                style={{
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M8 5v14l11-7L8 5z" fill="#7D1A13"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Content */}
        <div 
          className="flex-1 w-full flex flex-col items-start"
          style={{
            maxWidth: '616px',
            gap: '32px'
          }}
        >
          {/* Tagline */}
          <div 
            className="flex items-center"
          >
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
              ENCOUNTERS WITH SHUNYAMURTI
            </span>
          </div>

          {/* Main Content */}
          <div 
            className="flex flex-col"
            style={{
              gap: '40px'
            }}
          >
            {/* Quote Text */}
            <p 
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '18px',
                lineHeight: '28px',
                color: '#000000',
                fontWeight: 400
              }}
            >
              {encounters[currentSlide].text}
            </p>

            {/* Attribution */}
            <div 
              className="flex flex-col"
              style={{
                gap: '4px'
              }}
            >
              <span 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#000000'
                }}
              >
                {encounters[currentSlide].author}
              </span>
              <span 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#6B7280'
                }}
              >
                {encounters[currentSlide].location}
              </span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div 
            className="flex items-center justify-between w-full"
            style={{
              marginTop: '24px'
            }}
          >
            {/* Dots */}
            <div 
              className="flex items-center"
              style={{
                gap: '8px'
              }}
            >
              {encounters.map((_, index) => (
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

            {/* Navigation Arrows */}
            <div 
              className="flex items-center"
              style={{
                gap: '12px'
              }}
            >
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

export default EncountersSection;