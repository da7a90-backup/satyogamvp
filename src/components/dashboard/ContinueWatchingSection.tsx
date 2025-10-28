'use client';

import Link from 'next/link';
import Image from 'next/image';

interface Teaching {
  id: string;
  thumbnail: string;
  title: string;
  description: string;
  date: string;
  duration: string;
  accessType: 'free' | 'restricted';
  mediaType: 'video' | 'audio' | 'text';
  slug: string;
  progress?: number; // Progress percentage (0-100)
}

interface ContinueWatchingSectionProps {
  teachings: Teaching[];
}

export default function ContinueWatchingSection({
  teachings,
}: ContinueWatchingSectionProps) {
  if (teachings.length === 0) {
    return null;
  }

  return (
    <section
      className="w-full py-10 px-4 lg:px-16"
      style={{ backgroundColor: '#FAF8F1' }}
    >
      <div className="max-w-[1312px] mx-auto">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-6">
          <h2
            style={{
              fontFamily: 'Optima, Georgia, serif',
              fontSize: '24px',
              fontWeight: 700,
              lineHeight: '32px',
              color: '#000000',
            }}
          >
            Continue Watching
          </h2>
          <p
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '14px',
              color: '#717680',
            }}
          >
            Pick up where you left off
          </p>
        </div>

        {/* Horizontal Scrolling Grid */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-6" style={{ minWidth: 'min-content' }}>
            {teachings.map((teaching) => (
              <ContinueWatchingCard
                key={teaching.id}
                teaching={teaching}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Continue Watching Card Component
function ContinueWatchingCard({ teaching }: { teaching: Teaching }) {
  return (
    <Link
      href={`/dashboard/user/library/teachings/${teaching.slug}`}
      className="bg-white border rounded-lg overflow-hidden flex-shrink-0 hover:shadow-lg transition-shadow"
      style={{
        borderColor: '#D2D6DB',
        width: '320px',
      }}
    >
      {/* Thumbnail */}
      <div className="relative h-[180px] bg-gray-200">
        <Image
          src={teaching.thumbnail}
          alt={teaching.title}
          fill
          className="object-cover"
          unoptimized
        />

        {/* Play Button Overlay */}
        {(teaching.mediaType === 'video' || teaching.mediaType === 'audio') && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div
                className="absolute inset-0"
                style={{
                  width: '128px',
                  height: '102.4px',
                  background: 'rgba(0, 0, 0, 0.15)',
                  borderRadius: '50%',
                  filter: 'blur(15px)',
                  transform: 'translate(-50%, -50%)',
                  top: '50%',
                  left: '50%',
                }}
              />
              <div className="relative w-16 h-16 rounded-full bg-white flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 2l10 6-10 6V2z" fill="#000000" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar at Bottom of Thumbnail */}
        {teaching.progress !== undefined && teaching.progress > 0 && (
          <div
            className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
          >
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${teaching.progress}%`,
                backgroundColor: '#7D1A13',
              }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Meta Info */}
        <div className="flex items-center gap-3 mb-2">
          <span
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              color: '#717680',
            }}
          >
            {teaching.date}
          </span>
          <div className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="#535862" strokeWidth="1.5" />
              <path
                d="M8 4v4l2.5 1.5"
                stroke="#535862"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '12px',
                fontWeight: 600,
                color: '#535862',
              }}
            >
              {teaching.duration}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3
          className="mb-2 line-clamp-2"
          style={{
            fontFamily: 'Avenir Next, sans-serif',
            fontSize: '16px',
            fontWeight: 600,
            lineHeight: '24px',
            color: '#000000',
          }}
        >
          {teaching.title}
        </h3>

        {/* Progress Text */}
        {teaching.progress !== undefined && teaching.progress > 0 && (
          <p
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '12px',
              color: '#7D1A13',
              fontWeight: 600,
            }}
          >
            {teaching.progress}% complete
          </p>
        )}
      </div>
    </Link>
  );
}
