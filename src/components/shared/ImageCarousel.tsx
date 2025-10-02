'use client'
import { useState, useEffect } from 'react';

interface Image {
    src: string
    alt: string
}

const ShaktiCarouselSection = (carouselImages: Image[]) => {
  const [currentSlide, setCurrentSlide] = useState(0);


  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % Math.max(1, carouselImages.length - 2));
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide(prev => Math.min(prev + 1, carouselImages.length - 3));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  };

  return (
    <section 
      className="w-full flex flex-col justify-center items-center px-4 lg:px-16 py-16"
      style={{ backgroundColor: '#FAF8F1' }}
    >
      <div className="w-full max-w-7xl mx-auto">
        {/* Desktop Carousel */}
        <div className="hidden lg:block relative w-full overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentSlide * 33.33}%)`,
            }}
          >
            {carouselImages.map((item, index) => (
              <div 
                key={index}
                className="flex-shrink-0"
                style={{ width: '33.33%', padding: '0 12px' }}
              >
                <div 
                  className="w-full rounded-xl overflow-hidden"
                  style={{ aspectRatio: '4/3', backgroundColor: '#f3f4f6' }}
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-between w-full mt-8">
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.max(1, carouselImages.length - 2) }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index ? 'bg-gray-800 w-6' : 'bg-gray-300 hover:bg-gray-500 w-2'
                }`}
              />
            ))}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={nextSlide}
              disabled={currentSlide >= carouselImages.length - 3}
              className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Carousel - Single Image */}
        <div className="lg:hidden">
          <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-xl">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${currentSlide * 100}%)`,
              }}
            >
              {carouselImages.map((item, index) => (
                <div 
                  key={index}
                  className="w-full flex-shrink-0"
                >
                  <div 
                    className="w-full rounded-xl overflow-hidden"
                    style={{ aspectRatio: '4/3', backgroundColor: '#f3f4f6' }}
                  >
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Dots */}
          <div className="flex justify-center mt-6 gap-2">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-200 ${
                  currentSlide === index 
                    ? 'w-6 bg-gray-700' 
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShaktiCarouselSection;