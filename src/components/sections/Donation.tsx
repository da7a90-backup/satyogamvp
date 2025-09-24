'use client';

import Link from 'next/link';

const DonationSection = () => {
  return (
    <section 
      className="relative w-full flex flex-col items-center overflow-hidden py-16 px-4 lg:py-28 lg:px-16"
      style={{
        backgroundColor: '#FAF8F1'
      }}
    >
      {/* Donation Card */}
      <div 
        className="relative w-full max-w-7xl bg-white border border-gray-300 rounded-2xl overflow-hidden p-8 lg:p-28 min-h-[600px] lg:min-h-[400px]"
        style={{
          boxShadow: '0px 94px 38px rgba(111, 62, 21, 0.01), 0px 53px 32px rgba(111, 62, 21, 0.05), 0px 24px 24px rgba(111, 62, 21, 0.09), 0px 6px 13px rgba(111, 62, 21, 0.1)',
          borderRadius: '16px'
        }}
      >
        {/* Background Decorative Element - Mobile positioning */}
        <div 
          className="absolute lg:hidden"
          style={{
            left: '-400px',
            top: '-400px',
            width: '500px',
            height: '500px',
            backgroundImage: 'url(/innerlab.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            opacity: 0.03,
            zIndex: 1
          }}
        />
        
        {/* Background Decorative Element - Desktop positioning */}
        <div 
          className="absolute hidden lg:block"
          style={{
            left: '-71px',
            top: '-495px',
            width: '1454px',
            height: '1454px',
            backgroundImage: 'url(/innerlab.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            opacity: 0.02,
            zIndex: 1
          }}
        />
        
        {/* Content Container */}
        <div 
          className="relative z-10 flex flex-col items-center justify-center gap-4 lg:gap-6 h-full"
          style={{
            maxWidth: '560px',
            margin: '0 auto'
          }}
        >
          {/* Section Tag */}
          <div className="flex items-center">
            <span 
              className="uppercase tracking-wide text-sm font-medium"
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                color: '#B8860B'
              }}
            >
              DONATE
            </span>
          </div>

          {/* Main Heading */}
          <h2 
            className="text-black text-center"
            style={{
              fontFamily: 'Optima, Georgia, serif',
              fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
              fontWeight: 550,
              lineHeight: '120%',
              letterSpacing: '-0.02em'
            }}
          >
            Support our sacred mission
          </h2>

          {/* Description */}
          <p 
            className="text-center"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: 'clamp(14px, 4vw, 18px)',
              lineHeight: '1.6',
              color: '#384250'
            }}
          >
            If you recognize the urgency to create a more spiritual and ecological culture, and if you want to be part of the process of human and planetary rebirth, please support this unique and vital project.
          </p>

          {/* Action Button */}
          <div className="flex justify-center mt-4 lg:mt-6">
            <Link
              href="/donate"
              className="inline-flex items-center px-6 py-3 lg:px-8 lg:py-3 text-white font-semibold rounded-lg transition-all duration-300 hover:opacity-90"
              style={{
                backgroundColor: '#7D1A13',
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '16px',
                fontWeight: 600
              }}
            >
              Donate
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DonationSection;