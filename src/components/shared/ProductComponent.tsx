import { useState } from 'react';
import { Info } from 'lucide-react';

const ShaktiBookingSection = () => {
  const [selectedImage, setSelectedImage] = useState(0);

  // Booking data structure - ready for CMS migration
  const bookingData = {
    tagline: "PROGRAM CONTRIBUTION",
    title: "Shakti Saturation Immersion",
    price: "$3950",
    priceNote: "(inc. all taxes)",
    description: "The Shakti Saturation Immersion is a life-changing rite of passage. Over four weeks, you can restore and redirect your existence, guided by profound teachings and the support of an ascending tribal community.",
    accommodation: "Accommodation: Stay in a charming cabin with a balcony and private bath.",
    meals: "Meals: Delectable vegetarian cuisine, with vegan and gluten-free options.",
    dateLabel: "Select a date",
    dateOptions: [
      "Dec. 17th - Jan. 13th, 2025"
    ],
    memberLabel: "Are you a member?",
    memberOptions: [
      "Select an option"
    ],
    buttonText: "Begin application",
    membershipText: "Discover our",
    membershipLink: "memberships",
    membershipNote: "to receive discounts",
    images: [
        { src: '/Contribution Gallery 1.jpg',  alt: 'Woman meditating by water' },
      { src: '/Contribution Gallery 2.jpg', alt: 'Interior cabin view' },
      { src: '/Contribution Gallery 3.jpg', alt: 'Bathroom interior' },
      { src: '/Contribution Gallery 4.jpg', alt: 'Evening meditation' },
      { src: '/Contribution Gallery 5.jpg', alt: 'Meditation by nature' }
    ]
  };

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
              src={bookingData.images[selectedImage].src}
              alt={bookingData.images[selectedImage].alt}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnail Row - Hide currently selected image */}
          <div className="grid grid-cols-4 gap-3">
            {bookingData.images
              .filter((_, index) => index !== selectedImage)
              .map((image, filterIndex) => {
                // Get the original index from the full array
                const originalIndex = bookingData.images.findIndex(
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
              {bookingData.images.map((image, index) => (
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
                src={bookingData.images[selectedImage].src}
                alt={bookingData.images[selectedImage].alt}
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
                {bookingData.tagline}
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
              {bookingData.title}
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
                {bookingData.price}
              </span>
              <span
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '16px',
                  fontWeight: 400,
                  color: '#384250'
                }}
              >
                {bookingData.priceNote}
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
              {bookingData.description}
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
              {bookingData.accommodation}
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
              {bookingData.meals}
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
                {bookingData.dateLabel}
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
                {bookingData.dateOptions.map((option, index) => (
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
                {bookingData.memberLabel}
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
                {bookingData.memberOptions.map((option, index) => (
                  <option key={index}>{option}</option>
                ))}
              </select>
            </div>

            {/* Apply Button */}
            <button
              className="w-full py-4 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 mb-4"
              style={{
                backgroundColor: '#7D1A13',
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '16px'
              }}
            >
              {bookingData.buttonText}
            </button>

            {/* Membership Link */}
            <p
              className="text-center"
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '14px',
                color: '#384250'
              }}
            >
              {bookingData.membershipText}{' '}
              <a
                href="#"
                style={{
                  color: '#000000',
                  textDecoration: 'underline',
                  fontWeight: 600
                }}
              >
                {bookingData.membershipLink}
              </a>{' '}
              {bookingData.membershipNote}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShaktiBookingSection;