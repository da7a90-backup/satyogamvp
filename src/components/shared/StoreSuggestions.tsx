'use client';

import { useState, useEffect, useRef } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface Product {
  image: string;
  hasVideo: boolean;
  hasAudio: boolean;
  category: string;
  title: string;
  price: string;
  subtitle: string;
  description: string;
  cartUrl: string;
}

interface PastRetreatsData {
  tagline: string;
  heading: string;
  description: string;
  productsHeading: string;
  viewAllLink: {
    text: string;
    url: string;
  };
  products: Product[];
}

// ============================================================================
// COMPONENT
// ============================================================================

const StoreProductSection = ({ data }: { data: PastRetreatsData }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Auto-slide for mobile
  useEffect(() => {
    const timer = setInterval(() => {
      if (window.innerWidth < 1024) {
        setCurrentSlide(prev => (prev + 1) % data.products.length);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [data.products.length]);

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
      setCurrentSlide((prev) => (prev + 1) % data.products.length);
    }
    
    if (isRightSwipe && window.innerWidth < 1024) {
      setCurrentSlide((prev) => (prev - 1 + data.products.length) % data.products.length);
    }
  };

  return (
    <section 
      className="w-full py-16 px-4 lg:px-16"
      style={{ backgroundColor: '#FAF8F1' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Top Header Section */}
        <div className="w-full flex flex-col items-center text-center mb-12">
          <p
            className="mb-4"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: 'clamp(12px, 2vw, 14px)',
              fontWeight: 600,
              color: '#B8860B',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            {data.tagline}
          </p>
          <h2
            className="mb-6"
            style={{
              fontFamily: 'Optima, Georgia, serif',
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 550,
              lineHeight: '120%',
              color: '#000000'
            }}
          >
            {data.heading}
          </h2>
          <p
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: 'clamp(15px, 2vw, 17px)',
              color: '#535862',
              lineHeight: '1.7',
              maxWidth: '900px'
            }}
          >
            {data.description}
          </p>
        </div>

        {/* Products Header */}
        <div className="flex justify-between items-center mb-8">
          <h3
            style={{
              fontFamily: 'Optima, Georgia, serif',
              fontSize: 'clamp(24px, 3vw, 32px)',
              fontWeight: 550,
              color: '#000000'
            }}
          >
            {data.productsHeading}
          </h3>
          <a
            href={data.viewAllLink.url}
            className="bg-[#7D1A13] text-white px-6 py-2.5 rounded-md font-semibold hover:opacity-90 transition-opacity"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: 'clamp(14px, 2vw, 16px)'
            }}
          >
            {data.viewAllLink.text}
          </a>
        </div>

        {/* Desktop: Grid Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {data.products.map((product, index) => (
            <ProductCard key={index} product={product} />
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
              {data.products.map((product, index) => (
                <div 
                  key={index}
                  className="w-full flex-shrink-0 px-2"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Dots */}
          <div className="flex justify-center mt-6 space-x-2">
            {data.products.map((_, index) => (
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
                aria-label={`Go to product ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Product Card Component
const ProductCard = ({ product }: { product: Product }) => {
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <div className="bg-transparent rounded-lg overflow-hidden border-none flex flex-col h-full">
      {/* Image with Overlays */}
      <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover"
        />
        
        {/* Bookmark Button */}
        <button
          onClick={() => setIsFavorited(!isFavorited)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
          aria-label="Save for later"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill={isFavorited ? "#7D1A13" : "#FFFFFF"}
            stroke="none"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>

        {/* Format Badges */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          {product.hasVideo && (
            <span
              className="px-3 py-1 rounded-md text-white text-xs font-semibold"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                fontFamily: 'Avenir Next, sans-serif'
              }}
            >
              Video
            </span>
          )}
          {product.hasAudio && (
            <span
              className="px-3 py-1 rounded-md text-white text-xs font-semibold"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                fontFamily: 'Avenir Next, sans-serif'
              }}
            >
              Audio
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col gap-3 flex-grow">
        {/* Category & Price */}
        <div className="flex justify-between items-start">
          <span
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: 'clamp(12px, 2vw, 14px)',
              fontWeight: 600,
              color: '#7D1A13'
            }}
          >
            {product.category}
          </span>
          <span
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: 'clamp(16px, 2.5vw, 18px)',
              fontWeight: 600,
              color: '#000000'
            }}
          >
            {product.price}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontFamily: 'Optima, sans-serif',
            fontSize: 'clamp(18px, 3vw, 22px)',
            fontWeight: 550,
            color: '#000000',
            lineHeight: '1.3'
          }}
        >
          {product.title}
        </h3>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: 'Avenir Next, sans-serif',
            fontSize: 'clamp(14px, 2vw, 16px)',
            fontWeight: 600,
            color: '#2C2C2C',
            lineHeight: '1.5'
          }}
        >
          {product.subtitle}
        </p>

        {/* Description */}
        <p
          className="flex-grow"
          style={{
            fontFamily: 'Avenir Next, sans-serif',
            fontSize: 'clamp(13px, 2vw, 15px)',
            color: '#6B7280',
            lineHeight: '1.6'
          }}
        >
          {product.description}
        </p>

        {/* Add to Cart Button */}
        <a
          href={product.cartUrl}
          className="w-full px-4 py-3 rounded-md font-semibold text-center transition-colors hover:bg-gray-50 mt-2"
          style={{
            backgroundColor: 'white',
            border: '1.5px solid #D1D5DB',
            color: '#2C2C2C',
            fontFamily: 'Avenir Next, sans-serif',
            fontSize: 'clamp(14px, 2vw, 16px)'
          }}
        >
          Add to cart
        </a>
      </div>
    </div>
  );
};

export default StoreProductSection;