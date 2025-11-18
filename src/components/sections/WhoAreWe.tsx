'use client';
import Link from 'next/link';

interface WhoWeAreSectionProps {
  eyebrow: string;
  heading: string;
  content: string[];
  buttonText: string;
  buttonLink: string;
  image: string;
  imageAlt: string;
  backgroundDecoration: string;
}

const WhoWeAreSection = ({
  eyebrow,
  heading,
  content,
  buttonText,
  buttonLink,
  image,
  imageAlt,
  backgroundDecoration
}: WhoWeAreSectionProps) => {
  return (
    <section
      className="relative w-full overflow-hidden px-4 md:px-8 lg:px-16"
      style={{
        backgroundColor: '#FAF8F1',
        minHeight: '816px',
        paddingTop: '153px',
        paddingBottom: '64px',
        zIndex: 10
      }}
    >
      {/* Background Decorative Element */}
      <div
        className="absolute hidden lg:block"
        style={{
          right: '-90px',
          top: '-104px',
          width: '389px',
          height: '389px',
          backgroundImage: `url(${backgroundDecoration})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
          opacity: 0.6
        }}
      />

      {/* Flex Container for Image and Content */}
      <div className="relative z-10 flex flex-col md:items-center lg:items-start lg:flex-row justify-between" style={{ gap: '80px', maxWidth: '1440px', margin: '0 auto' }}>
        {/* Image Container - Left side on desktop */}
        <div className="order-1 lg:order-1 flex-shrink-0 w-full md:w-auto md:max-w-[616px]">
          <img
            src={image}
            alt={imageAlt}
            className="object-cover"
            style={{
              width: '616px',
              height: '640px',
              borderRadius: '12px',
              boxShadow: `-2px 5px 11px 0px #0000001A,
                          -8px 18px 20px 0px #00000017,
                          -19px 41px 27px 0px #0000000D,
                          -33px 73px 32px 0px #00000003,
                          -52px 114px 35px 0px #00000000`,
              objectFit: 'cover'
            }}
          />
        </div>

        {/* Content Container - Right side on desktop */}
        <div
          className="order-2 lg:order-2 flex flex-col"
          style={{
            paddingTop: '41px',
            flex: 1
          }}
        >
          {/* Eyebrow - positioned 41px from top of image / 153px from top of section */}
          <div className="mb-4">
            <span
              className="uppercase"
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontWeight: 600,
                fontSize: '16px',
                lineHeight: '150%',
                letterSpacing: '0%',
                color: '#B8860B'
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
          <div className="space-y-4 mb-8">
            {content.map((paragraph, index) => (
              <p
                key={index}
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontWeight: 500,
                  fontSize: '18px',
                  lineHeight: '28px',
                  letterSpacing: '0%',
                  color: '#4A5568'
                }}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Action Button */}
          <div className="text-left">
            <Link
              href={buttonLink}
              className="inline-flex items-center px-6 py-3 text-white rounded-lg transition-all duration-300 hover:opacity-90"
              style={{
                backgroundColor: '#7D1A13',
                fontFamily: 'Avenir Next, sans-serif',
                fontWeight: 600,
                fontSize: '16px',
                lineHeight: '24px',
                letterSpacing: '0%'
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

export default WhoWeAreSection;