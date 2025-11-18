'use client';
import Link from 'next/link';

interface PlatformSectionProps {
  eyebrow: string;
  heading: string;
  content: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  imageAlt: string;
  backgroundDecoration: string;
}

const PlatformSection = ({
  eyebrow,
  heading,
  content,
  buttonText,
  buttonLink,
  image,
  imageAlt,
  backgroundDecoration
}: PlatformSectionProps) => {
  return (
    <section
      className="relative w-full overflow-hidden px-4 md:px-8 lg:px-16"
      style={{
        backgroundColor: '#FAF8F1',
        minHeight: '816px',
        paddingTop: '153px',
        paddingBottom: '64px'
      }}
    >
      <div className="relative z-10 flex flex-col md:items-center lg:items-start lg:flex-row justify-between" style={{ gap: '80px', maxWidth: '1440px', margin: '0 auto' }}>
      <div
        className="order-2 lg:order-1 flex-shrink-0 w-full md:w-auto md:max-w-[616px]"
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

        <h2 
          className="text-black mb-8"
          style={{
            fontFamily: 'Optima, Georgia, serif',
            fontSize: 'clamp(1.5rem, 4vw, 3rem)',
            fontWeight: 550,
            lineHeight: '120%',
            letterSpacing: '-1%'
          }}
        >
          {heading}
        </h2>

        <div className="space-y-6 mb-8">
          <p 
            className="text-gray-700"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '16px',
              lineHeight: '150%',
              color: '#4A5568'
            }}
          >
            {content}
          </p>
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

      <div
        className="order-1 lg:order-2 flex-shrink-0 w-full md:w-auto md:max-w-[616px]"
        style={{
          maxWidth: '616px',
          position: 'relative'
        }}
      >
        <div
          className="relative flex items-center justify-center"
          style={{
            width: '100%',
            height: '640px'
          }}
        >
          <div 
            className="absolute hidden lg:block"
            style={{
              left: '50%',
              top: '40%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              height: '100%',
              maxWidth: '700px',
              maxHeight: '700px',
              backgroundImage: `url(${backgroundDecoration})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              zIndex: 1,
              opacity: 0.8
            }}
          />

          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <img
              src={image}
              alt={imageAlt}
              className="w-max h-auto object-contain max-w-[500px] lg:max-w-[680px]"
              style={{
                paddingRight: '20%',
                filter: 'drop-shadow(33px 73px 32px rgba(0, 0, 0, 0.01)) drop-shadow(19px 41px 27px rgba(0, 0, 0, 0.05)) drop-shadow(8px 18px 20px rgba(0, 0, 0, 0.09)) drop-shadow(2px 5px 11px rgba(0, 0, 0, 0.1))'
              }}
            />
          </div>
        </div>
      </div>
      </div>
    </section>
  );
};

export default PlatformSection;