'use client';

import Link from 'next/link';

const AshramSection = () => {
  return (
    <section 
      className="relative w-full flex flex-col lg:flex-row items-center justify-between overflow-hidden"
      style={{
        backgroundColor: '#FAF8F1',
        minHeight: '816px',
        padding: '64px 16px',
        gap: '32px'
      }}
    >
      {/* Mobile: Images First, Desktop: Images on Left */}
      <div className="relative w-full px-8 lg:flex-1 lg:max-w-xl order-1 lg:order-1">
        {/* Main Large Image */}
        <div className="mb-4">
          <img
            src="/ashram1.png"
            alt="Sat Yoga Ashram in Costa Rica"
            className="w-full h-auto object-cover rounded-xl mx-auto"
            style={{
              maxWidth: '636px',
              height: '400px',
              objectFit: 'cover',
              boxShadow: '-33px 73px 32px rgba(0, 0, 0, 0.01), -19px 41px 27px rgba(0, 0, 0, 0.05), -8px 18px 20px rgba(0, 0, 0, 0.09), -2px 5px 11px rgba(0, 0, 0, 0.1)',
              borderRadius: '12px'
            }}
          />
        </div>

        {/* Three Smaller Images */}
        <div className="flex gap-3 justify-center">
          <div className="flex-1">
            <img
              src="/ashram2.png"
              alt="Ashram kitchen and dining"
              className="w-full h-auto object-cover rounded-lg"
              style={{
                height: '120px',
                objectFit: 'cover',
                boxShadow: '-33px 73px 32px rgba(0, 0, 0, 0.01), -19px 41px 27px rgba(0, 0, 0, 0.05), -8px 18px 20px rgba(0, 0, 0, 0.09), -2px 5px 11px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px'
              }}
            />
          </div>
          <div className="flex-1">
            <img
              src="/ashram3.png"
              alt="Ashram natural environment"
              className="w-full h-auto object-cover rounded-lg"
              style={{
                height: '120px',
                objectFit: 'cover',
                boxShadow: '-33px 73px 32px rgba(0, 0, 0, 0.01), -19px 41px 27px rgba(0, 0, 0, 0.05), -8px 18px 20px rgba(0, 0, 0, 0.09), -2px 5px 11px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px'
              }}
            />
          </div>
          <div className="flex-1">
            <img
              src="/ashram4.png"
              alt="Meditation at the ashram"
              className="w-full h-auto object-cover rounded-lg"
              style={{
                height: '120px',
                objectFit: 'cover',
                boxShadow: '-33px 73px 32px rgba(0, 0, 0, 0.01), -19px 41px 27px rgba(0, 0, 0, 0.05), -8px 18px 20px rgba(0, 0, 0, 0.09), -2px 5px 11px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px'
              }}
            />
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div 
        className="w-full lg:flex-1 lg:max-w-2xl order-2 lg:order-2"
        style={{
          maxWidth: '616px',
          margin: '0 auto'
        }}
      >
        {/* Section Tag */}
        <div className="mb-6">
          <span 
            className="text-yellow-600 uppercase tracking-wide text-sm font-medium"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              color: '#B8860B'
            }}
          >
            SAT YOGA ONLINE - SEAMLESS ACROSS ALL DEVICES
          </span>
        </div>

        {/* Main Heading */}
        <h2 
          className="text-black mb-8"
          style={{
            fontFamily: 'Optima, Georgia, serif',
            fontSize: 'clamp(1.5rem, 4vw, 3rem)',
            fontWeight: 550,
            lineHeight: '120%',
            letterSpacing: '-1%'
          }}
        >
          Rest in the Current of Your Infinite Nature
        </h2>

        {/* Description Paragraphs */}
        <div className="space-y-6 mb-8">
          <p 
            className="text-gray-700"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '16px',
              lineHeight: '150%',
              color: '#4A5568'
            }}
          >
            Experience the transformative power of Sat Yoga at our Ashram in the serene mountains of southern Costa Rica.
          </p>
          
          <p 
            className="text-gray-700"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '16px',
              lineHeight: '150%',
              color: '#4A5568'
            }}
          >
            With the luminous presence of Shunyamurti and the support of the sangha, our Ashram retreats offer an unparalleled opportunity to experience deep meditation, wisdom teachings, and community living, which will accelerate your journey toward Self-realization.
          </p>

          <p 
            className="text-gray-700"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '16px',
              lineHeight: '150%',
              color: '#4A5568'
            }}
          >
            Whether you seek a short-term retreat, a longer stay, or a life as an ashram resident, our programs are designed to catalyze your spiritual growth and dissolve the barriers that keep you from experiencing the fullness of Being.
          </p>
        </div>

        {/* Action Button */}
        <div className="text-center lg:text-left">
          <Link
            href="/ashram"
            className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 hover:opacity-90"
            style={{
              backgroundColor: '#7D1A13',
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '16px',
              fontWeight: 600
            }}
          >
            Learn more
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AshramSection;