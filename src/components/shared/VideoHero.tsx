'use client';

import { useState, useRef } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface VideoHeroData {
  mediaType: 'image' | 'video';
  mediaSrc: string;
  posterImage?: string; // For video thumbnail
  tagline: string;
  title: string;
  description: string;
}
// ============================================================================
// COMPONENT
// ============================================================================

const VideoHeroSection = ({ data }: { data: VideoHeroData }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  return (
    <section 
      className="relative w-full overflow-hidden"
      style={{ 
        minHeight: '600px',
        height: '70vh'
      }}
    >
      {/* Background Media */}
      {data.mediaType === 'image' ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${data.mediaSrc})`
          }}
        />
      ) : (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          poster={data.posterImage}
          onPause={handleVideoPause}
          onEnded={handleVideoEnded}
          controls={isPlaying}
        >
          <source src={data.mediaSrc} type="video/mp4" />
        </video>
      )}

      {/* Dark Overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)'
        }}
      />

      {/* Content Container - Hidden when video is playing */}
      <div 
        className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-500 ${
          isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* Top Content */}
        <div className="px-8 lg:px-16 pt-12 lg:pt-16">
          <span
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#FFFFFF'
            }}
          >
            {data.tagline}
          </span>
          <h2
              className="mb-6 py-6"
              style={{
                fontFamily: 'Optima, Georgia, serif',
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 550,
                lineHeight: '120%',
                letterSpacing: '-0.02em',
                color: '#FFFFFF'
              }}
            >
              {data.title}
            </h2>
        </div>

        {/* Center Play Button (only for video when not playing) */}
        {data.mediaType === 'video' && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handlePlayClick}
              className="flex items-center justify-center w-20 h-20 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-300"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M8 5v14l11-7L8 5z" fill="#7D1A13"/>
              </svg>
            </button>
          </div>
        )}

        {/* Bottom Content */}
        <div className="px-8 lg:px-16 pb-12 lg:pb-16">
          <div className="max-w-4xl">

            <p
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: 'clamp(16px, 2vw, 18px)',
                fontWeight: 400,
                lineHeight: '160%',
                color: 'rgba(255, 255, 255, 0.95)'
              }}
            >
              {data.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoHeroSection;