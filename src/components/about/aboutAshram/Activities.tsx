'use client';

import { useState } from 'react';

const AshramActivitiesCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(1, activities.length - 2)); // Show 3 at a time with peek
  };

  const prevSlide = () => {
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
        className="w-full flex flex-col items-center"
        style={{
          maxWidth: '1312px',
          gap: '48px'
        }}
      >
        {/* Carousel */}
        <div className="relative w-full overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentSlide * 30}%)`,
            }}
          >
            {activities.map((activity) => (
              <div 
                key={activity.id}
                className="flex-shrink-0"
                style={{
                  width: '30%',
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

        {/* Navigation Controls */}
        <div className="flex items-center justify-between w-full">
          {/* Dots */}
          <div 
            className="flex items-center"
            style={{
              gap: '8px',
              marginLeft: '16px' // Align with first image
            }}
          >
            {Array.from({ length: Math.max(1, activities.length - 2) }, (_, index) => (
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
            <button
              onClick={prevSlide}
              className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors duration-300"
              aria-label="Previous slide"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

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
    </section>
  );
};

export default AshramActivitiesCarousel;