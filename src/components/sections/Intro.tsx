'use client';

interface IntroSectionProps {
  backgroundImage: string;
  heading: string;
}

const IntroSection = ({ backgroundImage, heading }: IntroSectionProps) => {
  return (
    <section 
      className="relative w-full flex flex-col justify-center items-center px-4 md:px-16 py-28 overflow-hidden m-0 -mt-px"
      style={{
        background: 'linear-gradient(180deg, #321A1A 0%, #621712 51.46%, #4A110D 112.07%)',
        minHeight: '816px'
      }}
    >
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ zIndex: 0 }}
      >
        <img
          src={backgroundImage}
          alt="Nataraja"
          className="w-64 h-64 md:w-96 md:h-96 lg:w-[514px] lg:h-[519px] object-contain opacity-40"
        />
      </div>

      <div 
        className="relative z-10 max-w-4xl text-center"
        style={{ zIndex: 1 }}
      >
        <h2 
          className="text-white"
          style={{
            fontFamily: 'Optima, Georgia, serif',
            fontWeight: 550,
            fontSize: '46px',
            lineHeight: '140%',
            letterSpacing: '-2%',
            textAlign: 'center'
          }}
        >
          {heading}
        </h2>
      </div>
    </section>
  );
};

export default IntroSection;