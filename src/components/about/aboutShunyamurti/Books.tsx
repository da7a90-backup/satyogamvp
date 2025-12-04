'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ShoppingCart, Heart } from 'lucide-react';

interface Book {
  id: string;
  slug: string;
  title: string;
  short_description?: string;
  price: number;
  type: string;
  featured_image?: string;
  categories?: string[];
}

// Modal Component
function ActionModal({ isOpen, onClose, message }: { isOpen: boolean; onClose: () => void; message: string }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-[#942017]/10 rounded-full flex items-center justify-center mx-auto">
              <ShoppingCart className="w-8 h-8 text-[#942017]" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Feature Under Development</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={onClose}
            className="w-full bg-[#942017] hover:bg-[#942017]/90 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

const BooksSection = ({ books: apiBooks }: { books: Book[] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Transform API books to component format
  const books = apiBooks.slice(0, 3).map((book) => ({
    id: book.id,
    slug: book.slug,
    title: book.title,
    category: book.categories?.[0] || 'E-Books',
    price: `$${Number(book.price).toFixed(2)}`,
    type: book.type === 'EBOOK' ? 'Text' : book.type,
    image: book.featured_image || null,
    description: book.short_description || 'Book description'
  }));

  // Auto-slide functionality for mobile only
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % books.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [books.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % books.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + books.length) % books.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleAddToCart = () => {
    setModalMessage('Add to cart functionality under active development, try again in a couple of days!');
    setModalOpen(true);
  };

  const handleBookmark = () => {
    setModalMessage('Save for later functionality under active development, try again in a couple of days!');
    setModalOpen(true);
  };

  return (
    <section 
      className="relative w-full flex flex-col items-start py-16 lg:py-28 px-4 lg:px-16"
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
              STORE
            </span>
          </div>

          {/* Main Title */}
          <h2 
            className="text-black text-center w-full"
            style={{
              fontFamily: 'Optima, Georgia, serif',
              fontWeight: 550,
              fontSize: 'clamp(28px, 4vw, 48px)',
              lineHeight: '125%',
              letterSpacing: '-0.02em'
            }}
          >
            Books by Shunyamurti
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
            Shunyamurti's books convey the knowledge needed to gain mastery over the ego mind and attain complete liberation from illusion and anxiety—in fact, to transcend every kind of suffering. This is the great value of understanding these teachings. Four mind-expanding and heart-opening volumes have been published:
          </p>
        </div>

        {/* Book Count and View All */}
        <div 
          className="w-full flex flex-row justify-between items-end"
          style={{
            gap: '40px'
          }}
        >
          {/* Book Count */}
          <span
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '18px',
              fontWeight: 600,
              lineHeight: '28px',
              color: '#111927'
            }}
          >
            {apiBooks.length} {apiBooks.length === 1 ? 'item' : 'items'}
          </span>

          {/* View All Button */}
          <Link
            href="/store?type=EBOOK"
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
          </Link>
        </div>

        {/* Desktop Grid - Exactly as Original */}
        <div 
          className="hidden lg:grid lg:grid-cols-3 w-full"
          style={{
            gap: '32px'
          }}
        >
          {books.map((book) => (
            <div
              key={book.id}
              className="flex flex-col items-start"
              style={{
                width: '421px',
                minHeight: '583px',
                gap: '8px',
                isolation: 'isolate'
              }}
            >
              {/* Book Image Container */}
              <div 
                className="relative w-full"
                style={{
                  width: '421px',
                  height: '356px',
                  background: '#E4DBCD',
                  borderRadius: '8px'
                }}
              >
                {/* Bookmark Icon */}
                <button
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors backdrop-blur-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    handleBookmark();
                  }}
                >
                  <Heart className="w-4 h-4 text-white" />
                </button>

                {/* Book Cover Image */}
                <div
                  className="absolute"
                  style={{
                    width: '169.24px',
                    height: '269px',
                    left: '126px',
                    top: '48px'
                  }}
                >
                  {book.image ? (
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      style={{
                        borderRadius: '2.37536px',
                        boxShadow: '4.27565px 4.27565px 9.50144px rgba(0, 0, 0, 0.25)'
                      }}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        backgroundColor: '#D4C5B3',
                        borderRadius: '2.37536px',
                        boxShadow: '4.27565px 4.27565px 9.50144px rgba(0, 0, 0, 0.25)'
                      }}
                    >
                      <span style={{ color: '#6b7280', fontSize: '12px', textAlign: 'center', padding: '8px' }}>
                        {book.title}
                      </span>
                    </div>
                  )}
                </div>

                {/* Type Badge */}
                <div 
                  className="absolute flex items-center"
                  style={{
                    width: '34.47px',
                    height: '21.56px',
                    left: '13px',
                    bottom: '12.44px'
                  }}
                >
                  <div
                    className="flex justify-center items-center"
                    style={{
                      width: '34.47px',
                      height: '21.56px',
                      background: 'rgba(82, 82, 82, 0.4)',
                      backdropFilter: 'blur(4px)',
                      borderRadius: '5.38947px',
                      padding: '1.34737px 8.08421px 1.34737px 5.38947px'
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '10px',
                        fontWeight: 500,
                        lineHeight: '18px',
                        color: '#F3F4F6'
                      }}
                    >
                      {book.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content Bottom */}
              <div
                className="flex flex-col items-start flex-1"
                style={{
                  width: '421px',
                  gap: '16px'
                }}
              >
                {/* Header with Category, Title, and Price */}
                <div
                  className="flex flex-row items-start w-full"
                  style={{
                    gap: '16px',
                    minHeight: '51px'
                  }}
                >
                  {/* Category and Title */}
                  <div
                    className="flex flex-col items-start flex-1"
                    style={{
                      gap: '8px'
                    }}
                  >
                    {/* Category */}
                    <span 
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 700,
                        fontSize: '14px',
                        lineHeight: '150%',
                        color: '#942017'
                      }}
                    >
                      {book.category}
                    </span>

                    {/* Title */}
                    <h3 
                      style={{
                        fontFamily: 'Avenir Next, sans-serif',
                        fontWeight: 600,
                        fontSize: '20px',
                        lineHeight: '30px',
                        color: '#000000'
                      }}
                    >
                      {book.title}
                    </h3>
                  </div>

                  {/* Price */}
                  <div 
                    style={{
                      width: '62px',
                      height: '30px'
                    }}
                  >
                    <span 
                      style={{
                        fontFamily: 'Roboto, sans-serif',
                        fontWeight: 600,
                        fontSize: '20px',
                        lineHeight: '150%',
                        color: '#000000'
                      }}
                    >
                      {book.price}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p
                  className="line-clamp-4"
                  style={{
                    width: '421px',
                    fontFamily: 'Avenir Next, sans-serif',
                    fontWeight: 400,
                    fontSize: '16px',
                    lineHeight: '24px',
                    color: '#384250',
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {book.description}
                </p>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  style={{
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '10px 14px',
                    gap: '4px',
                    width: '421px',
                    height: '40px',
                    marginTop: 'auto',
                    background: '#FFFFFF',
                    border: '1px solid #D5D7DA',
                    boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Avenir Next, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      lineHeight: '20px',
                      color: '#414651'
                    }}
                  >
                    Add to cart
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="lg:hidden relative w-full">
          <div className="overflow-hidden rounded-lg">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${currentSlide * 100}%)`
              }}
            >
              {books.map((book) => (
                <div key={book.id} className="w-full flex-shrink-0 px-2">
                  <div className="flex flex-col items-start w-full max-w-sm mx-auto bg-white rounded-lg overflow-hidden shadow-sm">
                    {/* Mobile Book Image */}
                    <div 
                      className="relative w-full h-80"
                      style={{
                        background: '#E4DBCD'
                      }}
                    >
                      {/* Bookmark Icon */}
                      <button
                        className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors backdrop-blur-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          handleBookmark();
                        }}
                      >
                        <Heart className="w-4 h-4 text-white" />
                      </button>

                      {/* Book Cover */}
                      <div className="absolute inset-0 flex items-center justify-center p-8">
                        <div className="w-32 h-48">
                          {book.image ? (
                            <img
                              src={book.image}
                              alt={book.title}
                              className="w-full h-full object-cover rounded shadow-lg"
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center bg-[#D4C5B3] rounded shadow-lg"
                            >
                              <span className="text-gray-600 text-xs text-center px-2">
                                {book.title}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Type Badge */}
                      <div className="absolute bottom-3 left-3">
                        <div
                          className="px-3 py-1 rounded text-xs font-medium text-white"
                          style={{
                            background: 'rgba(82, 82, 82, 0.4)',
                            backdropFilter: 'blur(4px)'
                          }}
                        >
                          {book.type}
                        </div>
                      </div>
                    </div>

                    {/* Mobile Content */}
                    <div className="p-4 w-full space-y-3">
                      {/* Category and Price Row */}
                      <div className="flex justify-between items-start">
                        <span 
                          className="text-sm font-bold"
                          style={{ color: '#942017' }}
                        >
                          {book.category}
                        </span>
                        <span 
                          className="text-lg font-semibold"
                          style={{ color: '#000000' }}
                        >
                          {book.price}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 
                        className="text-lg font-semibold text-black"
                        style={{
                          fontFamily: 'Avenir Next, sans-serif'
                        }}
                      >
                        {book.title}
                      </h3>

                      {/* Description */}
                      <p 
                        className="text-sm text-gray-600 line-clamp-4"
                        style={{
                          fontFamily: 'Avenir Next, sans-serif',
                          lineHeight: '20px'
                        }}
                      >
                        {book.description}
                      </p>

                      {/* Add to Cart Button */}
                      <button
                        onClick={handleAddToCart}
                        className="w-full py-2 px-4 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        style={{
                          fontFamily: 'Avenir Next, sans-serif',
                          boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)'
                        }}
                      >
                        Add to cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 bg-white bg-opacity-90 rounded-full p-3 shadow-lg hover:bg-opacity-100 transition-all duration-200"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 bg-white bg-opacity-90 rounded-full p-3 shadow-lg hover:bg-opacity-100 transition-all duration-200"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-6 space-x-2">
            {books.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  currentSlide === index 
                    ? 'w-6' 
                    : 'hover:bg-gray-600'
                }`}
                style={{
                  backgroundColor: currentSlide === index ? '#7D1A13' : '#9CA3AF'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      <ActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        message={modalMessage}
      />
    </section>
  );
};

export default BooksSection;