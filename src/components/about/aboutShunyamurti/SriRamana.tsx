'use client';

interface SriRamanaSectionProps {
  backgroundImage?: string;
}

const SriRamanaSection = ({ backgroundImage }: SriRamanaSectionProps) => {
  const bgImage = backgroundImage || 'https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/da33b24a-9521-4b2a-7b37-5fcb7128d900/public';

  return (
    <section
      className="relative w-full flex flex-col items-center overflow-hidden py-20 px-4 lg:py-28 lg:px-16"
      style={{
        backgroundColor: '#FAF8F1'
      }}
    >
      {/* Sri Ramana Card */}
      <div
        className="relative w-full max-w-7xl rounded-xl overflow-hidden h-[500px] lg:h-[600px]"
        style={{
          backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '12px'
        }}
      >
        {/* Content positioned at bottom */}
        <div 
          className="absolute bottom-0 left-0 right-0 p-4 lg:p-16"
          style={{
            background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))'
          }}
        >
          <div className="flex flex-col items-start gap-3 lg:gap-4">
            {/* Main Heading */}
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
              Sri Ramana Maharshi
            </h2>

            {/* Description */}
            <p 
              className="text-white"
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: 'clamp(12px, 3vw, 18px)',
                lineHeight: '1.4',
                color: 'rgba(255, 255, 255, 0.9)',
                maxWidth: '600px'
              }}
            >
              Shunyamurti connects always with the resonant presence of his closest teacher, Sri Ramana Maharshi, for whom he feels deep reverence.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SriRamanaSection;