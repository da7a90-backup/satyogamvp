// components/sections/CtaSection.tsx (Updated)
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface CtaSectionProps {
  eyebrow?: string;
  heading: string;
  description: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  useVideo?: boolean;
  darkMode?: boolean;
  overlayOpacity?: number;
}

const CtaSection: React.FC<CtaSectionProps> = ({
  eyebrow,
  heading,
  description,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  backgroundImage,
  backgroundVideo,
  useVideo = false,
  darkMode = true,
  overlayOpacity = 0.7
}) => {
  const textColorClass = darkMode ? 'text-white' : 'text-gray-900';
  const overlayStyle = {
    backgroundColor: darkMode ? `rgba(0, 0, 0, ${overlayOpacity})` : `rgba(255, 255, 255, ${overlayOpacity})`
  };

  return (
    <section className="relative py-16 lg:py-24 overflow-hidden">
      {/* Background Media */}
      {useVideo && backgroundVideo ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
      ) : backgroundImage && (
        <Image
          src={backgroundImage}
          alt="CTA Background"
          fill
          className="object-cover"
        />
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0" style={overlayStyle} />
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {eyebrow && (
          <p className="text-sm font-medium tracking-wide uppercase text-amber-400 mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {eyebrow}
          </p>
        )}
        
        <h2 className={`text-3xl lg:text-4xl font-light mb-6 ${textColorClass}`} style={{ fontFamily: 'Avenir Next, sans-serif' }}>
          {heading}
        </h2>
        
        <p className={`text-lg leading-relaxed mb-8 max-w-2xl mx-auto ${textColorClass} opacity-90`} style={{ fontFamily: 'Avenir Next, sans-serif' }}>
          {description}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {primaryButtonText && primaryButtonLink && (
            <Link
              href={primaryButtonLink}
              className="inline-flex items-center px-8 py-3 bg-white text-gray-900 font-medium rounded-md hover:bg-gray-100 transition-colors duration-200"
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              {primaryButtonText}
            </Link>
          )}
          
          {secondaryButtonText && secondaryButtonLink && (
            <Link
              href={secondaryButtonLink}
              className={`inline-flex items-center px-8 py-3 border font-medium rounded-md transition-colors duration-200 ${
                darkMode 
                  ? 'border-white text-white hover:bg-white hover:text-gray-900' 
                  : 'border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
              }`}
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              {secondaryButtonText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default CtaSection;