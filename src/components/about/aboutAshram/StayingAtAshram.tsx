'use client';

const AshramRetreatsSection = () => {
  return (
    <section 
      className="relative w-full flex flex-col items-center py-16 lg:py-28 px-4 lg:px-16"
      style={{
        backgroundColor: '#FAF8F1'
      }}
    >
      {/* Content Container */}
      <div 
        className="w-full flex flex-col items-center text-center"
        style={{
          maxWidth: '1000px',
          gap: '32px'
        }}
      >
        {/* Tagline */}
        <div className="flex items-center">
          <span 
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '24px',
              color: '#B8860B',
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}
          >
            ASHRAM RETREATS
          </span>
        </div>

        {/* Main Title */}
        <h2 
          className="text-black text-center"
          style={{
            fontFamily: 'Optima, Georgia, serif',
            fontWeight: 550,
            fontSize: 'clamp(28px, 4vw, 48px)',
            lineHeight: '125%',
            letterSpacing: '-0.02em'
          }}
        >
          Staying at Our Ashram in Costa Rica
        </h2>

        {/* Description */}
        <p 
          className="text-center"
          style={{
            fontFamily: 'Avenir Next, sans-serif',
            fontSize: '18px',
            lineHeight: '156%',
            color: '#384250',
            fontWeight: 400,
            maxWidth: '800px'
          }}
        >
          The Sat Yoga Ashram offers onsite retreats for all souls who resonate with Shunyamurti's teachings, who are mature seekers of the Real and capable of making use of these offerings, and who understand the urgency of attaining the full dose of grace.
        </p>

        {/* CTA Button */}
        <div className="flex justify-center mt-8">
        <a href="/retreats/ashram"> <button
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '12px 24px',
              gap: '6px',
              background: '#7D1A13',
              boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)',
              borderRadius: '8px',
              border: 'none',
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              lineHeight: '24px',
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            Browse onsite retreats
          </button></a>
        </div>
      </div>
    </section>
  );
};

export default AshramRetreatsSection;