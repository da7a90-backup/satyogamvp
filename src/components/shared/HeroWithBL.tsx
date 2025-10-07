'use client';

// ============================================================================
// TYPES
// ============================================================================

interface HeroWithBackLinkData {
  backLink: {
    text: string;
    url: string;
  };
  tagline?: string;
  heading?: string;
  subtext?: string;
  background: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

const HeroWithBackLink = ({ data }: { data: HeroWithBackLinkData }) => {
  return (
    <section 
      className="relative w-full flex items-end overflow-hidden bg-cover bg-center h-[55vh] lg:h-screen"
      style={{
        minHeight: '400px',
        backgroundImage: `url(${data.background})`
      }}
    >
      {/* Very subtle vignette for text readability */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at bottom left, rgba(0, 0, 0, 0.3) 0%, transparent 60%)'
        }}
      />

      {/* Strong blur - smallest area */}
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4" style={{
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        clipPath: 'polygon(0% 100%, 0% 0%, 100% 100%)'
      }} />

      {/* Medium blur - medium area */}
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3" style={{
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        clipPath: 'polygon(0% 100%, 0% 0%, 100% 100%)'
      }} />

      {/* Light blur - largest area */}
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2" style={{
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        clipPath: 'polygon(0% 100%, 0% 0%, 100% 100%)'
      }} />

      {/* Light blur - largest area */}
      <div className="absolute bottom-0 left-0 w-2/3 h-2/3" style={{
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        clipPath: 'polygon(0% 100%, 0% 0%, 100% 100%)'
      }} />

      {/* Light blur - largest area */}
      <div className="absolute bottom-0 left-0 w-3/4 h-3/4" style={{
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        clipPath: 'polygon(0% 100%, 0% 0%, 100% 100%)'
      }} />

      {/* Back Link - Top Left */}
      <div 
        className="absolute top-8 left-8 lg:left-16 z-20"
      >
        <a
          href={data.backLink.url}
          className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
          style={{
            fontFamily: 'Avenir Next, sans-serif',
            fontSize: 'clamp(14px, 2vw, 16px)',
            fontWeight: 500
          }}
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {data.backLink.text}
        </a>
      </div>

      {/* Content Container - Only render if text content exists */}
      {(data.tagline || data.heading || data.subtext) && (
        <div 
          className="relative z-10 w-full flex justify-start items-end pb-16 px-8 lg:px-16"
          style={{
            maxWidth: '1440px',
            margin: '0 auto'
          }}
        >
          {/* Text Content */}
          <div 
            className="flex flex-col justify-end items-start gap-8"
            style={{
              maxWidth: '840px'
            }}
          >
            {/* Tagline */}
            {data.tagline && (
              <div className="w-full flex items-center">
                <span 
                  className="text-white uppercase tracking-wide font-medium"
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '16px',
                    lineHeight: '24px'
                  }}
                >
                  {data.tagline}
                </span>
              </div>
            )}

            {/* Main Heading */}
            {data.heading && (
              <h1 
                className="text-white w-full"
                style={{
                  fontFamily: 'Optima, Georgia, serif',
                  fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                  fontWeight: 550,
                  lineHeight: '125%',
                  letterSpacing: '-0.02em'
                }}
              >
                {data.heading}
              </h1>
            )}

            {/* Subtext */}
            {data.subtext && (
              <p 
                className="text-white w-full"
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: 'clamp(16px, 2vw, 20px)',
                  fontWeight: 500,
                  lineHeight: '140%',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}
              >
                {data.subtext}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroWithBackLink;