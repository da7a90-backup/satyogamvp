'use client';

import { useState, useEffect, useRef } from 'react';

const AshramActivitiesCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const activities = [
    {
      id: 1,
      image: "/ASHRAM_Gallery 1.jpg",
      alt: "Satsang with Shunyamurti"
    },
    {
      id: 2, 
      image: "/ASHRAM_Gallery 2.jpg",
      alt: "Music and meditation practice"
    },
    {
      id: 3,
      image: "/ASHRAM_Gallery 3.jpg", 
      alt: "Kitchen and community service"
    },
    {
      id: 4,
      image: "/ASHRAM_Gallery 4.jpg",
      alt: "Outdoor meditation"
    },
    {
      id: 5,
      image: "/ASHRAM_Gallery 5.jpg",
      alt: "Group study and contemplation"
    },
    {
      id: 6,
      image: "/ASHRAM_Gallery 6.jpg",
      alt: "Group study and contemplation"
    }
  ];

  // Auto-sliding functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        // Mobile: cycle through all images
        if (window.innerWidth < 1024) {
          return (prev + 1) % activities.length;
        }
        // Desktop: show 3 at a time
        return (prev + 1) % Math.max(1, activities.length - 2);
      });
    }, 4000); // Auto-slide every 4 seconds

    return () => clearInterval(timer);
  }, [activities.length]);

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
      // Swipe left - next image
      if (window.innerWidth < 1024) {
        setCurrentSlide((prev) => (prev + 1) % activities.length);
      }
    }
    
    if (isRightSwipe) {
      // Swipe right - previous image  
      if (window.innerWidth < 1024) {
        setCurrentSlide((prev) => (prev - 1 + activities.length) % activities.length);
      }
    }
  };

  // Desktop navigation
  const nextSlideDesktop = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(1, activities.length - 2));
  };

  const prevSlideDesktop = () => {
    const maxSlides = Math.max(1, activities.length - 2);
    setCurrentSlide((prev) => (prev - 1 + maxSlides) % maxSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section 
      className="relative w-full flex flex-col items-center py-16 lg:py-28 px-4 lg:px-16"
      style={{
        backgroundColor: '#FAF8F1'
      }}
    >
      {/* Content Container */}
      <div 
        className="w-full flex flex-col items-center max-w-7xl mx-auto"
        style={{
          gap: '48px'
        }}
      >
        {/* Desktop Carousel */}
        <div className="hidden lg:block relative w-full overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentSlide * 33.33}%)`,
            }}
          >
            {activities.map((activity) => (
              <div 
                key={activity.id}
                className="flex-shrink-0"
                style={{
                  width: '33.33%',
                  padding: '0 16px'
                }}
              >
                <div 
                  className="w-full rounded-2xl overflow-hidden"
                  style={{
                    aspectRatio: '4/3',
                    backgroundColor: '#f3f4f6'
                  }}
                >
                  <img
                    src={activity.image}
                    alt={activity.alt}
                    className="w-full h-full object-cover"
                    onError={(e: any) => {
                      e.target.style.backgroundColor = '#e5e7eb';
                      e.target.style.display = 'flex';
                      e.target.style.alignItems = 'center';
                      e.target.style.justifyContent = 'center';
                      e.target.innerHTML = `<span style="color: #6b7280; font-size: 14px; text-align: center;">${activity.alt}</span>`;
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Carousel with Touch/Swipe */}
        <div className="lg:hidden relative w-full max-w-md mx-auto">
          <div 
            className="overflow-hidden rounded-2xl cursor-grab active:cursor-grabbing"
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
              {activities.map((activity) => (
                <div 
                  key={activity.id}
                  className="w-full flex-shrink-0"
                >
                  <div 
                    className="w-full rounded-2xl overflow-hidden"
                    style={{
                      aspectRatio: '4/3',
                      backgroundColor: '#f3f4f6'
                    }}
                  >
                    <img
                      src={activity.image}
                      alt={activity.alt}
                      className="w-full h-full object-cover"
                      draggable={false}
                      onError={(e: any) => {
                        e.target.style.backgroundColor = '#e5e7eb';
                        e.target.style.display = 'flex';
                        e.target.style.alignItems = 'center';
                        e.target.style.justifyContent = 'center';
                        e.target.innerHTML = `<span style="color: #6b7280; font-size: 14px; text-align: center;">${activity.alt}</span>`;
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Navigation Controls */}
        <div className="hidden lg:flex items-center justify-between w-full">
          {/* Desktop Dots */}
          <div 
            className="flex items-center"
            style={{
              gap: '8px',
              marginLeft: '16px'
            }}
          >
            {Array.from({ length: Math.max(1, activities.length - 2) }, (_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index ? 'bg-gray-800 w-6' : 'bg-gray-300 hover:bg-gray-500'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Desktop Navigation Arrows */}
          <div 
            className="flex items-center"
            style={{
              gap: '12px'
            }}
          >
            <button
              onClick={prevSlideDesktop}
              className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors duration-300"
              aria-label="Previous slide"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <button
              onClick={nextSlideDesktop}
              className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors duration-300"
              aria-label="Next slide"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Controls - Dots Only (Swipe to Navigate) */}
        <div className="lg:hidden flex justify-center w-full">
          {/* Mobile Dots - Visual indicator only, swipe to navigate */}
          <div className="flex justify-center space-x-2">
            {activities.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  currentSlide === index 
                    ? 'w-6' 
                    : 'hover:bg-gray-600'
                }`}
                style={{
                  backgroundColor: currentSlide === index ? '#374151' : '#D1D5DB'
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AshramActivitiesCarousel;