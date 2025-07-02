// components/sections/Hero.tsx (Updated to support video)
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface HeroProps {
  heading: string;
  subheading?: string;
  content?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  useVideo?: boolean;
  darkMode?: boolean;
  overlayOpacity?: number;
}

const Hero: React.FC<HeroProps> = ({
  heading,
  subheading,
  content,
  buttonText,
  buttonLink,
  backgroundImage,
  backgroundVideo,
  useVideo = false,
  darkMode = true,
  overlayOpacity = 0.6
}) => {
  const textColorClass = darkMode ? 'text-white' : 'text-gray-900';
  const overlayClass = darkMode 
    ? `bg-black bg-opacity-${Math.round(overlayOpacity * 100)}` 
    : `bg-white bg-opacity-${Math.round(overlayOpacity * 100)}`;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
          alt="Hero Background"
          fill
          className="object-cover"
          priority
        />
      )}
      
      {/* Overlay */}
      <div className={`absolute inset-0 ${overlayClass}`} />
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <div>
            <h1 className={`text-5xl md:text-6xl lg:text-7xl font-light tracking-wider ${textColorClass}`}>
              {heading}
            </h1>
            {subheading && (
              <p className={`text-xl md:text-2xl mt-4 font-light ${textColorClass} opacity-90`}>
                {subheading}
              </p>
            )}
          </div>
          
          {/* Decorative Element */}
          <div className="flex justify-center py-8">
            <div className="w-24 h-24 border-2 border-amber-400 rounded-full flex items-center justify-center">
              <div className="w-16 h-16 border border-amber-400 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-amber-400 rounded-full opacity-60"></div>
              </div>
            </div>
          </div>
          
          {content && (
            <p className={`text-lg md:text-xl leading-relaxed max-w-2xl mx-auto ${textColorClass} opacity-90`}>
              {content}
            </p>
          )}
          
          {buttonText && buttonLink && (
            <div>
              <Link
                href={buttonLink}
                className="inline-flex items-center px-8 py-4 bg-amber-800 text-white font-medium rounded-md hover:bg-amber-900 transition-colors duration-300 text-lg"
              >
                {buttonText}
              </Link>
            </div>
          )}
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center animate-bounce">
            <div className={`w-6 h-10 border-2 ${darkMode ? 'border-white' : 'border-gray-900'} rounded-full flex justify-center`}>
              <div className={`w-1 h-3 ${darkMode ? 'bg-white' : 'bg-gray-900'} rounded-full mt-2`}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;