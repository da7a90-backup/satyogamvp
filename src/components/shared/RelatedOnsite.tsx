import { useState, useEffect } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface Program {
  image: string;
  icon: string;
  duration: string;
  location: string;
  tagline: string;
  title: string;
  link: string;
}

interface RelatedProgramsData {
  sectionTitle: string;
  programs: Program[];
}

// ============================================================================
// COMPONENT
// ============================================================================

const RelatedProgramsSection = ({ data }: { data: RelatedProgramsData }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide for mobile
  useEffect(() => {
    const timer = setInterval(() => {
      if (window.innerWidth < 1024) {
        setCurrentSlide(prev => (prev + 1) % data.programs.length);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [data.programs.length]);

  return (
    <section 
      className="w-full flex flex-col items-center px-4 lg:px-16 py-16 lg:py-20"
      style={{ backgroundColor: '#FAF8F1' }}
    >
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h2
            style={{
              fontFamily: 'Optima, Georgia, serif',
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 550,
              lineHeight: '120%',
              color: '#000000'
            }}
          >
            {data.sectionTitle}
          </h2>
        </div>

        {/* Desktop: Grid Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {data.programs.map((program, index) => (
            <div
              key={index}
              className="bg-white rounded-lg overflow-hidden border border-gray-200 flex flex-col"
            >
              {/* Image */}
              <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
                <img
                  src={program.image}
                  alt={program.title}
                  className="w-full h-full object-cover"
                />
                {/* Icon Overlay with gradient shadow */}
                <div 
                  className="absolute bottom-0 right-0 flex items-center justify-center"
                  style={{
                    width: '50%',
                    height: '50%',
                    background: 'radial-gradient(ellipse at bottom right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 25%, rgba(0,0,0,0.15) 45%, transparent 65%)',
                    borderRadius: '0 0 8px 0'
                  }}
                >
                  <div className="w-12 h-12 flex items-center justify-center absolute bottom-3 right-3">
                    <img
                      src={program.icon}
                      alt=""
                      className="w-12 h-12"
                    />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col gap-4 flex-grow">
                {/* Meta Info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="2" y="3" width="12" height="11" rx="2" stroke="#535862" strokeWidth="1.5"/>
                      <path d="M11 1v4M5 1v4M2 7h12" stroke="#535862" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span
                      style={{
                        fontFamily: 'Avenir Next, sans-serif',
                        fontSize: 'clamp(12px, 2vw, 14px)',
                        fontWeight: 600,
                        lineHeight: '20px',
                        color: '#384250'
                      }}
                    >
                      Duration: {program.duration}
                    </span>
                  </div>

                  <div className="hidden sm:block w-6 h-0 border-t border-gray-300 rotate-90"/>

                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M14 6.67c0 4.67-6 8.67-6 8.67s-6-4-6-8.67a6 6 0 1112 0z" stroke="#535862" strokeWidth="1.5"/>
                      <circle cx="8" cy="6.67" r="1.67" stroke="#535862" strokeWidth="1.5"/>
                    </svg>
                    <span
                      style={{
                        fontFamily: 'Avenir Next, sans-serif',
                        fontSize: 'clamp(12px, 2vw, 14px)',
                        fontWeight: 600,
                        lineHeight: '20px',
                        color: '#384250'
                      }}
                    >
                      {program.location}
                    </span>
                  </div>
                </div>

                {/* Tagline & Title */}
                <div>
                  <span
                    className="text-sm font-medium"
                    style={{
                      fontFamily: 'Avenir Next, sans-serif',
                      color: '#942017',
                      fontSize: 'clamp(12px, 2vw, 14px)'
                    }}
                  >
                    {program.tagline}
                  </span>
                  <h3
                    className="font-bold mt-1"
                    style={{
                      fontFamily: 'Optima, sans-serif',
                      color: '#000000',
                      fontSize: 'clamp(18px, 3vw, 20px)'
                    }}
                  >
                    {program.title}
                  </h3>
                </div>

                {/* Button */}
                <a
                  href={program.link}
                  className="w-full px-4 py-3 text-white rounded-lg font-medium text-center transition-opacity hover:opacity-90 mt-auto"
                  style={{
                    backgroundColor: '#7D1A13',
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: 'clamp(14px, 2.5vw, 16px)'
                  }}
                >
                  Learn more
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: Carousel */}
        <div className="lg:hidden">
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentSlide * 100}%)`
              }}
            >
              {data.programs.map((program, index) => (
                <div
                  key={index}
                  className="w-full flex-shrink-0 px-2"
                >
                  <div className="bg-white rounded-lg overflow-hidden border border-gray-200 flex flex-col">
                    {/* Image */}
                    <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
                      <img
                        src={program.image}
                        alt={program.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Icon Overlay with gradient shadow */}
                      <div 
                        className="absolute bottom-0 right-0 flex items-center justify-center"
                        style={{
                          width: '50%',
                          height: '50%',
                          background: 'radial-gradient(ellipse at bottom right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 25%, rgba(0,0,0,0.15) 45%, transparent 65%)',
                          borderRadius: '0 0 8px 0'
                        }}
                      >
                        <div className="w-12 h-12 flex items-center justify-center absolute bottom-3 right-3">
                          <img
                            src={program.icon}
                            alt=""
                            className="w-12 h-12"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col gap-4">
                      {/* Meta Info */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-2">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <rect x="2" y="3" width="12" height="11" rx="2" stroke="#535862" strokeWidth="1.5"/>
                            <path d="M11 1v4M5 1v4M2 7h12" stroke="#535862" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                          <span
                            style={{
                              fontFamily: 'Avenir Next, sans-serif',
                              fontSize: 'clamp(12px, 2vw, 14px)',
                              fontWeight: 600,
                              lineHeight: '20px',
                              color: '#384250'
                            }}
                          >
                            Duration: {program.duration}
                          </span>
                        </div>

                        <div className="hidden sm:block w-6 h-0 border-t border-gray-300 rotate-90"/>

                        <div className="flex items-center gap-2">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M14 6.67c0 4.67-6 8.67-6 8.67s-6-4-6-8.67a6 6 0 1112 0z" stroke="#535862" strokeWidth="1.5"/>
                            <circle cx="8" cy="6.67" r="1.67" stroke="#535862" strokeWidth="1.5"/>
                          </svg>
                          <span
                            style={{
                              fontFamily: 'Avenir Next, sans-serif',
                              fontSize: 'clamp(12px, 2vw, 14px)',
                              fontWeight: 600,
                              lineHeight: '20px',
                              color: '#384250'
                            }}
                          >
                            {program.location}
                          </span>
                        </div>
                      </div>

                      {/* Tagline & Title */}
                      <div>
                        <span
                          className="text-sm font-medium"
                          style={{
                            fontFamily: 'Avenir Next, sans-serif',
                            color: '#942017',
                            fontSize: 'clamp(12px, 2vw, 14px)'
                          }}
                        >
                          {program.tagline}
                        </span>
                        <h3
                          className="font-bold mt-1"
                          style={{
                            fontFamily: 'Optima, sans-serif',
                            color: '#000000',
                            fontSize: 'clamp(18px, 3vw, 20px)'
                          }}
                        >
                          {program.title}
                        </h3>
                      </div>

                      {/* Button */}
                      <a
                        href={program.link}
                        className="w-full px-4 py-3 text-white rounded-lg font-medium text-center transition-opacity hover:opacity-90"
                        style={{
                          backgroundColor: '#7D1A13',
                          fontFamily: 'Avenir Next, sans-serif',
                          fontSize: 'clamp(14px, 2.5vw, 16px)'
                        }}
                      >
                        Learn more
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RelatedProgramsSection;