'use client';

import { useState, useEffect, SetStateAction } from 'react';

const BlogSection = () => {
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

  const blogPosts = [
    {
      id: 1,
      image: "/aboutblog1.jpg",
      category: "Ashram Retreats (Onsite)",
      title: "Staying at Our Ashram in Costa Rica",
      description: "The Sat Yoga Ashram offers onsite retreats for all souls who resonate with Shunyamurti's tea...",
      author: "Donna",
      date: "March 21, 2024",
      readTime: "5 min read"
    },
    {
      id: 2,
      image: "/aboutblog2.jpg",
      category: "Ashram Life",
      title: "How to Thrive as a Community...",
      description: "By Donna | As Shunyamurti recently stated, the undesirableness of the locati...",
      author: "Donna",
      date: "March 21, 2024",
      readTime: "5 min read"
    },
    {
      id: 3,
      image: "/aboutblog3.jpg",
      category: "Ashram Life",
      title: "The Mission & Vision",
      description: "By Donna | As Shunyamurti recently stated, the undesirableness of the locati...",
      author: "Donna",
      date: "March 21, 2024",
      readTime: "5 min read"
    }
  ];

  const slidesPerView = isMobile ? 1 : 3;
  const totalSlides = isMobile ? blogPosts.length : Math.max(1, blogPosts.length - 2);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: SetStateAction<number>) => {
    setCurrentSlide(index);
  };

  return (
    <section 
      className="relative w-full flex flex-col items-start py-16 lg:py-16 px-4 lg:px-16"
      style={{
        backgroundColor: '#FAF8F1',
        gap: '32px'
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
          {isMobile ? (
            <button
              className="px-4 py-2 rounded-lg text-white transition-colors duration-300 hover:opacity-90"
              style={{
                backgroundColor: '#7D1A13',
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                lineHeight: '20px',
                boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)'
              }}
            >
              View all
            </button>
          ) : (
            <button
              className="text-gray-900 hover:opacity-70 transition-opacity duration-300"
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '18px',
                fontWeight: 600,
                lineHeight: '28px',
                color: '#111927'
              }}
            >
              View all
            </button>
          )}
        </div>

        {/* Blog Cards Container */}
        <div className="w-full flex flex-col" style={{ gap: '48px' }}>
          {/* Cards Carousel */}
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentSlide * (isMobile ? 100 : 28)}%)`,
                }}
              >
                {blogPosts.map((post, index) => (
                  <div 
                    key={post.id}
                    className="flex-shrink-0"
                    style={{
                      width: isMobile ? '100%' : '28%',
                      padding: isMobile ? '0' : '0 16px'
                    }}
                  >
                    {/* Blog Card */}
                    <div 
                      className="flex flex-col bg-white border rounded-lg overflow-hidden"
                      style={{
                        borderColor: '#D2D6DB',
                        height: '502px'
                      }}
                    >
                      {/* Card Image */}
                      <div 
                        className="w-full bg-gray-200 flex items-center justify-center"
                        style={{
                          height: '277px',
                          backgroundImage: `url(${post.image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        {/* Bookmark Icon */}
                        <div className="absolute top-4 right-4">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                            <path d="M5 7a2 2 0 012-2h10a2 2 0 012 2v11.5a.5.5 0 01-.777.416L12 16.5l-6.223 2.416A.5.5 0 015 18.5V7z" fill="currentColor"/>
                          </svg>
                        </div>
                        
                        {/* Fallback for missing images */}
                        <span className="text-gray-500 text-sm">Blog Image</span>
                      </div>

                      {/* Card Content */}
                      <div 
                        className="flex flex-col p-6"
                        style={{
                          height: '225px',
                          gap: '8px'
                        }}
                      >
                        {/* Category Tag */}
                        <div className="flex items-center justify-between mb-2">
                          <span 
                            className="px-2 py-1 rounded-full border text-xs font-semibold"
                            style={{
                              borderColor: 'rgba(0, 0, 0, 0.08)',
                              color: '#000000',
                              fontFamily: 'Avenir Next, sans-serif',
                              fontSize: '14px',
                              lineHeight: '20px'
                            }}
                          >
                            {post.category}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 
                          className="text-black font-semibold mb-2"
                          style={{
                            fontFamily: 'Avenir Next, sans-serif',
                            fontSize: '20px',
                            lineHeight: '30px',
                            fontWeight: 600
                          }}
                        >
                          {post.title}
                        </h3>

                        {/* Description */}
                        <p 
                          className="text-gray-700 flex-1"
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
                        <div className="flex items-center gap-2 mt-auto">
                          <div 
                            className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"
                            style={{
                              backgroundImage: `url(/author-${post.author.toLowerCase()}.jpg)`,
                              backgroundSize: 'cover'
                            }}
                          />
                          <span 
                            className="font-semibold"
                            style={{
                              fontFamily: 'Avenir Next, sans-serif',
                              fontSize: '14px',
                              lineHeight: '20px',
                              fontWeight: 600,
                              color: '#000000'
                            }}
                          >
                            {post.author}
                          </span>
                          <span className="text-black">•</span>
                          <span 
                            className="font-semibold"
                            style={{
                              fontFamily: 'Avenir Next, sans-serif',
                              fontSize: '14px',
                              lineHeight: '20px',
                              fontWeight: 600,
                              color: '#000000'
                            }}
                          >
                            {post.date}
                          </span>
                          <span className="text-black">•</span>
                          <span 
                            className="font-semibold"
                            style={{
                              fontFamily: 'Avenir Next, sans-serif',
                              fontSize: '14px',
                              lineHeight: '20px',
                              fontWeight: 600,
                              color: '#000000'
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
          </div>

          {/* Navigation Controls */}
          <div className="flex flex-row justify-center items-center w-full gap-4">
            {/* Slider Dots */}
            <div className="flex items-center gap-2">
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

            {/* Navigation Buttons */}
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

export default BlogSection;