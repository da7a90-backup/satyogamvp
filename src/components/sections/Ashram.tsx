'use client';
import Link from 'next/link';

interface AshramSectionProps {
  eyebrow: string;
  heading: string;
  content: string[];
  buttonText: string;
  buttonLink: string;
  images: {
    main: string;
    secondary: string[];
  };
}

const AshramSection = ({
  eyebrow,
  heading,
  content,
  buttonText,
  buttonLink,
  images
}: AshramSectionProps) => {
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
      {/* Flex Container for Image Gallery and Content */}
      <div className="relative z-10 flex flex-col md:items-center lg:items-start lg:flex-row justify-between" style={{ gap: '80px', maxWidth: '1440px', margin: '0 auto' }}>
        {/* Image Gallery - Left side on desktop */}
        <div
          className="order-1 lg:order-1 flex-shrink-0 w-full md:w-auto md:max-w-[616px]"
          style={{
            filter: 'drop-shadow(-46px 60px 30px rgba(0, 0, 0, 0.01)) drop-shadow(-26px 34px 26px rgba(0, 0, 0, 0.05)) drop-shadow(-12px 15px 19px rgba(0, 0, 0, 0.09)) drop-shadow(-3px 4px 10px rgba(0, 0, 0, 0.1))'
          }}
        >
          <div
            className="flex flex-col"
            style={{
              gap: '16px',
              width: '100%',
              maxWidth: '100%'
            }}
          >
            <img
              src={images.main}
              alt="Sat Yoga Ashram in Costa Rica"
              className="w-full"
              style={{
                height: 'auto',
                borderRadius: '12px',
                objectFit: 'cover',
                maxWidth: '100%'
              }}
            />

            <div className="flex gap-4 w-full" style={{ maxWidth: '100%' }}>
              {images.secondary.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Ashram image ${index + 1}`}
                  className="flex-1"
                  style={{
                    minWidth: 0,
                    height: 'auto',
                    objectFit: 'cover',
                    borderRadius: '12px'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content Container - Right side on desktop */}
        <div
          className="order-2 lg:order-2 flex flex-col"
          style={{
            paddingTop: '41px',
            flex: 1
          }}
        >
          {/* Eyebrow - positioned 41px from image top / 153px from section top */}
          <div className="mb-4">
            <span
              className="uppercase"
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontWeight: 600,
                fontSize: '16px',
                lineHeight: '150%',
                letterSpacing: '0%',
                color: '#9C7520'
              }}
            >
              {eyebrow}
            </span>
          </div>

          {/* Main Heading */}
          <h2
            className="text-black mb-6"
            style={{
              fontFamily: 'Optima, Georgia, serif',
              fontSize: '48px',
              fontWeight: 550,
              lineHeight: '60px',
              letterSpacing: '-2%'
            }}
          >
            {heading}
          </h2>

          {/* Description Paragraphs */}
          <div className="space-y-6 mb-8">
            {content.map((paragraph, index) => (
              <p
                key={index}
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontWeight: 500,
                  fontSize: '18px',
                  lineHeight: '28px',
                  letterSpacing: '0%',
                  color: '#384250'
                }}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Action Button */}
          <div className="text-left w-full">
            <Link
              href={buttonLink}
              className="w-full lg:w-auto flex lg:inline-flex items-center justify-center px-4 py-2.5 text-white rounded-lg transition-all duration-300 hover:opacity-90"
              style={{
                backgroundColor: '#7D1A13',
                fontFamily: 'Avenir Next, sans-serif',
                fontWeight: 600,
                fontSize: '16px',
                lineHeight: '24px',
                letterSpacing: '0%',
                minWidth: '120px',
                height: '44px',
                boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)'
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

export default AshramSection;