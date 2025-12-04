'use client';

import { useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface MediaConfig {
  type: 'image' | 'video';
  src: string;
  thumbnail?: string;
  videoType?: 'youtube' | 'cloudflare';
}

interface Encounter {
  id: number;
  text: string;
  author: string;
  location: string;
  media?: MediaConfig;
}

interface EncountersSectionProps {
  tagline?: string;
  encounters: Encounter[];
}

// ============================================================================
// COMPONENT
// ============================================================================

const EncountersSection = ({ 
  tagline = "ENCOUNTERS WITH SHUNYAMURTI",
  encounters 
}: EncountersSectionProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState<{ [key: number]: boolean }>({});

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % encounters.length);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + encounters.length) % encounters.length);
  };

  const goToSlide = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide(index);
  };

  const handleVideoClick = (encounterId: number) => {
    setVideoLoaded(prev => ({ ...prev, [encounterId]: true }));
  };

  // Get YouTube thumbnail if no thumbnail provided
  const getYouTubeThumbnail = (embedUrl: string) => {
    const videoIdMatch = embedUrl.match(/embed\/([^?]+)/);
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`;
    }
    return null;
  };

  const currentEncounter = encounters[currentSlide];
  const hasMedia = !!currentEncounter.media;
  
  // Get thumbnail for video
  let videoThumbnail = currentEncounter.media?.thumbnail;
  if (currentEncounter.media?.type === 'video' && !videoThumbnail && currentEncounter.media.videoType === 'youtube') {
    videoThumbnail = getYouTubeThumbnail(currentEncounter.media.src) || undefined;
  }

  return (
    <section
      className="relative w-full flex flex-col items-center py-16 lg:py-28 px-8 lg:px-16"
      style={{
        backgroundColor: '#FAF8F1'
      }}
    >
      <div
        className="w-full flex flex-col"
        style={{
          maxWidth: '1312px',
          margin: '0 auto',
          gap: '40px'
        }}
      >
        {/* Main Content Row */}
        <div
          className={`w-full flex flex-col lg:flex-row items-center ${!hasMedia ? 'justify-center' : ''}`}
          style={{
            gap: '80px'
          }}
        >
        {/* Left Column - Media */}
        {hasMedia && currentEncounter.media && (
          <div
            className="flex-1 w-full"
            style={{
              maxWidth: '616px'
            }}
          >
            {/* Image Type */}
            {currentEncounter.media.type === 'image' && (
              <div
                className="relative w-full overflow-hidden"
                style={{
                  aspectRatio: '616/400',
                  borderRadius: '16px',
                  backgroundImage: `url(${currentEncounter.media.src})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
            )}

            {/* Video Type */}
            {currentEncounter.media.type === 'video' && (
              <div
                className="relative w-full overflow-hidden"
                style={{
                  aspectRatio: '616/400',
                  borderRadius: '16px'
                }}
              >
                {!videoLoaded[currentEncounter.id] ? (
                  // Thumbnail with play button
                  <div
                    onClick={() => handleVideoClick(currentEncounter.id)}
                    className="relative w-full h-full cursor-pointer"
                    style={{
                      backgroundImage: videoThumbnail
                        ? `url(${videoThumbnail})`
                        : 'linear-gradient(61.31deg, rgba(0, 0, 0, 0.3) 14.27%, rgba(0, 0, 0, 0.2) 56.93%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundColor: '#CCCCCC'
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="flex items-center justify-center w-20 h-20 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-300"
                        style={{
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                        }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M8 5v14l11-7L8 5z" fill="#7D1A13"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Embedded video
                  <div className="w-full h-full">
                    {currentEncounter.media.videoType === 'youtube' ? (
                      <iframe
                        className="w-full h-full"
                        src={`${currentEncounter.media.src}${currentEncounter.media.src.includes('?') ? '&' : '?'}autoplay=1`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ borderRadius: '16px' }}
                      />
                    ) : (
                      <iframe
                        className="w-full h-full"
                        src={currentEncounter.media.src}
                        title="Video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ borderRadius: '16px' }}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Right Column - Content */}
        <div 
          className="flex-1 w-full flex flex-col items-start"
          style={{
            maxWidth: hasMedia ? '616px' : '800px',
            gap: '32px'
          }}
        >
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
              {tagline}
            </span>
          </div>

          <div 
            className="flex flex-col"
            style={{
              gap: '40px'
            }}
          >
            <p 
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '18px',
                lineHeight: '28px',
                color: '#000000',
                fontWeight: 400
              }}
            >
              {currentEncounter.text}
            </p>

            <div 
              className="flex flex-col"
              style={{
                gap: '4px'
              }}
            >
              <span 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#000000'
                }}
              >
                {currentEncounter.author}
              </span>
              <span 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#6B7280'
                }}
              >
                {currentEncounter.location}
              </span>
            </div>
          </div>
        </div>
        </div>

        {/* Navigation Row - Dots on left, Controls on right */}
        <div
          className="w-full flex items-center justify-between"
          style={{
            gap: '80px'
          }}
        >
          {/* Dots Navigation */}
          <div
            className="flex items-center"
            style={{
              gap: '8px'
            }}
          >
            {encounters.map((_, index) => (
              <button
                key={index}
                onClick={(e) => goToSlide(index, e)}
                className={`w-2 h-2 rounded-full transition-colors duration-300 cursor-pointer ${
                  currentSlide === index ? 'bg-gray-800' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
                type="button"
              />
            ))}
          </div>

          {/* Navigation Controls */}
          <div
            className="flex items-center"
            style={{
              gap: '12px'
            }}
          >
            <button
              onClick={prevSlide}
              className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors duration-300"
              aria-label="Previous slide"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <button
              onClick={nextSlide}
              className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors duration-300"
              aria-label="Next slide"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EncountersSection;