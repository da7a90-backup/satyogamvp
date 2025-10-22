'use client';
import Link from 'next/link';

interface DonationSectionProps {
  eyebrow: string;
  heading: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  backgroundDecoration: string;
}

const DonationSection = ({
  eyebrow,
  heading,
  description,
  buttonText,
  buttonLink,
  backgroundDecoration
}: DonationSectionProps) => {
  return (
    <section 
      className="relative w-full flex flex-col items-center overflow-hidden py-8 px-4 -mt-20 lg:-mt-28 lg:py-24 lg:px-16"
      style={{
        backgroundColor: '#FAF8F1'
      }}
    >
      <div 
        className="relative w-full max-w-7xl bg-white border border-gray-300 rounded-2xl overflow-hidden p-8 lg:p-28 min-h-[280px] lg:min-h-[400px]"
        style={{
          boxShadow: '0px 94px 38px rgba(111, 62, 21, 0.01), 0px 53px 32px rgba(111, 62, 21, 0.05), 0px 24px 24px rgba(111, 62, 21, 0.09), 0px 6px 13px rgba(111, 62, 21, 0.1)',
          borderRadius: '16px'
        }}
      >
        <div 
          className="absolute lg:hidden"
          style={{
            left: '-300px',
            top: '-280px',
            width: '611px',
            height: '611px',
            backgroundImage: `url(${backgroundDecoration})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            opacity: 0.1,
            zIndex: 1
          }}
        />
        
        <div 
          className="absolute hidden lg:block"
          style={{
            left: '-71px',
            top: '-495px',
            width: '1454px',
            height: '1454px',
            backgroundImage: `url(${backgroundDecoration})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            opacity: 0.02,
            zIndex: 1
          }}
        />
        
        <div 
          className="relative z-10 flex flex-col items-center justify-center gap-4 lg:gap-6 h-full"
          style={{
            maxWidth: '560px',
            margin: '0 auto'
          }}
        >
          <div className="flex items-center">
            <span 
              className="uppercase tracking-wide text-sm font-medium"
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                color: '#B8860B'
              }}
            >
              {eyebrow}
            </span>
          </div>

          <h2 
            className="text-black text-center"
            style={{
              fontFamily: 'Optima, Georgia, serif',
              fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
              fontWeight: 550,
              lineHeight: '120%',
              letterSpacing: '-0.02em'
            }}
          >
            {heading}
          </h2>

          <p 
            className="text-center"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: 'clamp(14px, 4vw, 18px)',
              lineHeight: '1.6',
              color: '#384250'
            }}
          >
            {description}
          </p>

          <div className="flex justify-center mt-4 lg:mt-6">
            <Link
              href={buttonLink}
              className="inline-flex items-center px-6 py-3 lg:px-8 lg:py-3 text-white font-semibold rounded-lg transition-all duration-300 hover:opacity-90"
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
      </div>
    </section>
  );
};

export default DonationSection;