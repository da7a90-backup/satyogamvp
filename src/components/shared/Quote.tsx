'use client';

// Quote Section Component
const QuoteSection = ({data, backgroundDecoration}:{data:string; backgroundDecoration?:string}) => {
  const labyrinthUrl = backgroundDecoration || 'https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/44f9856a-562e-4a8c-12db-2406b65c4400/public';

  return (
    <section 
      className="relative w-full flex flex-col items-center overflow-hidden py-16 lg:py-16 px-4 lg:px-16"
      style={{
        backgroundColor: '#FAF8F1',
        minHeight: '344px'
      }}
    >
      {/* Content Container */}
      <div 
        className="relative w-full flex flex-col items-center"
        style={{
          maxWidth: '1312px',
          gap: '40px'
        }}
      >
        {/* Quote Card */}
        <div 
          className="relative w-full flex flex-row justify-center items-center p-4 sm:p-6 lg:p-8 rounded-2xl border overflow-hidden"
          style={{
            background: 'linear-gradient(360deg, rgba(156, 117, 32, 0.1) 0%, rgba(218, 165, 14, 0.1) 99.04%)',
            borderColor: '#E4DED9',
            minHeight: '216px',
            gap: '23px',
            isolation: 'isolate'
          }}
        >
          {/* Decorative Left Labyrinth - Desktop Only */}
          <div 
            className="absolute hidden lg:block"
            style={{
              width: '399px',
              height: '399px',
              left: '-200px',
              top: '-259px',
              backgroundImage: `url(${labyrinthUrl})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              transform: 'matrix(1, 0, 0, -1, 0, 0)',
              opacity: 0.3,
              zIndex: 2
            }}
          />

          {/* Quote Content */}
          <div className="flex flex-col justify-center items-center w-full">
            <p 
              className="text-center w-full max-w-3xl px-2 sm:px-4"
              style={{
                fontFamily: 'Optima, Georgia, serif',
                fontStyle: 'italic',
                fontWeight: 500,
                fontSize: 'clamp(16px, 3.5vw, 24px)', // Responsive: 16px mobile → 24px desktop
                lineHeight: 'clamp(24px, 5.5vw, 38px)', // Responsive line height
                color: '#9C7520'
              }}
            >
                {data}
            </p>
          </div>

          {/* Decorative Right Labyrinth - Desktop Only */}
          <div 
            className="absolute hidden lg:block"
            style={{
              width: '399px',
              height: '399px',
              right: '-200px',
              top: '0px',
              backgroundImage: `url(${labyrinthUrl})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              transform: 'matrix(1, 0, 0, -1, 0, 0)',
              opacity: 0.3,
              zIndex: 1
            }}
          />

          {/* Mobile Decorative Labyrinth */}
          <div 
            className="absolute lg:hidden"
            style={{
              width: '299px', // Smaller on mobile
              height: '299px',
              left: '-150px', // Adjusted position
              top: '-200px',
              backgroundImage: `url(${labyrinthUrl})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              transform: 'matrix(1, 0, 0, -1, 0, 0)',
              opacity: 0.2, // Slightly more transparent on mobile
              zIndex: 1
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default QuoteSection;