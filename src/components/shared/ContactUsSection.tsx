'use client';

import { useState, useEffect } from 'react';

const ContactUsSection = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <section 
      className="relative w-full flex flex-col items-center py-4 lg:py-28 px-4 lg:px-16"
      style={{
        backgroundColor: '#FAF8F1'
      }}
    >
      {/* Content Container */}
      <div 
        className="w-full flex flex-col items-center"
        style={{
          maxWidth: '1312px',
          gap: '80px'
        }}
      >
        {/* Contact Card */}
        <div 
          className="relative w-full flex flex-col justify-center items-center p-8 lg:p-16 rounded-2xl border overflow-hidden"
          style={{
            background: '#FFFFFF',
            borderColor: '#C7C7C7',
            boxShadow: '0px 94px 38px rgba(111, 62, 21, 0.01), 0px 53px 32px rgba(111, 62, 21, 0.05), 0px 24px 24px rgba(111, 62, 21, 0.09), 0px 6px 13px rgba(111, 62, 21, 0.1)',
            gap: isMobile ? '40px' : '23px',
            isolation: 'isolate'
          }}
        >
          {/* Decorative Left Labyrinth - Desktop Only */}
          <div 
            className="absolute hidden lg:block"
            style={{
              width: '399px',
              height: '399px',
              left: '-200px',
              top: '-259px',
              backgroundImage: 'url(/innerlab.png)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              transform: 'matrix(1, 0, 0, -1, 0, 0)',
              opacity: 0.3,
              zIndex: 2
            }}
          />

          {/* Questions Section */}
          <div 
            className="flex flex-col items-center w-full"
            style={{
              gap: '24px',
              maxWidth: '560px'
            }}
          >
            {/* Heading */}
            <h2 
              className="text-black text-center"
              style={{
                fontFamily: 'Optima, Georgia, serif',
                fontWeight: 550,
                fontSize: '36px',
                lineHeight: '44px',
                letterSpacing: '-0.02em'
              }}
            >
              Still have questions?
            </h2>

            {/* Description - Different for mobile vs desktop */}
            <p 
              className="text-center"
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '18px',
                lineHeight: '28px',
                color: '#384250',
                maxWidth: isMobile ? '334px' : '560px'
              }}
            >
              {isMobile 
                ? "Find answers to common questions or reach out to Amrita, our Visit Coordinator, for personal assistance."
                : "If you feel drawn to begin this journey, contact us and we will guide you through the application process."
              }
            </p>
          </div>

          {/* Action Buttons */}
          <div 
            className="flex flex-col lg:flex-row items-center"
            style={{
              gap: isMobile ? '24px' : '16px',
              width: isMobile ? '334px' : 'auto'
            }}
          >
            {/* Mobile: Show both buttons, Desktop: Show only Contact Us */}
            {isMobile ? (
              <>
                {/* View FAQ Button - Mobile Only */}
                <button
                  className="w-full px-6 py-3 rounded-lg font-medium text-white transition-colors duration-300 hover:opacity-90"
                  style={{
                    backgroundColor: '#7D1A13',
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '16px',
                    lineHeight: '24px'
                  }}
                >
                  View our FAQ's
                </button>

                {/* Contact Us Button - Outlined for Mobile */}
                <button
                  className="w-full px-6 py-3 rounded-lg font-medium border-2 transition-colors duration-300 hover:bg-gray-50"
                  style={{
                    borderColor: '#C7C7C7',
                    color: '#384250',
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '16px',
                    lineHeight: '24px'
                  }}
                >
                  Contact us
                </button>
              </>
            ) : (
              /* Desktop: Only Contact Us Button - Filled */
              <button
                className="px-6 py-3 rounded-lg font-medium text-white transition-colors duration-300 hover:opacity-90"
                style={{
                  backgroundColor: '#7D1A13',
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '16px',
                  lineHeight: '24px'
                }}
              >
                Contact us
              </button>
            )}
          </div>

          {/* Decorative Right Labyrinth - Desktop Only */}
          <div 
            className="absolute hidden lg:block"
            style={{
              width: '399px',
              height: '399px',
              right: '-200px',
              top: '0px',
              backgroundImage: 'url(/innerlab.png)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              transform: 'matrix(1, 0, 0, -1, 0, 0)',
              opacity: 0.3,
              zIndex: 1
            }}
          />

          {/* Mobile Decorative Labyrinth */}
          <div 
            className="absolute lg:hidden"
            style={{
              width: '399px',
              height: '399px',
              left: '-200px',
              top: '-259px',
              backgroundImage: 'url(/innerlab.png)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              transform: 'matrix(1, 0, 0, -1, 0, 0)',
              opacity: 0.3,
              zIndex: 2
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default ContactUsSection;