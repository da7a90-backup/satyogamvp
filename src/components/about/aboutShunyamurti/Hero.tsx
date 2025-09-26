'use client'

import React, { useState, useEffect } from 'react';

// About Hero Section
const AboutHeroSection = () => {
  return (
    <section 
      className="relative w-full flex items-end overflow-hidden bg-cover bg-center h-[55vh] lg:h-screen"
      style={{
        minHeight: '400px',
        backgroundImage: 'url(/aboutshunyabanner.jpg)'
      }}
    >
      {/* Blur effects */}
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4" style={{
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        clipPath: 'polygon(0% 100%, 0% 0%, 100% 100%)'
      }} />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3" style={{
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        clipPath: 'polygon(0% 100%, 0% 0%, 100% 100%)'
      }} />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2" style={{
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        clipPath: 'polygon(0% 100%, 0% 0%, 100% 100%)'
      }} />

      {/* Content Container */}
      <div 
        className="relative z-10 w-full flex justify-start items-end pb-16 px-8 lg:px-16"
        style={{
          maxWidth: '1440px',
          margin: '0 auto'
        }}
      >
        <div 
          className="flex flex-col justify-end items-start gap-8"
          style={{
            maxWidth: '840px'
          }}
        >
          <div className="w-full flex items-center">
            <span 
              className="text-white uppercase tracking-wide font-medium"
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '16px',
                lineHeight: '24px'
              }}
            >
              ABOUT
            </span>
          </div>
          <h1 
            className="text-white w-full"
            style={{
              fontFamily: 'Optima, Georgia, serif',
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              fontWeight: 550,
              lineHeight: '125%',
              letterSpacing: '-0.02em'
            }}
          >
            Shunyamurti
          </h1>
          <p 
            className="text-white w-full"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: 'clamp(16px, 2vw, 20px)',
              fontWeight: 500,
              lineHeight: '140%',
              color: 'rgba(255, 255, 255, 0.8)'
            }}
          >
            The dwarf dancing at the feet of our lord
          </p>
        </div>
      </div>
    </section>
  );
};



export default AboutHeroSection;