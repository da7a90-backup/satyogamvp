'use client';
import Link from 'next/link';

interface ShunyamurtiSectionProps {
  eyebrow: string;
  quote: string;
  content: string[];
  buttonText: string;
  buttonLink: string;
  image: string;
  imageAlt: string;
  backgroundDecoration: string;
}

const ShunyamurtiSection = ({
  eyebrow,
  quote,
  content,
  buttonText,
  buttonLink,
  image,
  imageAlt,
  backgroundDecoration
}: ShunyamurtiSectionProps) => {
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
      <div className="relative w-full px-8 lg:flex-1 lg:max-w-xl order-1 lg:order-2">
        <div 
          className="absolute hidden lg:block"
          style={{
            right: '-120px',
            top: '-150px',
            width: '389px',
            height: '389px',
            backgroundImage: `url(${backgroundDecoration})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            zIndex: 0,
            opacity: 0.3
          }}
        />
        
        <img
          src={image}
          alt={imageAlt}
          className="relative z-10 w-full h-auto object-cover rounded-xl mx-auto"
          style={{
            maxWidth: '636px',
            height: '620px',
            objectFit: 'cover',
            boxShadow: '33px 73px 32px rgba(0, 0, 0, 0.01), 19px 41px 27px rgba(0, 0, 0, 0.05), 8px 18px 20px rgba(0, 0, 0, 0.09), 2px 5px 11px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px'
          }}
        />
      </div>

      <div 
        className="w-full lg:flex-1 lg:max-w-2xl order-2 lg:order-1"
        style={{
          maxWidth: '616px',
          margin: '0 auto'
        }}
      >
        <div className="mb-6">
          <span 
            className="text-yellow-600 uppercase tracking-wide text-sm font-medium"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              color: '#B8860B'
            }}
          >
            {eyebrow}
          </span>
        </div>

        <blockquote 
          className="text-black mb-8"
          style={{
            fontFamily: 'Optima, Georgia, serif',
            fontSize: 'clamp(1.5rem, 4vw, 3rem)',
            fontWeight: 550,
            lineHeight: '120%',
            letterSpacing: '-1%'
          }}
        >
          "{quote}"
        </blockquote>

        <div className="space-y-6 mb-8">
          {content.map((paragraph, index) => (
            <p 
              key={index}
              className="text-gray-700"
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '16px',
                lineHeight: '150%',
                color: '#4A5568'
              }}
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="text-center lg:text-left">
          <Link
            href={buttonLink}
            className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 hover:opacity-90"
            style={{
              backgroundColor: '#7D1A13',
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '16px',
              fontWeight: 600
            }}
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ShunyamurtiSection;