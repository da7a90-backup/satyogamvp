'use client';

import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface ImageData {
  src: string;
  alt: string;
}

interface PriceOption {
  type: string;
  label: string;
  price: number;
  description?: string;
}

interface ProductComponentData {
  retreatType: 'onsite' | 'online';
  tagline: string;
  title: string;
  
  // Pricing
  basePrice: number; // Base price for limited access
  priceOptions?: PriceOption[]; // For online retreats with multiple access types
  memberDiscountPercentage?: number; // e.g., 10 for 10% discount
  scholarshipAvailable?: boolean;
  scholarshipDeadline?: string;
  
  // Online retreat specific
  fixedDate?: string;
  location?: string;
  accessDescription?: string;
  
  // Onsite retreat specific
  description?: string;
  accommodation?: string;
  meals?: string;
  dateLabel?: string;
  dateOptions?: string[];
  
  // Common fields
  memberLabel: string;
  memberOptions: string[];
  buttonText: string;
  buttonUrl: string;
  infoButtonText?: string;
  infoButtonUrl?: string;
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
  const [selectedAccessType, setSelectedAccessType] = useState(0);
  const [isMember, setIsMember] = useState(false);
  const [showScholarship, setShowScholarship] = useState(false);

  // Calculate current price based on selections
  const getCurrentPrice = () => {
    let price = data.basePrice;
    
    // If there are price options (online retreats), use selected option price
    if (data.priceOptions && data.priceOptions.length > 0) {
      price = data.priceOptions[selectedAccessType].price;
    }
    
    // Apply member discount if applicable
    if (isMember && data.memberDiscountPercentage) {
      price = price * (1 - data.memberDiscountPercentage / 100);
    }
    
    return price;
  };

  const currentPrice = getCurrentPrice();
  const originalPrice = data.priceOptions && data.priceOptions.length > 0 
    ? data.priceOptions[selectedAccessType].price 
    : data.basePrice;

