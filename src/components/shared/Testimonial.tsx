'use client';

import { useState, useEffect } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface MediaConfig {
  type: 'image' | 'video';
  src: string;
  thumbnail?: string;
  videoType?: 'youtube' | 'cloudflare';
}

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  location: string;
  media?: MediaConfig; // Optional media (video, image, or no media)
  video?: string; // Legacy support: if provided, will be treated as thumbnail
}

interface TestimonialCarouselProps {
  tagline?: string;
  testimonials: Testimonial[];
}

// ============================================================================
// COMPONENT
// ============================================================================

const TestimonialCarousel = ({
  tagline = "TESTIMONIALS",
  testimonials
}: TestimonialCarouselProps) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState<{ [key: number]: boolean }>({});

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleVideoClick = (testimonialId: number) => {
    setVideoLoaded(prev => ({ ...prev, [testimonialId]: true }));
  };

  // Get YouTube thumbnail if no thumbnail provided
  const getYouTubeThumbnail = (embedUrl: string) => {
    const videoIdMatch = embedUrl.match(/embed\/([^?]+)/);
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`;
    }
    return null;
  };

  const currentItem = testimonials[currentTestimonial];

  // Legacy support: convert old 'video' field to new 'media' format
  const hasMedia = !!currentItem.media || !!currentItem.video;
  let mediaConfig = currentItem.media;

  // If using legacy format, create a media config
  if (!mediaConfig && currentItem.video) {
    mediaConfig = {
      type: 'image' as const,
      src: currentItem.video
    };
  }

  // Get thumbnail for video
  let videoThumbnail = mediaConfig?.thumbnail;
  if (mediaConfig?.type === 'video' && !videoThumbnail && mediaConfig.videoType === 'youtube') {
    videoThumbnail = getYouTubeThumbnail(mediaConfig.src) || undefined;
  }

  return (
    <section
      className="relative w-full flex flex-col items-center py-16 lg:py-28 px-4 lg:px-16"
      style={{ backgroundColor: '#FAF8F1' }}
    >
      {/* Desktop Layout */}
      <div className="hidden lg:flex w-full items-center max-w-7xl mx-auto" style={{ gap: '80px' }}>
        {/* Testimonial Text */}
        <div className="flex-1 flex flex-col gap-6" style={{ maxWidth: hasMedia ? '500px' : '800px' }}>
          <span
            className="text-sm font-medium uppercase tracking-wider"
            style={{ fontFamily: 'Avenir Next, sans-serif', color: '#B8860B' }}
          >
            {tagline}
          </span>

          <p
            className="text-xl italic"
            style={{
              fontFamily: 'Optima, sans-serif',
              fontSize: '24px',
              lineHeight: '36px',
              color: '#000000'
            }}
          >
            "{currentItem.quote}"
          </p>

          <div>
            <p style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '16px', fontWeight: 600, color: '#000000' }}>
              {currentItem.author}
            </p>
            <p style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '14px', color: '#6B7280' }}>
              {currentItem.location}
            </p>
          </div>
        </div>

        {/* Media Section (Video or Image) */}
        {hasMedia && mediaConfig && (
          <div className="flex-1 w-full" style={{ maxWidth: '616px' }}>
            {/* Image Type */}
            {mediaConfig.type === 'image' && (
              <div
                className="relative w-full overflow-hidden"
                style={{
                  aspectRatio: '16/10',
                  borderRadius: '16px',
                  backgroundImage: `url(${mediaConfig.src})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
            )}

            {/* Video Type */}
            {mediaConfig.type === 'video' && (
              <div
                className="relative w-full overflow-hidden"
                style={{
                  aspectRatio: '16/10',
                  borderRadius: '16px'
                }}
              >
                {!videoLoaded[currentItem.id] ? (
                  // Thumbnail with play button
                  <div
                    onClick={() => handleVideoClick(currentItem.id)}
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
                    {mediaConfig.videoType === 'youtube' ? (
                      <iframe
                        className="w-full h-full"
                        src={`${mediaConfig.src}${mediaConfig.src.includes('?') ? '&' : '?'}autoplay=1`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ borderRadius: '16px' }}
                      />
                    ) : (
                      <iframe
                        className="w-full h-full"
                        src={mediaConfig.src}
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
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden w-full max-w-md mx-auto flex flex-col items-center" style={{ gap: '32px' }}>
        {/* Media Section - Top on mobile */}
        {hasMedia && mediaConfig && (
          <div className="w-full">
            {/* Image Type */}
            {mediaConfig.type === 'image' && (
              <div
                className="relative w-full overflow-hidden"
                style={{
                  aspectRatio: '16/10',
                  borderRadius: '16px',
                  backgroundImage: `url(${mediaConfig.src})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
            )}

            {/* Video Type */}
            {mediaConfig.type === 'video' && (
              <div
                className="relative w-full overflow-hidden"
                style={{
                  aspectRatio: '16/10',
                  borderRadius: '16px'
                }}
              >
                {!videoLoaded[currentItem.id] ? (
                  // Thumbnail with play button
                  <div
                    onClick={() => handleVideoClick(currentItem.id)}
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
                        className="flex items-center justify-center w-16 h-16 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-300"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M8 5v14l11-7L8 5z" fill="#7D1A13"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Embedded video
                  <div className="w-full h-full">
                    {mediaConfig.videoType === 'youtube' ? (
                      <iframe
                        className="w-full h-full"
                        src={`${mediaConfig.src}${mediaConfig.src.includes('?') ? '&' : '?'}autoplay=1`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ borderRadius: '16px' }}
                      />
                    ) : (
                      <iframe
                        className="w-full h-full"
                        src={mediaConfig.src}
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

        {/* Testimonial Text - Bottom on mobile */}
        <div className="w-full flex flex-col items-center gap-4 text-center px-4">
          <span
            className="text-sm font-medium uppercase tracking-wider"
            style={{ fontFamily: 'Avenir Next, sans-serif', color: '#B8860B' }}
          >
            {tagline}
          </span>

          <p
            className="text-lg italic"
            style={{
              fontFamily: 'Optima, sans-serif',
              fontSize: 'clamp(18px, 3vw, 24px)',
              lineHeight: '140%',
              color: '#000000'
            }}
          >
            "{currentItem.quote}"
          </p>

          <div>
            <p style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              fontWeight: 600,
              color: '#000000'
            }}>
              {currentItem.author}
            </p>
            <p style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: 'clamp(12px, 2vw, 14px)',
              color: '#6B7280'
            }}>
              {currentItem.location}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation - Desktop */}
      <div className="hidden lg:flex justify-between items-center mt-8 w-full max-w-7xl mx-auto">
        {/* Slider Dots */}
        <div className="flex items-center gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentTestimonial === index ? 'bg-gray-800 w-6' : 'bg-gray-300 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>

        {/* Slider Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={prevTestimonial}
            className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors duration-300"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={nextTestimonial}
            className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors duration-300"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 15l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation - Mobile (dots only, auto-slides) */}
      <div className="lg:hidden flex justify-center mt-6">
        <div className="flex items-center space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                currentTestimonial === index
                  ? 'w-6'
                  : 'hover:bg-gray-600'
              }`}
              style={{
                backgroundColor: currentTestimonial === index ? '#374151' : '#D1D5DB'
              }}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;
