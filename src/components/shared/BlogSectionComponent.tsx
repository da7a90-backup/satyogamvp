'use client';

import { useState, useEffect } from 'react';

const BlogSection = ({data}: {data: any}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);


  const slidesPerView = isMobile ? 1 : 3;
  const maxSlides = isMobile ? data.length : Math.max(1, data.length - slidesPerView + 1);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % maxSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + maxSlides) % maxSlides);
  };

  const goToSlide = (index:any) => {
    setCurrentSlide(index);
  };

  return (
    <section 
      className="relative w-full flex flex-col items-start py-16 lg:py-16 px-4 lg:px-16"
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
          gap: '32px'
        }}
      >
        {/* Section Title */}
        <div 
          className="w-full flex flex-col justify-center items-center mx-auto"
          style={{
            maxWidth: '768px',
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
              LATEST BLOG
            </span>
          </div>

          {/* Main Title */}
          <h2 
            className="text-black text-center w-full"
            style={{
              fontFamily: 'Optima, Georgia, serif',
              fontWeight: 550,
              fontSize: isMobile ? '28px' : '48px',
              lineHeight: isMobile ? '120%' : '60px',
              letterSpacing: '-0.02em'
            }}
          >
            Extra Treasures to Set You Ablaze
          </h2>

          {/* Description */}
          <p 
            className="text-center w-full"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '16px',
              fontWeight: 500,
              lineHeight: '24px',
              color: '#384250'
            }}
          >
            Immerse yourself in the fire of ashram life with these blog articles—sparks of insight and guidance to ignite your path.
          </p>
        </div>

        {/* Blog Count and View All */}
        <div 
          className="w-full flex flex-row justify-between items-end"
          style={{
            gap: '40px'
          }}
        >
          {/* Blog Count */}
          <span 
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '18px',
              fontWeight: 600,
              lineHeight: '28px',
              color: '#111927'
            }}
          >
            2423 blogs
          </span>

          {/* View All Button */}
          <button
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
              cursor: 'pointer'
            }}
          >
            View all
          </button>
        </div>

        {/* Blog Cards Container */}
        <div className="w-full flex flex-col" style={{ gap: '48px' }}>
          {/* Cards Carousel */}
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentSlide * (isMobile ? 100 : 33.33)}%)`,
              }}
            >
              {data.map((post: any, index: number) => (
                <div 
                  key={post.id}
                  className="flex-shrink-0"
                  style={{
                    width: isMobile ? '100%' : '33.33%',
                    padding: isMobile ? '0' : '0 16px'
                  }}
                >
                  {/* Blog Card */}
                  <div 
                    className="bg-white border rounded-lg overflow-hidden"
                    style={{
                      borderColor: '#D2D6DB',
                      height: '502px',
                      boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)'
                    }}
                  >
                    {/* Card Image */}
                    <div 
                      className="relative w-full overflow-hidden"
                      style={{
                        height: '277px'
                      }}
                    >
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        style={{ backgroundColor: '#f3f4f6' }}
                      />
                      
                      {/* Bookmark Icon with Circular Blurry Background */}
                      <div 
                        className="absolute top-4 right-4 flex items-center justify-center"
                        style={{
                          width: '32px',
                          height: '32px',
                          background: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(8px)',
                          borderRadius: '50%'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2.6665 11.9869V6.47136C2.6665 4.04912 2.6665 2.838 3.44755 2.0855C4.2286 1.33301 5.48568 1.33301 7.99984 1.33301C10.514 1.33301 11.7711 1.33301 12.5521 2.0855C13.3332 2.838 13.3332 4.04912 13.3332 6.47136V11.9869C13.3332 13.5241 13.3332 14.2927 12.8179 14.5679C11.8202 15.1006 9.94864 13.3231 9.05984 12.7879C8.54437 12.4776 8.28663 12.3224 7.99984 12.3224C7.71304 12.3224 7.45531 12.4776 6.93984 12.7879C6.05104 13.3231 4.17948 15.1006 3.18174 14.5679C2.6665 14.2927 2.6665 13.5241 2.6665 11.9869Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2.6665 4.66602H13.3332" stroke="white" strokeWidth="1.5"/>
                        </svg>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex flex-col" style={{ height: '225px' }}>
                      {/* Category Header */}
                      <div 
                        className="flex flex-row justify-between items-center mb-2"
                        style={{
                          gap: '8px',
                          height: '21px'
                        }}
                      >
                        <span 
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 700,
                            fontSize: '14px',
                            lineHeight: '21px',
                            color: '#942017'
                          }}
                        >
                          {post.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 
                        className="text-black font-semibold mb-3 flex-shrink-0"
                        style={{
                          fontFamily: 'Avenir Next, sans-serif',
                          fontSize: '20px',
                          lineHeight: '30px',
                          fontWeight: 600,
                          height: '30px'
                        }}
                      >
                        {post.title}
                      </h3>

                      {/* Description */}
                      <p 
                        className="text-gray-700 flex-1 mb-4"
                        style={{
                          fontFamily: 'Avenir Next, sans-serif',
                          fontSize: '16px',
                          lineHeight: '24px',
                          fontWeight: 500,
                          color: '#384250'
                        }}
                      >
                        {post.description}
                      </p>

                      {/* Author Info */}
                      <div 
                        className="flex flex-row items-start mt-auto"
                        style={{
                          gap: '8px',
                          height: '47px'
                        }}
                      >
                        {/* Author Avatar */}
                        <div 
                          className="relative w-8 h-8 rounded-full flex-shrink-0"
                          style={{
                            border: '0.75px solid rgba(0, 0, 0, 0.08)',
                            borderRadius: '200px'
                          }}
                        >
                          <img
                            src={`/author-${post.author.toLowerCase()}.jpg`}
                            alt={post.author}
                            className="w-full h-full rounded-full object-cover"
                            onError={(e:any) => {
                              // Fallback to SVG placeholder
                              e.target.style.display = 'none';
                              e.target.parentNode.innerHTML = `
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="16" cy="16" r="16" fill="#E5E7EB"/>
                                  <path d="M16 8a4 4 0 100 8 4 4 0 000-8zM16 18c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" fill="#9CA3AF"/>
                                </svg>
                              `;
                            }}
                          />
                        </div>

                        {/* Author Name */}
                        <span 
                          style={{
                            fontFamily: 'Avenir Next, sans-serif',
                            fontWeight: 600,
                            fontSize: '14px',
                            lineHeight: '20px',
                            color: '#000000',
                            width: '44px',
                            height: '20px'
                          }}
                        >
                          {post.author}
                        </span>

                        {/* Dot Separator */}
                        <span 
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '18px',
                            lineHeight: '27px',
                            color: '#000000',
                            width: '11px',
                            height: '27px'
                          }}
                        >
                          •
                        </span>

                        {/* Date */}
                        <span 
                          style={{
                            fontFamily: 'Avenir Next, sans-serif',
                            fontWeight: 600,
                            fontSize: '14px',
                            lineHeight: '20px',
                            color: '#000000',
                            width: '102px',
                            height: '20px'
                          }}
                        >
                          {post.date}
                        </span>

                        {/* Dot Separator */}
                        <span 
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '18px',
                            lineHeight: '27px',
                            color: '#000000',
                            width: '11px',
                            height: '27px'
                          }}
                        >
                          •
                        </span>

                        {/* Read Time */}
                        <span 
                          style={{
                            fontFamily: 'Avenir Next, sans-serif',
                            fontWeight: 600,
                            fontSize: '14px',
                            lineHeight: '20px',
                            color: '#000000',
                            width: '70px',
                            height: '20px'
                          }}
                        >
                          {post.readTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          <div 
            className="flex items-center"
            style={{ 
              gap: '24px',
              marginLeft: isMobile ? 0 : '16px' // Align dots under first image
            }}
          >
            {/* Slider Dots */}
            <div 
              className="flex flex-row items-center"
              style={{
                gap: '8px'
              }}
            >
              {Array.from({ length: maxSlides }, (_, index) => (
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

            {/* Navigation Buttons */}
            <div 
              className="flex flex-row items-center"
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

export default BlogSection;