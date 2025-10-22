'use client';
import Link from 'next/link';

interface MembershipSectionProps {
  eyebrow: string;
  heading: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage: string;
}

const MembershipSection = ({
  eyebrow,
  heading,
  description,
  buttonText,
  buttonLink,
  backgroundImage
}: MembershipSectionProps) => {
  return (
    <section 
      className="relative w-full flex flex-col items-center overflow-hidden py-20 px-4 lg:py-28 lg:px-16"
      style={{
        backgroundColor: '#FAF8F1'
      }}
    >
      <div 
        className="relative w-full max-w-7xl rounded-xl overflow-hidden h-[600px] lg:h-[900px]"
        style={{
          backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '12px'
        }}
      >
        <div 
          className="absolute bottom-0 left-0 right-0 p-4 lg:p-16"
          style={{
            background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))'
          }}
        >
          <div className="flex flex-col lg:flex-row items-end gap-4 lg:gap-20">
            <div className="flex flex-col justify-center items-start gap-3 lg:gap-8 max-w-4xl">
              <span 
                className="text-white uppercase tracking-wide text-xs lg:text-base font-bold"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: '150%'
                }}
              >
                {eyebrow}
              </span>

              <h2 
                className="text-white"
                style={{
                  fontFamily: 'Optima, Georgia, serif',
                  fontSize: 'clamp(1.5rem, 5vw, 4.5rem)',
                  fontWeight: 550,
                  lineHeight: '120%',
                  letterSpacing: '-0.02em'
                }}
              >
                {heading}
              </h2>

              <p 
                className="text-white"
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: 'clamp(12px, 3vw, 18px)',
                  lineHeight: '1.4',
                  color: 'rgba(255, 255, 255, 0.9)',
                  maxWidth: '840px'
                }}
              >
                {description}
              </p>

              <div className="flex flex-col lg:flex-row gap-4 mt-2">
                <Link
                  href={buttonLink}
                  className="inline-flex items-center justify-center px-4 py-2 lg:px-6 lg:py-3 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-300"
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)'
                  }}
                >
                  {buttonText}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MembershipSection;