'use client';

import { useRef } from 'react';

interface HeroSectionProps {
  videoUrl: string;
  logoUrl: string;
  logoAlt: string;
  subtitle: string;
  onScrollClick?: () => void;
}

const HeroSection = ({ videoUrl, logoUrl, logoAlt, subtitle, onScrollClick }: HeroSectionProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const scrollToNext = () => {
    if (onScrollClick) {
      onScrollClick();
    }
  };

  // Seamless loop handler - restarts video before it ends to prevent gap
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && video.duration && video.duration - video.currentTime < 0.5) {
      video.currentTime = 0;
    }
  };

  // Ensure video metadata is loaded
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        // Silently handle autoplay restriction
      });
    }
  };

  const ChevronDown = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <section
      className="relative w-full h-screen min-h-screen lg:h-[115vh] lg:min-h-[115vh] flex items-center justify-center overflow-hidden m-0 p-0"
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        webkit-playsinline="true"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        style={{
          transform: 'translateZ(0)',
          willChange: 'transform',
          backfaceVisibility: 'hidden'
        }}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(182.15deg, rgba(50, 26, 26, 0) 10.8%, rgba(50, 26, 26, 0.595379) 50.06%, rgba(50, 26, 26, 0.1) 74.35%, #321A1A 96.31%)'
        }}
      />

      {/* Content Container */}
      <div 
        className="relative z-10 flex flex-col items-center text-center px-4"
        style={{
          filter: 'drop-shadow(0px 4px 40.5px rgba(0, 0, 0, 0.74))'
        }}
      >
        {/* Main Title Image */}
        <img
          src={logoUrl}
          alt={logoAlt}
          className="mb-4 w-full h-auto"
          style={{
            maxWidth: '547px',
            height: 'auto'
          }}
        />
        
        {/* Subtitle */}
        <p 
          className="text-white text-center"
          style={{
            fontFamily: 'Optima, Georgia, serif',
            fontWeight: 400,
            fontSize: 'clamp(17px, 4vw, 33px)',
            lineHeight: '120%',
            letterSpacing: '0%',
            maxWidth: '640px'
          }}
        >
          {subtitle}
        </p>
      </div>

      {/* Scroll Down Button */}
      <button
        onClick={scrollToNext}
        className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-300 rounded-full p-4 backdrop-blur-sm z-10"
        aria-label="Scroll down"
      >
        <ChevronDown />
      </button>
    </section>
  );
};

export default HeroSection;