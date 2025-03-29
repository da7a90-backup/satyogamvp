'use client';

import Link from 'next/link';
import Image from 'next/image';

interface HeroProps {
  heading: string;
  content: string;
  buttonText: string;
  buttonLink: string;
  darkMode?: boolean;
  backgroundImage?: string;
  alignContent?: 'center' | 'left' | 'right';
  size?: 'small' | 'medium' | 'large';
}

const Hero: React.FC<HeroProps> = ({ 
  heading = "Medium length hero heading goes here",
  content = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
  buttonText = "Button",
  buttonLink = "#",
  darkMode = true,
  backgroundImage,
  alignContent = 'center',
  size = 'medium'
}) => {
  // Determine padding based on size
  const paddingClasses = {
    small: 'py-12',
    medium: 'py-20',
    large: 'py-32'
  };
  
  // Determine text alignment
  const alignmentClasses = {
    center: 'text-center mx-auto',
    left: 'text-left mr-auto',
    right: 'text-right ml-auto'
  };
  
  return (
    <section className={`relative ${paddingClasses[size]} ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Background color or image */}
      {backgroundImage ? (
        <div className="absolute inset-0 z-0">
          <Image 
            src={backgroundImage}
            alt="Hero background"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className={`absolute inset-0 bg-black ${darkMode ? 'opacity-60' : 'opacity-30'}`}></div>
        </div>
      ) : (
        <div className={`absolute inset-0 z-0 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}></div>
      )}
      
      {/* Content */}
      <div className="container relative z-10 mx-auto px-4">
        <div className={`max-w-3xl ${alignmentClasses[alignContent]}`}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {heading}
          </h1>
          
          <p className="text-lg md:text-xl mb-8 opacity-90">
            {content}
          </p>
          
          <Link 
            href={buttonLink}
            className={`inline-block rounded-md px-6 py-3 font-medium transition-colors ${
              darkMode 
                ? 'bg-white text-gray-900 hover:bg-gray-100' 
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;