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
      className="relative w-full overflow-hidden px-4 md:px-8 lg:px-16"
      style={{
        backgroundColor: '#FAF8F1',
        minHeight: '816px',
        paddingTop: '153px',
        paddingBottom: '64px'
      }}
    >
      {/* Flex Container for Content and Image */}
      <div className="relative flex flex-col md:items-center lg:items-start lg:flex-row justify-between" style={{ gap: '80px', maxWidth: '1440px', margin: '0 auto' }}>
        {/* Background Decorative Element - positioned relative to content container */}
        <div
          className="absolute hidden lg:block"
          style={{
            right: '-120px',
            top: '-120px',
            width: '389px',
            height: '389px',
            backgroundImage: `url(${backgroundDecoration})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            zIndex: 1,
            opacity: 0.3
          }}
        />
        {/* Content Container - Left side on desktop */}
        <div
          className="order-2 lg:order-1 flex flex-col w-full md:w-auto"
          style={{
            width: '616px',
            height: '622px',
            gap: '32px',
            opacity: 1,
            zIndex: 5
          }}
        >
          {/* Eyebrow */}
          <div>
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

          {/* Quote as Heading */}
          <blockquote
            className="text-black"
            style={{
              fontFamily: 'Optima, Georgia, serif',
              fontSize: '48px',
              fontWeight: 550,
              lineHeight: '60px',
              letterSpacing: '-2%',
              marginTop: '-16px'
            }}
          >
            "{quote}"
          </blockquote>

          {/* Description Paragraphs */}
          <div className="space-y-6">
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

        {/* Image Container - Right side on desktop */}
        <div className="order-1 lg:order-2 flex-shrink-0 w-full md:w-auto" style={{ zIndex: 10 }}>
          <img
            src={image}
            alt={imageAlt}
            className="object-cover"
            style={{
              width: '616px',
              height: '640px',
              borderRadius: '12px',
              opacity: 1,
              boxShadow: `2px 5px 11px 0px #0000001A,
                          8px 18px 20px 0px #00000017,
                          19px 41px 27px 0px #0000000D,
                          33px 73px 32px 0px #00000003,
                          52px 114px 35px 0px #00000000`,
              objectFit: 'cover'
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default ShunyamurtiSection;