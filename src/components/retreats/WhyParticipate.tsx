'use client';

const WhyParticipateSection = () => {
  return (
    <section 
      className="relative w-full flex flex-col items-center py-16 lg:py-28 px-4 lg:px-16"
      style={{ backgroundColor: '#FAF8F1' }}
    >
      <div 
        className="w-full flex flex-col items-center"
        style={{ maxWidth: '1312px', gap: '80px' }}
      >
        {/* Video/Image at top */}
        <div 
          className="relative w-full overflow-hidden cursor-pointer"
          style={{
            aspectRatio: '16/10',
            borderRadius: '16px',
            backgroundImage: 'url(/whyparticipate.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center justify-center w-20 h-20 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M8 5v14l11-7L8 5z" fill="#7D1A13"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Two-column content below */}
        <div 
          className="w-full flex flex-col lg:flex-row"
          style={{ gap: '80px' }}
        >
          {/* Left Side - Heading */}
          <div className="flex-1 w-full" style={{ maxWidth: '616px' }}>
            <h2 
              style={{
                fontFamily: 'Optima, Georgia, serif',
                fontSize: 'clamp(28px, 4vw, 48px)',
                fontWeight: 550,
                lineHeight: '125%',
                letterSpacing: '-0.02em',
                color: '#000000'
              }}
            >
              Why Participate in an Ashram Retreat?
            </h2>
          </div>

          {/* Right Side - Content */}
          <div className="flex-1 w-full flex flex-col gap-4" style={{ maxWidth: '616px' }}>
            <p style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '18px', lineHeight: '28px', color: '#384250' }}>
              A Sat Yoga Ashram retreat is unlike any other, offering not only a sacred spiritual refuge where nature's beauty mirrors the vastness of our whole Self—but also a living channel of new teachings, designed to open the hearts and minds of people with our current types of identity structures, and dealing with unprecedented situations.
            </p>
            <p style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '18px', lineHeight: '28px', color: '#384250' }}>
              Located in the mountains of rural Costa Rica, far from city life, our community offers you a supernatural intensity of divine energy, bringing a profound serenity to the heart. The rhythms of the natural world in heightened presence guide you inward, dissolving the noise of the anxious mind and opening one to eternal life.
            </p>
            <p style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '18px', lineHeight: '28px', color: '#384250' }}>
              Coming to the Ashram in person provides an extraordinary opportunity to attain the highest resonance, and thus more easily to cut identification with the ego. The direct support of Shunyamurti and the sangha, in dialogue and in deep meditation, in service and artistic creativity, will greatly accelerate and complete your journey to realization of the Supreme Self.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyParticipateSection;