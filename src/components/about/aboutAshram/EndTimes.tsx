'use client';

const AshramEndTimeSection = () => {
  return (
    <section 
      className="relative w-full flex flex-col lg:flex-row items-start py-16 lg:py-28 px-4 lg:px-16 overflow-x-hidden"
      style={{
        backgroundColor: '#FAF8F1',
        gap: '80px'
      }}
    >
      {/* Background Decorative Element - Desktop with upward push and clipping fix */}
      <div
        className="absolute hidden lg:block pointer-events-none"
        style={{
          width: '670px',
          height: '670px',
          left: '-200px',
          top: '250px', // Pushed up from 100px to 50px
          backgroundImage: 'url(/nataraj.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          opacity: 0.1,
          zIndex: 0
        }}
      />

      {/* Mobile-only Nataraj - positioned to start behind title */}
      <div
        className="absolute overflow-hidden lg:hidden pointer-events-none"
        style={{
          width: '560px', // Double size
          height: '700px', // Double size  
          left: '-150px', // Your exact positioning
          top: '265px', // Your fixed positioning
          backgroundImage: 'url(/nataraj.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          opacity: 0.06, // Lower opacity for mobile
          zIndex: 0
        }}
      />

      {/* Content Container */}
      <div 
        className="w-full flex flex-col lg:flex-row items-start relative max-w-7xl mx-auto overflow-hidden"
        style={{
          gap: '80px'
        }}
      >
        {/* Left Column - Title */}
        <div className="w-full lg:w-auto lg:flex-shrink-0">
          <h2 
            className="text-black relative z-10"
            style={{
              fontFamily: 'Optima, Georgia, serif',
              fontWeight: 550,
              fontSize: 'clamp(28px, 4vw, 48px)',
              lineHeight: '125%',
              letterSpacing: '-0.02em',
              width: 'clamp(300px, 50vw, 616px)'
            }}
          >
            An Ashram at the End of Time
          </h2>
        </div>

        {/* Right Column - Content */}
        <div 
          className="w-full flex flex-col relative z-10 space-y-8"
          style={{
            maxWidth: '616px'
          }}
        >
          <p 
            className="relative z-10"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: 'clamp(16px, 2.5vw, 18px)',
              lineHeight: '28px',
              color: '#384250',
              fontWeight: 400
            }}
          >
            What is different about an ashram established in the understanding that we are near the end of this age and of the whole cycle of history? We are not traditionalists or believers in a creed. We are not perfectionists, not necessarily ascetics, and mostly rebels and runaways; but the responsibilities of sustaining a farming community and serving in a wisdom school have refined our characters and given us at least a taste of divine ecstasy. We are not here to pass on any dogma, enlist anyone as a monk, or give out certificates. We are playing for higher stakes: Liberation.
          </p>

          <p 
            className="relative z-10"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: 'clamp(16px, 2.5vw, 18px)',
              lineHeight: '28px',
              color: '#384250',
              fontWeight: 400
            }}
          >
            We understand that the chief responsibility of our residential sangha is to maintain an energy field filled with wisdom, love, and compassion—expressed as cheerfulness, friendship, cooperation, and forgiveness. And we are engaged in the constant practice of recognizing that all of reality is a single Consciousness.
          </p>

          <p 
            className="relative z-10"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: 'clamp(16px, 2.5vw, 18px)',
              lineHeight: '28px',
              color: '#384250',
              fontWeight: 400
            }}
          >
            The ashram was founded in 2009 and has been sustained miraculously, thanks to the dedication, generosity, and faith of the founding members and the hard work and innovative ideas of those who came after them. The magnanimity of donors has been life-saving. We have also flourished thanks to the endless flow of new teachings—always more profound and powerful—transmitted through our yogic research director, Shunyamurti.
          </p>

          <p 
            className="relative z-10"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: 'clamp(16px, 2.5vw, 18px)',
              lineHeight: '28px',
              color: '#384250',
              fontWeight: 400
            }}
          >
            We are not ordinary preppers or mere survivalists; but we do foresee the imminent collapse of civilization, and we intend to endure peacefully through the time of tribulations for so long as our service on this plane is required.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AshramEndTimeSection;