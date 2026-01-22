'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getBookGroupPortal, checkBookGroupAccess } from '@/lib/book-groups-api';
import { BookGroupPortal, BookGroupSession, BookGroupStatus } from '@/types/book-group';
import { ExternalLink, Download, Play, Volume2, FileText } from 'lucide-react';

interface BookGroupPortalClientProps {
  slug: string;
  isAuthenticated: boolean;
  userJwt: string | null;
}

export default function BookGroupPortalClient({
  slug,
  isAuthenticated,
  userJwt,
}: BookGroupPortalClientProps) {
  const router = useRouter();
  const [bookGroup, setBookGroup] = useState<BookGroupPortal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions'>('sessions');

  useEffect(() => {
    async function loadData() {
      if (!userJwt) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      try {
        // Fetch portal data and check access
        const [portalData, accessData] = await Promise.all([
          getBookGroupPortal(slug),
          checkBookGroupAccess(slug),
        ]);

        setBookGroup(portalData);
        setHasAccess(accessData.has_access);
        setLoading(false);
      } catch (err: any) {
        console.error('Failed to load book group:', err);
        setError(err.message || 'Failed to load book group');
        setLoading(false);
      }
    }

    loadData();
  }, [slug, userJwt]);

  // Group sessions by week
  const groupedSessions = bookGroup?.sessions.reduce((acc, session) => {
    const week = session.week_number;
    if (!acc[week]) {
      acc[week] = [];
    }
    acc[week].push(session);
    return acc;
  }, {} as Record<number, BookGroupSession[]>);

  // Get sorted week numbers
  const weekNumbers = groupedSessions ? Object.keys(groupedSessions).map(Number).sort((a, b) => a - b) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#7D1A13] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            Loading book group...
          </p>
        </div>
      </div>
    );
  }

  if (error || !bookGroup) {
    return (
      <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-[#000000] mb-4" style={{ fontFamily: 'Optima, serif' }}>
            {error || 'Book Group Not Found'}
          </h2>
          <p className="text-[#717680] mb-6" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            We couldn't load this book group. It may not exist or you may not have access.
          </p>
          <button
            onClick={() => router.push('/dashboard/user/book-groups')}
            className="px-6 py-3 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B150F] transition-colors"
            style={{ fontFamily: 'Avenir Next, sans-serif' }}
          >
            Back to Book Groups
          </button>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="5" y="11" width="14" height="10" rx="2" strokeWidth="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#000000] mb-4" style={{ fontFamily: 'Optima, serif' }}>
            Access Required
          </h2>
          <p className="text-[#717680] mb-6" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            {bookGroup.requires_purchase
              ? 'This book group requires purchase to access.'
              : 'Upgrade to Gyani or higher to access this book group.'}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/dashboard/user/book-groups')}
              className="px-6 py-3 bg-white border border-[#D5D7DA] text-[#414651] rounded-lg hover:bg-gray-50 transition-colors"
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              Back to Book Groups
            </button>
            {bookGroup.requires_purchase && (
              <button
                onClick={() => router.push('/store')}
                className="px-6 py-3 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B150F] transition-colors"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                Browse Store
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:min-h-[125vh] bg-[#FAF8F1]">
      {/* Hero Section */}
      <div className="relative h-[320px] bg-gradient-to-br from-gray-800 to-gray-900">
        {bookGroup.hero_image && (
          <Image
            src={bookGroup.hero_image}
            alt={bookGroup.title}
            fill
            className="object-cover"
            unoptimized={true}
            style={{
              objectPosition: bookGroup.hero_image_gravity || 'center',
              filter: 'brightness(0.4)',
            }}
          />
        )}

        {/* Content Overlay */}
        <div className="relative h-full max-w-7xl mx-auto px-8 flex items-center justify-between">
          {/* Left - Book Cover */}
          {bookGroup.book_cover_image && (
            <div className="relative w-[180px] h-[240px] shadow-2xl rounded-lg overflow-hidden">
              <Image
                src={bookGroup.book_cover_image}
                alt={`${bookGroup.title} cover`}
                fill
                className="object-cover"
                unoptimized={true}
              />
            </div>
          )}

          {/* Right - Info */}
          <div className="flex-1 ml-8 text-white">
            <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full mb-4">
              <span className="text-sm font-medium">
                {bookGroup.status === BookGroupStatus.LIVE
                  ? 'Live Now'
                  : bookGroup.status === BookGroupStatus.UPCOMING
                  ? 'Upcoming'
                  : 'Completed'}
              </span>
            </div>

            <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: 'Optima, serif' }}>
              {bookGroup.title}
            </h1>

            {bookGroup.description && (
              <p className="text-lg text-gray-200 mb-4 line-clamp-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                {bookGroup.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm">
              <span>{bookGroup.session_count} sessions</span>
              {bookGroup.meeting_day_of_week && (
                <>
                  <span>•</span>
                  <span>{bookGroup.meeting_day_of_week}s</span>
                </>
              )}
              {bookGroup.meeting_time && (
                <>
                  <span>•</span>
                  <span>{bookGroup.meeting_time}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 pt-6 px-1 border-b-2 transition-colors text-sm font-medium ${
                activeTab === 'overview'
                  ? 'border-[#7D1A13] text-[#7D1A13]'
                  : 'border-transparent text-[#717680] hover:text-[#000000]'
              }`}
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`pb-4 pt-6 px-1 border-b-2 transition-colors text-sm font-medium ${
                activeTab === 'sessions'
                  ? 'border-[#7D1A13] text-[#7D1A13]'
                  : 'border-transparent text-[#717680] hover:text-[#000000]'
              }`}
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              Sessions ({bookGroup.session_count})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-[#000000] mb-4" style={{ fontFamily: 'Optima, serif' }}>
              About This Book Group
            </h2>
            <div
              className="prose max-w-none text-[#384250]"
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
              dangerouslySetInnerHTML={{ __html: bookGroup.description || 'No description available.' }}
            />
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-8">
            {weekNumbers.map((weekNum) => {
              const sessions = groupedSessions![weekNum];
              return (
                <div key={weekNum} className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-[#000000] mb-4" style={{ fontFamily: 'Optima, serif' }}>
                    Week {weekNum}
                  </h3>
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <SessionCard key={session.id} session={session} bookGroupStatus={bookGroup.status} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Session Card Component
function SessionCard({ session, bookGroupStatus }: { session: BookGroupSession; bookGroupStatus: BookGroupStatus }) {
  const showZoom = session.zoom_enabled && (bookGroupStatus === BookGroupStatus.LIVE || bookGroupStatus === BookGroupStatus.UPCOMING);
  const showMedia = bookGroupStatus === BookGroupStatus.COMPLETED && (session.video_url || session.audio_url);

  return (
    <div className="border border-[#E5E7EB] rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-[#000000] mb-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            {session.title}
          </h4>
          {session.description && (
            <p className="text-sm text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              {session.description}
            </p>
          )}
          {session.session_date && (
            <p className="text-sm text-[#717680] mt-2">
              {new Date(session.session_date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {showZoom && session.zoom_link && (
            <a
              href={session.zoom_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B150F] transition-colors text-sm font-medium"
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              <ExternalLink size={16} />
              Join Zoom
            </a>
          )}

          {showMedia && session.video_url && (
            <a
              href={session.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D5D7DA] text-[#414651] rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              <Play size={16} />
              Watch Video
            </a>
          )}

          {showMedia && session.audio_url && (
            <a
              href={session.audio_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D5D7DA] text-[#414651] rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              <Volume2 size={16} />
              Listen
            </a>
          )}
        </div>
      </div>

      {/* Downloads */}
      {session.downloads && session.downloads.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
          <h5 className="text-sm font-semibold text-[#000000] mb-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            Downloads
          </h5>
          <div className="flex flex-wrap gap-2">
            {session.downloads.map((download, idx) => (
              <a
                key={idx}
                href={download.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-[#E5E7EB] rounded-lg hover:bg-gray-100 transition-colors text-sm"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                {download.type === 'pdf' ? <FileText size={14} /> : <Download size={14} />}
                {download.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Transcript */}
      {session.transcript_url && (
        <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
          <a
            href={session.transcript_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-[#7D1A13] hover:underline"
            style={{ fontFamily: 'Avenir Next, sans-serif' }}
          >
            <FileText size={14} />
            View Transcript
          </a>
        </div>
      )}
    </div>
  );
}
