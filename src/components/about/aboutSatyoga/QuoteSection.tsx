'use client';

// Quote Section Component
const QuoteSection = () => {
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
          className="relative w-full flex flex-row justify-center items-center p-8 lg:p-8 rounded-2xl border overflow-hidden"
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
              backgroundImage: 'url(/innerlab.png)',
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
              className="text-center max-w-3xl"
              style={{
                fontFamily: 'Optima, Georgia, serif',
                fontStyle: 'italic',
                fontWeight: 500,
                fontSize: '24px',
                lineHeight: '38px',
                color: '#9C7520',
                width: '702px',
                height: '152px'
              }}
            >
              "A seeker of the Real should not follow a beaten path. The way to completion is to develop originality. Sat Yoga is not a path: we teach you how to use a compass and a machete, and we encourage you to cut a new path of your own."
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
              backgroundImage: 'url(/innerlab.png)',
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
              width: '399px',
              height: '399px',
              left: '-200px',
              top: '-259px',
              backgroundImage: 'url(/innerlab.png)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              transform: 'matrix(1, 0, 0, -1, 0, 0)',
              opacity: 0.3,
              zIndex: 2
            }}
          />
        </div>
      </div>
    </section>
  );
};


export default QuoteSection;