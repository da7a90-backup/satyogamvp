'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

interface APITeaching {
  id: string;
  slug: string;
  title: string;
  description?: string;
  content_type: 'VIDEO' | 'AUDIO' | 'TEXT' | 'MEDITATION' | 'ESSAY';
  access_level: string;
  thumbnail_url?: string;
  duration?: number;
  published_date: string;
  category?: string;
  tags?: string[];
  can_access: boolean;
  access_type: 'full' | 'preview' | 'none';
  preview_duration?: number;
  video_url?: string;
  audio_url?: string;
  text_content?: string;
  cloudflare_ids?: string[];
  podbean_ids?: string[];
  view_count?: number;
}

interface TeachingDetailClientProps {
  teaching: APITeaching;
  isLoggedIn: boolean;
}

export default function TeachingDetailClient({ teaching, isLoggedIn }: TeachingDetailClientProps) {
  const [mounted, setMounted] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-[#FAF8F1]" />;
  }

  const hasVideoPlayer = teaching.cloudflare_ids && teaching.cloudflare_ids.length > 0;
  const hasAudioPlayer = teaching.podbean_ids && teaching.podbean_ids.length > 0;
  const isVideoOrAudio = teaching.content_type === 'VIDEO' || teaching.content_type === 'AUDIO' || teaching.content_type === 'MEDITATION';

  return (
    <div className="min-h-screen bg-[#FAF8F1]">
      {/* Header */}
      <div className="bg-white border-b border-[#E9EAEB]">
        <div className="max-w-[1312px] mx-auto px-4 lg:px-8 py-6">
          <Link
            href="/teachings"
            className="inline-flex items-center gap-2 text-[#535862] hover:text-[#7D1A13] transition-colors"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Teachings
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1312px] mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video/Audio Player */}
            {isVideoOrAudio && teaching.can_access && (
              <div className="bg-black rounded-lg overflow-hidden mb-6" style={{ position: 'relative', paddingTop: '56.25%' }}>
                {hasVideoPlayer && teaching.cloudflare_ids[0] && videoStarted && (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <iframe
                      key={teaching.cloudflare_ids[0]}
                      src={`https://iframe.videodelivery.net/${teaching.cloudflare_ids[0]}?autoplay=true&muted=true`}
                      title={teaching.title}
                      style={{ border: 0, width: '100%', height: '100%' }}
                      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                      sandbox="allow-scripts allow-same-origin allow-presentation"
                      allowFullScreen={true}
                    />
                  </div>
                )}
                {hasVideoPlayer && teaching.cloudflare_ids[0] && !videoStarted && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      cursor: 'pointer',
                      backgroundColor: '#1a1a1a'
                    }}
                    className="flex items-center justify-center"
                    onClick={() => {
                      console.log('Play button clicked');
                      setVideoStarted(true);
                    }}
                  >
                    <img
                      src={teaching.thumbnail_url || '/default-thumbnail.jpg'}
                      alt={teaching.title}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        console.log('Thumbnail failed to load:', teaching.thumbnail_url);
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={() => console.log('Thumbnail loaded successfully')}
                    />
                    <div style={{ position: 'relative', zIndex: 10 }} className="bg-red-600 rounded-full p-6 hover:bg-red-700 transition-all">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <path d="M8 5v14l11-7z" fill="#FFFFFF" />
                      </svg>
                    </div>
                  </div>
                )}
                {!hasVideoPlayer && hasAudioPlayer && teaching.podbean_ids[0] && (
                  <iframe
                    src={`https://www.podbean.com/player-v2/?i=${teaching.podbean_ids[0]}&share=1&download=1&fonts=Arial&skin=1&btn-skin=7`}
                    style={{ border: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    allowFullScreen={true}
                  />
                )}
                {!hasVideoPlayer && !hasAudioPlayer && (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} className="flex items-center justify-center bg-gray-900">
                    <img
                      src={teaching.thumbnail_url || '/default-thumbnail.jpg'}
                      alt={teaching.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Thumbnail for locked content */}
            {isVideoOrAudio && !teaching.can_access && (
              <div className="relative bg-black rounded-lg overflow-hidden mb-6" style={{ position: 'relative', paddingTop: '56.25%' }}>
                <img
                  src={teaching.thumbnail_url || '/default-thumbnail.jpg'}
                  alt={teaching.title}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }}
                />
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} className="flex items-center justify-center bg-black/50">
                  <div className="text-center text-white">
                    <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
                      <path d="M7 10V7a5 5 0 0110 0v3m-9 0h10a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8a2 2 0 012-2z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <p className="text-xl font-semibold mb-2">Membership Required</p>
                    <p className="text-sm">Upgrade to access this teaching</p>
                  </div>
                </div>
              </div>
            )}

            {/* Teaching Info */}
            <div className="bg-white rounded-lg p-6 border border-[#D2D6DB]">
              <div className="flex items-center gap-4 mb-4">
                <span
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#7D1A13',
                  }}
                >
                  {new Date(teaching.published_date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                {teaching.duration && (
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6" stroke="#535862" strokeWidth="1.5"/>
                      <path d="M8 4v4l2.5 1.5" stroke="#535862" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span
                      style={{
                        fontFamily: 'Avenir Next, sans-serif',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#384250',
                      }}
                    >
                      {Math.floor(teaching.duration / 60)} minutes
                    </span>
                  </div>
                )}
              </div>

              <h1
                className="mb-4"
                style={{
                  fontFamily: 'Optima, Georgia, serif',
                  fontSize: '32px',
                  fontWeight: 700,
                  lineHeight: '40px',
                  color: '#000000',
                }}
              >
                {teaching.title}
              </h1>

              <p
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  fontWeight: 500,
                  lineHeight: '28px',
                  color: '#384250',
                }}
              >
                {teaching.description}
              </p>

              {teaching.tags && teaching.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {teaching.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full border border-[#D5D7DA] bg-[#FAF8F1]"
                      style={{
                        fontFamily: 'Avenir Next, sans-serif',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#535862',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Text Content for Essays */}
            {(teaching.content_type === 'TEXT' || teaching.content_type === 'ESSAY') && teaching.text_content && (
              <div className="bg-white rounded-lg p-8 border border-[#D2D6DB] mt-6">
                <div
                  className="prose max-w-none"
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '16px',
                    lineHeight: '28px',
                    color: '#384250',
                  }}
                  dangerouslySetInnerHTML={{ __html: teaching.text_content }}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 border border-[#D2D6DB] sticky top-8">
              <h3
                className="mb-4"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#111927',
                }}
              >
                Teaching Details
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[#717680] mb-1">Category</p>
                  <p className="text-[#111927] font-semibold">{teaching.category || 'General'}</p>
                </div>

                <div>
                  <p className="text-sm text-[#717680] mb-1">Content Type</p>
                  <p className="text-[#111927] font-semibold">
                    {teaching.content_type === 'VIDEO' && 'Video Teaching'}
                    {teaching.content_type === 'AUDIO' && 'Audio Teaching'}
                    {teaching.content_type === 'MEDITATION' && 'Guided Meditation'}
                    {(teaching.content_type === 'TEXT' || teaching.content_type === 'ESSAY') && 'Essay'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-[#717680] mb-1">Access Level</p>
                  <p className="text-[#111927] font-semibold">
                    {teaching.access_level === 'FREE' && 'Free'}
                    {teaching.access_level === 'PREVIEW' && 'Preview Available'}
                    {teaching.access_level === 'GYANI' && 'Gyani Membership'}
                    {teaching.access_level === 'PRAGYANI' && 'Pragyani Membership'}
                    {teaching.access_level === 'PRAGYANI_PLUS' && 'Pragyani+ Membership'}
                  </p>
                </div>

                {teaching.view_count !== undefined && (
                  <div>
                    <p className="text-sm text-[#717680] mb-1">Views</p>
                    <p className="text-[#111927] font-semibold">{teaching.view_count.toLocaleString()}</p>
                  </div>
                )}
              </div>

              {!teaching.can_access && (
                <Link
                  href="/membership"
                  className="mt-6 block w-full px-4 py-3 rounded-lg text-center transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: '#7D1A13',
                    color: '#FFFFFF',
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '16px',
                    fontWeight: 600,
                  }}
                >
                  Upgrade to Watch
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
