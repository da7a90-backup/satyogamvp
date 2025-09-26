'use client';

import React from 'react';

const FreeTeachingsSection = () => {
  return (
    <section 
      className="flex flex-col items-center px-4 sm:px-8 md:px-16 py-28 sm:py-32 md:py-40 gap-20"
      style={{ backgroundColor: '#FAF8F1' }}
    >
      {/* Container */}
      <div className="flex flex-col items-center gap-8 w-full max-w-3xl">
        
        {/* Tagline */}
        <div className="flex items-center">
          <span 
            className="text-sm sm:text-base font-medium tracking-wider uppercase"
            style={{ 
              fontFamily: 'Avenir Next, sans-serif',
              color: '#B8860B'
            }}
          >
            FREE TEACHINGS LIBRARY
          </span>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center gap-8 text-center">
          {/* Heading */}
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl font-medium leading-tight"
            style={{ 
              fontFamily: 'Optima, sans-serif',
              fontWeight: 550,
              letterSpacing: '-0.02em',
              color: '#000000'
            }}
          >
            Unlock Your Inner Genius
          </h2>

          {/* Description */}
          <p 
            className="text-base sm:text-lg leading-7 max-w-3xl"
            style={{ 
              fontFamily: 'Avenir Next, sans-serif',
              color: '#384250'
            }}
          >
            This selection of some of Shunyamurti's most empowering ideas will be both healing and liberating. These videos, guided meditations, and essays include some from our public channels and others that are only available to members.
          </p>

          {/* Button */}
          <button 
            className="flex items-center justify-center px-4 py-2.5 rounded-lg text-white font-medium text-sm hover:opacity-90 transition-opacity"
            style={{ 
              backgroundColor: '#7D1A13',
              fontFamily: 'Avenir Next, sans-serif',
              boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)',
              width: '120px',
              height: '44px'
            }}
          >
            Learn more
          </button>
        </div>
      </div>
    </section>
  );
};

export default FreeTeachingsSection;