  return (
    <section 
      className="w-full flex flex-col items-center px-4 lg:px-16 py-16 lg:py-20"
      style={{ backgroundColor: '#FAF8F1' }}
    >
      <div className="w-full max-w-7xl mx-auto">
        {/* Mobile: Image Gallery at Top */}
        <div className="lg:hidden mb-8">
          <div className="w-full mb-4 rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <img
              src={data.images[selectedImage].src}
              alt={data.images[selectedImage].alt}
              className="w-full h-full object-cover"
            />
          </div>

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

            {/* Price with Discount */}
            <div className="flex items-center mb-2" style={{ gap: '8px' }}>
              <Info size={20} style={{ color: '#6B7280' }} />
              <span
                style={{
                  fontFamily: 'Optima, Georgia, serif',
                  fontSize: 'clamp(28px, 4vw, 32px)',
                  fontWeight: 600,
                  color: '#000000'
                }}
              >
                ${currentPrice.toFixed(0)}
              </span>
              <span
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '16px',
                  fontWeight: 400,
                  color: '#384250'
                }}
              >
                (Incl. all taxes)
              </span>
            </div>

            {/* Show discount badge if member selected */}
            {isMember && data.memberDiscountPercentage && (
              <div className="flex items-center gap-2 mb-4">
                <span
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#6B7280',
                    textDecoration: 'line-through'
                  }}
                >
                  ${originalPrice.toFixed(0)}
                </span>
                <span
                  className="px-2 py-1 rounded"
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#7D1A13',
                    backgroundColor: '#FEF3F2'
                  }}
                >
                  {data.memberDiscountPercentage}% Member Discount
                </span>
              </div>
            )}

            {/* Online Retreat: Fixed Date Display */}
            {data.retreatType === 'online' && data.fixedDate && data.location && (
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="3" width="12" height="11" rx="2" stroke="#535862" strokeWidth="1.5"/>
                    <path d="M11 1v4M5 1v4M2 7h12" stroke="#535862" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span
                    style={{
                      fontFamily: 'Avenir Next, sans-serif',
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#384250'
                    }}
                  >
                    {data.fixedDate}
                  </span>
                </div>

                <span style={{ color: '#D1D5DB' }}>•</span>

                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M14 6.67c0 4.67-6 8.67-6 8.67s-6-4-6-8.67a6 6 0 1112 0z" stroke="#535862" strokeWidth="1.5"/>
                    <circle cx="8" cy="6.67" r="1.67" stroke="#535862" strokeWidth="1.5"/>
                  </svg>
                  <span
                    style={{
                      fontFamily: 'Avenir Next, sans-serif',
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#384250'
                    }}
                  >
                    {data.location}
                  </span>
                </div>
              </div>
            )}

            {/* Access Description */}
            {data.accessDescription && !showScholarship && (
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
                {data.priceOptions && data.priceOptions[selectedAccessType]?.description 
                  ? data.priceOptions[selectedAccessType].description
                  : data.accessDescription}
              </p>
            )}

            {/* Onsite Retreat: Description, Accommodation, Meals */}
            {data.retreatType === 'onsite' && (
              <>
                {data.description && (
                  <p className="mb-4" style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: '24px',
                    color: '#384250'
                  }}>
                    {data.description}
                  </p>
                )}

                {data.accommodation && (
                  <p className="mb-2" style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: '24px',
                    color: '#384250'
                  }}>
                    {data.accommodation}
                  </p>
                )}

                {data.meals && (
                  <p className="mb-8" style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: '24px',
                    color: '#384250'
                  }}>
                    {data.meals}
                  </p>
                )}
              </>
            )}

            {/* Onsite: Date Selector */}
            {data.retreatType === 'onsite' && data.dateOptions && (
              <div className="mb-6">
                <label className="block mb-2" style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#000000'
                }}>
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
            )}

            {/* Online: Access Type Selector */}
            {data.retreatType === 'online' && data.priceOptions && (
              <div className="mb-6">
                <label className="block mb-2" style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#000000'
                }}>
                  Select an option
                </label>
                <select
                  value={selectedAccessType}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'scholarship') {
                      setShowScholarship(true);
                    } else {
                      setShowScholarship(false);
                      setSelectedAccessType(parseInt(value));
                    }
                  }}
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
                  {data.priceOptions.map((option, index) => (
                    <option key={index} value={index}>
                      {option.label}
                    </option>
                  ))}
                  <option value="scholarship">Scholarship and Pay-What-You-Can</option>
                </select>
              </div>
            )}

            {/* Scholarship Info */}
            {showScholarship && (
              <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
                <p className="mb-3" style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: '#384250'
                }}>
                  A limited number of partial scholarships, including a pay-what-you-can option, are available for this program for those who feel called to join us but are in need of financial assistance.
                </p>
                {data.scholarshipDeadline && (
                  <p className="mb-3" style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#384250'
                  }}>
                    Application deadline: {data.scholarshipDeadline}
                  </p>
                )}
                {data.scholarshipAvailable ? (
                  <a
                    href="/apply?type=scholarship"
                    className="inline-block px-4 py-2 rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
                    style={{
                      backgroundColor: '#7D1A13',
                      fontFamily: 'Avenir Next, sans-serif',
                      fontSize: '14px'
                    }}
                  >
                    Apply for Scholarship
                  </a>
                ) : (
                  <p style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#DC2626'
                  }}>
                    Scholarships not available for this program
                  </p>
                )}
              </div>
            )}

            {/* Member Selector */}
            {!showScholarship && (
              <div className="mb-6">
                <label className="block mb-2" style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#000000'
                }}>
                  {data.memberLabel}
                </label>
                <select
                  value={isMember ? 'yes' : 'no'}
                  onChange={(e) => setIsMember(e.target.value === 'yes')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 appearance-none bg-white"
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '16px',
                    color: isMember ? '#384250' : '#9CA3AF',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23384250' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 16px center'
                  }}
                >
                  {data.memberOptions.map((option, index) => (
                    <option key={index} value={index === 0 ? 'no' : 'yes'}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Action Buttons */}
            {!showScholarship && (
              <>
                <a
                  href={data.buttonUrl}
                  className="w-full py-4 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 mb-3 block text-center"
                  style={{
                    backgroundColor: '#7D1A13',
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '16px'
                  }}
                >
                  {data.buttonText}
                </a>

                {data.infoButtonText && data.infoButtonUrl && (
                  <a
                    href={data.infoButtonUrl}
                    className="w-full py-4 rounded-lg font-semibold transition-all border-2 mb-4 block text-center"
                    style={{
                      borderColor: '#7D1A13',
                      color: '#7D1A13',
                      fontFamily: 'Avenir Next, sans-serif',
                      fontSize: '16px',
                      backgroundColor: 'transparent'
                    }}
                  >
                    {data.infoButtonText}
                  </a>
                )}
              </>
            )}

            {/* Membership Link */}
            <p className="text-center" style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '14px',
              color: '#384250'
            }}>
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