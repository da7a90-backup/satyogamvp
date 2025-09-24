'use client';

import Link from 'next/link';

const MembershipSection = () => {
  return (
    <section 
      className="relative w-full flex flex-col items-center overflow-hidden p-8 lg:p-16"
      style={{
        backgroundColor: '#FAF8F1'
      }}
    >
      {/* Membership Card */}
      <div 
        className="relative w-full max-w-7xl rounded-xl overflow-hidden h-[600px] lg:h-[900px]"
        style={{
          backgroundImage: 'linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(/members.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '12px'
        }}
      >
        {/* Content positioned at bottom */}
        <div 
          className="absolute bottom-0 left-0 right-0 p-4 lg:p-16"
          style={{
            background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))' // Stronger gradient for mobile
          }}
        >
          <div className="flex flex-col lg:flex-row items-end gap-4 lg:gap-20">
            {/* Text Content */}
            <div className="flex flex-col justify-center items-start gap-3 lg:gap-8 max-w-4xl">
              {/* Tagline */}
              <span 
                className="text-white uppercase tracking-wide text-xs lg:text-base font-bold"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: '150%'
                }}
              >
                MEMBERSHIP
              </span>

              {/* Heading */}
              <h2 
                className="text-white"
                style={{
                  fontFamily: 'Optima, Georgia, serif',
                  fontSize: 'clamp(1.5rem, 5vw, 4.5rem)',
                  fontWeight: 550,
                  lineHeight: '120%',
                  letterSpacing: '-0.02em'
                }}
              >
                A Revolutionary Approach to Living!
              </h2>

              {/* Description */}
              <p 
                className="text-white"
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: 'clamp(12px, 3vw, 18px)',
                  lineHeight: '1.4',
                  color: 'rgba(255, 255, 255, 0.9)',
                  maxWidth: '840px'
                }}
              >
                Join our global community and transform your life with Shunyamurti's teachings. Overcome anxiety, confusion, and limitations. Access weekly teachings, guided meditations, live encounters, and exclusive content, as you deepen your connection to wisdom and growth.
              </p>

              {/* Button */}
              <div className="flex flex-col lg:flex-row gap-4 mt-2">
                <Link
                  href="/browse-teachings"
                  className="inline-flex items-center justify-center px-4 py-2 lg:px-6 lg:py-3 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-300"
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)'
                  }}
                >
                  Browse Teachings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MembershipSection;