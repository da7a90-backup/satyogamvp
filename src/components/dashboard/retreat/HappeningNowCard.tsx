'use client';

import { LiveSession } from '@/types/retreat';
import Image from 'next/image';

interface HappeningNowCardProps {
  session: LiveSession;
  retreatTitle?: string;
  variant?: 'default' | 'sidebar' | 'dashboard';
}

export default function HappeningNowCard({
  session,
  retreatTitle,
  variant = 'default'
}: HappeningNowCardProps) {
  // Extract YouTube video ID if present
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const youtubeId = session.youtube_live_url
    ? getYouTubeId(session.youtube_live_url)
    : session.youtube_live_id;

  const isYouTubeLive = !!youtubeId;
  const isZoom = !!session.zoom_link;

  // Placeholder thumbnail if none provided
  const thumbnailUrl = session.thumbnail_url || '/orbanner.png';

  // Dashboard variant - larger with embedded video
  if (variant === 'dashboard') {
    return (
      <div className="flex flex-col items-start gap-3 lg:gap-4 p-4 lg:p-6 bg-white border border-[#D2D6DB] rounded-lg">
        {/* Header with LIVE badge */}
        <div className="flex flex-row items-center justify-between self-stretch">
          <h3 className="text-lg lg:text-xl font-bold text-black font-avenir">
            Happening Now
          </h3>
          <div className="flex items-center gap-2 px-2 lg:px-3 py-1 bg-red-600 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-white uppercase">LIVE</span>
          </div>
        </div>

        {/* YouTube Live Embed */}
        {isYouTubeLive && (
          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Zoom Thumbnail */}
        {isZoom && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={thumbnailUrl}
              alt={session.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Session Info */}
        <div className="flex flex-col items-start gap-2 self-stretch">
          {retreatTitle && (
            <p className="text-xs lg:text-sm font-medium text-[#717680] font-avenir">
              {retreatTitle}
            </p>
          )}
          <h4 className="text-base lg:text-lg font-semibold text-black font-avenir">
            {session.title}
          </h4>
          {session.description && (
            <p className="text-sm lg:text-base text-[#384250] font-avenir">
              {session.description}
            </p>
          )}
          <p className="text-xs lg:text-sm font-medium text-[#717680] font-avenir">
            {session.time}
          </p>
        </div>

        {/* Zoom Join Button */}
        {isZoom && session.zoom_link && (
          <a
            href={session.zoom_link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-4 lg:px-6 py-2.5 lg:py-3 bg-[#7D1A13] text-white text-center text-sm lg:text-base font-semibold rounded-lg hover:opacity-90 transition-opacity font-avenir"
          >
            Join Livestream
          </a>
        )}
      </div>
    );
  }

  // Sidebar variant - compact
  if (variant === 'sidebar') {
    return (
      <div className="flex flex-col items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
          <span className="text-xs font-semibold text-red-600 uppercase">HAPPENING NOW</span>
        </div>

        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={thumbnailUrl}
            alt={session.title}
            fill
            className="object-cover"
          />
          {isYouTubeLive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="w-12 h-12 flex items-center justify-center bg-white/90 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-start gap-1 self-stretch">
          <h4 className="text-sm font-semibold text-black font-avenir line-clamp-2">
            {session.title}
          </h4>
          <p className="text-xs text-[#717680] font-avenir">
            {session.time}
          </p>
        </div>

        {isZoom && session.zoom_link && (
          <a
            href={session.zoom_link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-4 py-2 bg-[#7D1A13] text-white text-center text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity font-avenir"
          >
            Join Now
          </a>
        )}
      </div>
    );
  }

  // Default variant - for preparation tab
  return (
    <div className="flex flex-col items-start gap-4 p-6 bg-red-50 border-2 border-red-600 rounded-lg">
      <div className="flex flex-row items-center justify-between self-stretch">
        <h3 className="text-xl font-bold text-black font-avenir">
          Happening Now
        </h3>
        <div className="flex items-center gap-2 px-3 py-1 bg-red-600 rounded-full">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="text-xs font-semibold text-white uppercase">LIVE</span>
        </div>
      </div>

      {/* Thumbnail or Video Embed */}
      {isYouTubeLive ? (
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={thumbnailUrl}
            alt={session.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="flex flex-col items-start gap-2 self-stretch">
        <h4 className="text-lg font-semibold text-black font-avenir">
          {session.title}
        </h4>
        {session.description && (
          <p className="text-base text-[#384250] font-avenir">
            {session.description}
          </p>
        )}
        <p className="text-sm font-medium text-[#717680] font-avenir">
          {session.time}
        </p>
      </div>

      {isZoom && session.zoom_link && (
        <a
          href={session.zoom_link}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full px-6 py-3 bg-[#7D1A13] text-white text-center font-semibold rounded-lg hover:opacity-90 transition-opacity font-avenir"
        >
          Join Livestream
        </a>
      )}
    </div>
  );
}
