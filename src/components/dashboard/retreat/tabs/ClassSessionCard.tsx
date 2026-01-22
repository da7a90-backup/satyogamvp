'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { PortalSession } from '@/types/retreat';
import YouTubePlayer from '@/components/teachings/YouTubePlayer';

interface ClassSessionCardProps {
  session: PortalSession;
  isLarge?: boolean; // For single large cards vs 3-card row
}

export default function ClassSessionCard({
  session,
  isLarge = false,
}: ClassSessionCardProps) {
  const [showContent, setShowContent] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // Extract video IDs and URLs
  const getYouTubeId = (url?: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const getCloudflareId = (url?: string) => {
    if (!url) return null;
    const match = url.match(/(?:cloudflarestream\.com|videodelivery\.net)\/([a-f0-9]{32})/);
    return match ? match[1] : null;
  };

  const isCloudflareUrl = (url?: string) => {
    if (!url) return false;
    return url.includes('cloudflarestream.com') || url.includes('videodelivery.net');
  };

  const isHLSUrl = (url?: string) => {
    if (!url) return false;
    return url.endsWith('.m3u8');
  };

  const isAudioDownloadUrl = (url?: string) => {
    if (!url) return false;
    return url.includes('/downloads/');
  };

  const getPodbeanEmbedUrl = (url?: string) => {
    if (!url || !url.includes('podbean')) return null;
    // If it's already an embed URL, return it
    if (url.includes('/player/')) return url;
    // Try to extract episode ID and construct embed URL
    const match = url.match(/podbean\.com.*i=([a-z0-9-]+)/);
    if (match) {
      return `https://www.podbean.com/player-v2/?i=${match[1]}&btn-skin=7&share=1&download=1&font-color=auto`;
    }
    return url; // Return as-is if we can't parse it
  };

  const youtubeId = session.youtube_live_id || getYouTubeId(session.video_url);
  const cloudflareId = getCloudflareId(session.video_url);
  const podbeanUrl = getPodbeanEmbedUrl(session.zoom_link || session.video_url);

  // Handle click - for teaching type, we embed inline
  const handleClick = () => {
    if (session.type === 'teaching' || session.type === 'video' || session.type === 'meditation' || session.type === 'audio') {
      setShowContent(!showContent);
    }
  };

  // Get badge text
  const getBadgeText = () => {
    if (session.is_text) return 'Text';
    if (session.has_video) return 'Video';
    if (session.has_audio) return 'Audio';
    return null;
  };

  return (
    <div>
      {/* Card */}
      <div
        className={`
          bg-white border border-gray-200 rounded-lg overflow-hidden
          cursor-pointer hover:shadow-md transition-shadow
          ${isLarge ? 'w-full' : ''}
        `}
        onClick={handleClick}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-900">
          {session.thumbnail_url ? (
            <img
              src={session.thumbnail_url}
              alt={session.session_title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
              <svg
                className="w-16 h-16 text-white opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          )}

          {/* Badge */}
          {getBadgeText() && (
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-[rgba(82,82,82,0.4)] backdrop-blur-sm rounded">
              <span className="text-xs font-medium text-white">
                {getBadgeText()}
              </span>
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorited(!isFavorited);
            }}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Date & Duration */}
          <div className="flex items-center gap-3 mb-2">
            {session.date && (
              <span
                className="text-sm text-[#7D1A13] font-medium"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                {session.date}
              </span>
            )}
            {session.duration && (
              <>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-1 text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                    {session.duration} minutes
                  </span>
                </div>
              </>
            )}
            {session.page_count && (
              <>
                <span className="text-gray-300">•</span>
                <span
                  className="text-sm text-gray-600"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                >
                  {session.page_count} pages
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h3
            className="text-base font-semibold text-black mb-2 line-clamp-2"
            style={{ fontFamily: 'Avenir Next, sans-serif' }}
          >
            {session.session_title}
          </h3>

          {/* Description */}
          {session.description && (
            <p
              className="text-sm text-gray-600 line-clamp-2"
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              {session.description}
            </p>
          )}
        </div>
      </div>

      {/* Embedded Content (Teaching/Video/Audio) */}
      {showContent && (
        <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
          {/* YouTube Player */}
          {youtubeId && (
            <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
              <YouTubePlayer
                videoId={youtubeId}
                title={session.session_title}
                isLoggedIn={true}
                isPreviewMode={false}
                previewDuration={0}
                onPreviewEnd={() => {}}
                isDashboard={true}
              />
            </div>
          )}

          {/* Cloudflare Stream Player - Works for both video and audio */}
          {!youtubeId && cloudflareId && (
            <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
              <iframe
                src={`https://iframe.videodelivery.net/${cloudflareId}`}
                className="w-full h-full"
                style={{ border: 'none' }}
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen={true}
              />
            </div>
          )}

          {/* Podbean Audio Player */}
          {podbeanUrl && session.has_audio && (
            <div className="mb-4">
              <iframe
                src={podbeanUrl}
                style={{ border: 'none', width: '100%', height: '122px' }}
                scrolling="no"
                allow="autoplay"
              />
            </div>
          )}

          {/* Direct MP3/Audio Player (for direct audio URLs) */}
          {!youtubeId && !cloudflareId && !podbeanUrl && session.type === 'audio' && session.audio_url && (
            <div className="mb-4 bg-gray-900 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#7D1A13] to-[#5D1410] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold text-sm mb-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                    {session.session_title}
                  </h4>
                  <p className="text-gray-400 text-xs" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                    Audio Recording
                  </p>
                </div>
              </div>
              <audio
                controls
                controlsList="nodownload"
                className="w-full"
                style={{ height: '40px' }}
              >
                <source src={session.audio_url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Zoom Link for Livestream (current/upcoming retreats) */}
          {session.type === 'livestream' && session.zoom_link && !podbeanUrl && (
            <div className="text-center mb-4">
              <a
                href={session.zoom_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.08 9.188L22 13.333V7.667a1 1 0 00-1.555-.832l-5.365 3.353z" />
                  <path d="M3 7.667C3 6.747 3.746 6 4.667 6h9.666C15.253 6 16 6.747 16 7.667v7.666c0 .92-.746 1.667-1.667 1.667H4.667A1.667 1.667 0 013 15.333V7.667z" />
                </svg>
                Join Zoom Live
              </a>
            </div>
          )}

          {/* Description/Transcription */}
          {session.description && (
            <div className="text-sm text-gray-700 mt-4 leading-5">
              {session.description}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
