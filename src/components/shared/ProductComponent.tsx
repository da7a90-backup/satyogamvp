import { useState } from 'react';
import { Info } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface ImageData {
  src: string;
  alt: string;
}

interface ProductComponentData {
  tagline: string;
  title: string;
  price: string;
  priceNote: string;
  description: string;
  accommodation: string;
  meals: string;
  dateLabel: string;
  dateOptions: string[];
  memberLabel: string;
  memberOptions: string[];
  buttonText: string;
  buttonUrl: string;
  membershipText: string;
  membershipLink: string;
  membershipLinkUrl: string;
  membershipNote: string;
  images: ImageData[];
}

// ============================================================================
// COMPONENT
// ============================================================================

const ProductComponent = ({ data }: { data: ProductComponentData }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <section 
      className="w-full flex flex-col items-center px-4 lg:px-16 py-16 lg:py-20"
      style={{ backgroundColor: '#FAF8F1' }}
    >
      <div className="w-full max-w-7xl mx-auto">
        {/* Mobile: Image Gallery at Top */}
        <div className="lg:hidden mb-8">
          {/* Main Hero Image */}
          <div className="w-full mb-4 rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <img
              src={data.images[selectedImage].src}
              alt={data.images[selectedImage].alt}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnail Row - Hide currently selected image */}
          <div className="grid grid-cols-4 gap-3">
            {data.images
              .filter((_, index) => index !== selectedImage)
              .map((image, filterIndex) => {
                const originalIndex = data.images.findIndex(
                  (img, idx) => idx !== selectedImage && img.src === image.src
                );
                return (
                  <button
                    key={originalIndex}
                    onClick={() => setSelectedImage(originalIndex)}
                    className="rounded-xl overflow-hidden"
                    style={{ aspectRatio: '1/1' }}
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
          </div>
        </div>

        {/* Desktop: Two Column Layout */}
        <div className="flex flex-col lg:flex-row items-start" style={{ gap: 'clamp(32px, 5vw, 64px)' }}>
          {/* Left: Image Gallery (Desktop Only) */}
          <div className="hidden lg:flex items-start" style={{ gap: '24px' }}>
            {/* Thumbnail Column */}
            <div className="flex flex-col" style={{ gap: '16px' }}>
              {data.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`rounded-xl overflow-hidden transition-opacity ${
                    selectedImage === index ? 'opacity-100' : 'opacity-60 hover:opacity-80'
                  }`}
                  style={{ width: '110px', height: '110px' }}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="rounded-2xl overflow-hidden" style={{ width: '500px', height: '600px' }}>
              <img
                src={data.images[selectedImage].src}
                alt={data.images[selectedImage].alt}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right: Booking Form */}
          <div className="flex-1 w-full">
            {/* Tagline */}
            <div className="mb-2">
              <span
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  lineHeight: '24px',
                  color: '#B8860B',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                {data.tagline}
              </span>
            </div>

            {/* Title */}
            <h2
              className="mb-4"
              style={{
                fontFamily: 'Optima, Georgia, serif',
                fontSize: 'clamp(28px, 4vw, 40px)',
                fontWeight: 550,
                lineHeight: '120%',
                color: '#000000'
              }}
            >
              {data.title}
            </h2>

            {/* Price with Info Icon */}
            <div className="flex items-center mb-6" style={{ gap: '8px' }}>
              <Info size={20} style={{ color: '#6B7280' }} />
              <span
                style={{
                  fontFamily: 'Optima, Georgia, serif',
                  fontSize: 'clamp(28px, 4vw, 32px)',
                  fontWeight: 600,
                  color: '#000000'
                }}
              >
                {data.price}
              </span>
              <span
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '16px',
                  fontWeight: 400,
                  color: '#384250'
                }}
              >
                {data.priceNote}
              </span>
            </div>

            {/* Description */}
            <p
              className="mb-4"
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '16px',
                fontWeight: 400,
                lineHeight: '24px',
                color: '#384250'
              }}
            >
              {data.description}
            </p>

            {/* Accommodation */}
            <p
              className="mb-2"
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '16px',
                fontWeight: 400,
                lineHeight: '24px',
                color: '#384250'
              }}
            >
              {data.accommodation}
            </p>

            {/* Meals */}
            <p
              className="mb-8"
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '16px',
                fontWeight: 400,
                lineHeight: '24px',
                color: '#384250'
              }}
            >
              {data.meals}
            </p>

            {/* Date Selector */}
            <div className="mb-6">
              <label
                className="block mb-2"
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#000000'
                }}
              >
                {data.dateLabel}
              </label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-gray-300 appearance-none bg-white"
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '16px',
                  color: '#384250',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23384250' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 16px center'
                }}
              >
                {data.dateOptions.map((option, index) => (
                  <option key={index}>{option}</option>
                ))}
              </select>
            </div>

            {/* Member Selector */}
            <div className="mb-6">
              <label
                className="block mb-2"
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#000000'
                }}
              >
                {data.memberLabel}
              </label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-gray-300 appearance-none bg-white"
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '16px',
                  color: '#9CA3AF',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23384250' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 16px center'
                }}
              >
                {data.memberOptions.map((option, index) => (
                  <option key={index}>{option}</option>
                ))}
              </select>
            </div>

            {/* Apply Button */}
            <a
              href={data.buttonUrl}
              className="w-full py-4 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 mb-4 block text-center"
              style={{
                backgroundColor: '#7D1A13',
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '16px'
              }}
            >
              {data.buttonText}
            </a>

            {/* Membership Link */}
            <p
              className="text-center"
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '14px',
                color: '#384250'
              }}
            >
              {data.membershipText}{' '}
              <a
                href={data.membershipLinkUrl}
                style={{
                  color: '#000000',
                  textDecoration: 'underline',
                  fontWeight: 600
                }}
              >
                {data.membershipLink}
              </a>{' '}
              {data.membershipNote}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductComponent;