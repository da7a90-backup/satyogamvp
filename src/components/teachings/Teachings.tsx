'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { teachingsApi, Teaching as StrapiTeaching, getStrapiMedia } from '@/lib/api';

// Interface for teaching data with membership levels
interface Teaching {
  id: string | number;
  slug: string;
  title: string;
  description?: string;
  summary?: string;
  content?: any;
  duration?: string;
  type: 'free' | 'extra_preview' | 'membership';
  access: string;
  contentType: string;
  date: string;
  publishDate: string;
  imageUrl: string;
  videoUrl?: string;
  videoPlatform: string;
  videoId?: string;
  audioUrl?: string;
  audioPlatform: string;
  hiddenTags?: string;
  previewDuration?: number;
  transcription?: string;
}

interface TeachingLibraryPageProps {
  initialTeachings: Teaching[];
}

/* ─────────── constants ─────────── */
const contentTypes = [
  'Teachings',
  'Guided Meditations',
  'Q&A with Shunyamurti',
  'Essay',
] as const;

// Map content types to what we expect from Strapi
const contentTypeToStrapiMap = {
  'Teachings': 'teaching',
  'Guided Meditations': 'guided_meditation',
  'Q&A with Shunyamurti': 'qa_with_shunyamurti',
  'Essay': 'essay',
} as const;

// Content type mapping from Strapi to UI display
const contentTypeMap = {
  teaching: 'Teachings',
  guided_meditation: 'Guided Meditations',
  qa_with_shunyamurti: 'Q&A with Shunyamurti',
  essay: 'Essay',
  book_group: 'Book Group',
} as const;

// Default preview duration in seconds (30 seconds)
const DEFAULT_PREVIEW_DURATION = 30;

/**
 * Transform Strapi Teaching response to UI-compatible format
 */
function transformStrapiTeachingForUI(teaching: StrapiTeaching): Teaching {
  const { id, attributes } = teaching;
  
  // Extract image URL from Strapi's nested structure
  const imageUrl = attributes.featuredImage?.data?.attributes?.url 
    ? (getStrapiMedia(attributes.featuredImage.data.attributes.url) || '/placeholder-video.jpg')
    : '/placeholder-video.jpg';

  // Determine display type based on hidden tags
  let type: 'free' | 'extra_preview' | 'membership';
  const tags = attributes.hiddenTags?.toLowerCase() || '';
  if (tags.includes('preview')) {
    type = 'free';
  } else if (tags.includes('extra_preview')) {
    type = 'extra_preview';
  } else {
    type = 'membership';
  }

  // Prioritize publishDate, then publishedAt, then createdAt for sorting
  const publishDateString = attributes.publishDate || attributes.createdAt;
  const displayDateString = attributes.publishDate || attributes.createdAt;
  
  const publishDate = new Date(publishDateString).toISOString();
  const date = new Date(displayDateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Map content type to display name
  const contentType = contentTypeMap[attributes.contenttype] || attributes.contenttype;

  return {
    id: id,
    slug: attributes.slug,
    title: attributes.title,
    description: attributes.description,
    summary: attributes.summary,
    content: attributes.content,
    duration: attributes.duration || '',
    type,
    access: attributes.access,
    contentType,
    date,
    publishDate,
    imageUrl,
    videoUrl: attributes.videoUrl,
    videoPlatform: attributes.videoPlatform,
    videoId: attributes.videoId,
    audioUrl: attributes.audioUrl,
    audioPlatform: attributes.audioPlatform,
    hiddenTags: attributes.hiddenTags,
    previewDuration: attributes.previewDuration || DEFAULT_PREVIEW_DURATION,
    transcription: attributes.transcription,
  };
}

/**
 * Sort teachings by publishDate (newest first)
 */
function sortTeachingsByDate(teachings: Teaching[]): Teaching[] {
  return [...teachings].sort((a, b) => {
    const dateA = new Date(a.publishDate);
    const dateB = new Date(b.publishDate);
    return dateB.getTime() - dateA.getTime(); // Newest first
  });
}

/**
 * Check if a teaching has a specific hidden tag
 */
function hasHiddenTag(teaching: Teaching, tag: string): boolean {
  if (!teaching.hiddenTags) return false;
  return teaching.hiddenTags.toLowerCase().includes(tag.toLowerCase());
}

/**
 * Get user's membership level from session
 */
const getMembershipLevel = (session: any): 'anon' | 'free' | 'gyani' => {
  // Debug logging
  console.log('Session in getMembershipLevel:', session);
  
  if (!session || !session.user) {
    console.log('No session or user found, returning anon');
    return 'anon';
  }
  
  // Check user's membership level from session
  const membership = session.user?.membership?.toLowerCase() || 'free';
  
  console.log('Detected membership level:', membership);
  
  // Convert membership names to our three-tier system
  if (membership === 'gyani' || membership === 'pragyani' || membership === 'pragyaniplus') {
    return 'gyani';
  }
  
  // If user is logged in but no specific membership or 'free', they're free tier
  return 'free';
};

/* ─────────── UI: hero banner ────── */
const LibraryHero: React.FC = () => (
  <div className="relative bg-[#300001] text-white mb-12" style={{ height: '85vh' }}>
    {/* Background image centered */}
    <div className="absolute inset-0 z-0 flex items-center justify-center">
      <div 
        className="border-2 border-[#D4AF37] p-8"
        style={{ 
          width: '480px', 
          height: '480px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          aspectRatio: '1/1'
        }}
      >
        <div className="relative w-full h-full">
          <Image
            src="/spiral.png"
            alt="Inner Labyrinth"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
    
    {/* Dark gradient overlay - from bottom with emphasis on bottom left */}
    <div 
      className="absolute inset-0 z-5"
      style={{
        background: 'radial-gradient(ellipse 120% 60% at 40% 100%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.4) 50%, transparent 70%)'
      }}
    />
    
    {/* Text content in absolute bottom left corner */}
    <div className="absolute bottom-0 left-0 z-10 p-6 pl-10">
      <div className="max-w-2xl">
        <p 
          className="text-sm md:text-base font-bold mb-4 tracking-wide"
          style={{ 
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            background: 'linear-gradient(to bottom, #ffffff, #999999)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          FREE TEACHINGS LIBRARY
        </p>
        <h1 
          className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white"
          style={{ fontFamily: 'Optima, sans-serif', fontWeight: 700 }}
        >
          Unlock Your Inner Genius
        </h1>
        <p 
          className="text-base md:text-lg leading-relaxed opacity-70"
          style={{ fontFamily: 'Avenir Next, sans-serif', fontWeight: 500, color: '#FAF8F1' }}
        >
          Explore a curated collection of teachings—videos, guided meditations, and essays—from our public offerings, along with a small taste of the exclusive content reserved for our Members Section.
        </p>
      </div>
    </div>
  </div>
);

/* ─────────── UI: login overlay ──── */
const LoginOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        aria-label="Close"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Optima, sans-serif' }}>
        Continue browsing our free library
      </h2>
      <p className="text-gray-600 mb-6" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
        Gain access to 500+ publications, exclusive content, and a free
        meditation course
      </p>

      <div className="space-y-3 mb-6">
        <a
          href="/login?provider=google"
          className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors"
          style={{ fontFamily: 'Avenir Next, sans-serif' }}
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064 5.963 5.963 0 014.23 1.74l2.694-2.689A9.99 9.99 0 0012.545 2.001a10.089 10.089 0 00-9.286 6.255 10.034 10.034 0 003.7 12.66 10.003 10.003 0 005.586 1.694c7.058 0 11.668-5.736 10.924-12.01l-10.924-.36z" />
          </svg>
          Sign in with Google
        </a>

        <a
          href="/login?provider=facebook"
          className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors"
          style={{ fontFamily: 'Avenir Next, sans-serif' }}
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.007 3H3.993A.993.993 0 003 3.993v16.014c0 .549.444.993.993.993h8.628v-6.961h-2.343v-2.813h2.343V9.312c0-2.325 1.42-3.591 3.494-3.591.993 0 1.847.073 2.096.106v2.43h-1.44c-1.125 0-1.345.532-1.345 1.315v1.723h2.689l-.35 2.813h-2.339V21h4.573a.993.993 0 00.993-.993V3.993A.993.993 0 0020.007 3z" />
          </svg>
          Sign in with Facebook
        </a>

        <a
          href="/login?provider=apple"
          className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors"
          style={{ fontFamily: 'Avenir Next, sans-serif' }}
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.45-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.47C2.79 15.22 3.51 7.89 8.42 7.56c1.57.05 2.62 1.06 3.54 1.1 1.35-.18 2.63-1.16 4.11-1.22.7.01 2.65.27 3.91 2.08-3.34 2.13-2.79 6.17.55 7.83-2.25 3.96-4.51 4.13-3.86 2.44.41-1.08 1.67-1.72 1.67-1.72-1.5-.92-1.82-3.32-1.29-4.79zM12.03 7.28c-.19-2.15 1.76-4 4.1-4.16.25 2.41-2.16 4.2-4.1 4.16z" />
          </svg>
          Sign in with Apple
        </a>
      </div>

      <div className="flex items-center justify-center my-4">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="px-4 text-gray-500 text-sm" style={{ fontFamily: 'Avenir Next, sans-serif' }}>OR</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      <a
        href="/signup"
        className="block text-center text-[#300001] font-medium hover:text-[#4a0002] transition-colors"
        style={{ fontFamily: 'Avenir Next, sans-serif' }}
      >
        Continue with email
      </a>
    </div>
  </div>
);

/* ─────────── UI: upgrade modal ──── */
const UpgradeMembershipModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        aria-label="Close"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Optima, sans-serif' }}>
        Upgrade to Gyani Membership
      </h2>
      <p className="text-gray-600 mb-6" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
        Unlock unlimited access to our complete library of 500+ teachings, advanced courses, and exclusive content with Gyani membership.
      </p>

      <div className="space-y-4 mb-6">
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span className="text-sm text-gray-700">Complete access to all teachings</span>
        </div>
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span className="text-sm text-gray-700">Advanced spiritual courses</span>
        </div>
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span className="text-sm text-gray-700">Exclusive member-only content</span>
        </div>
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span className="text-sm text-gray-700">Download teachings for offline access</span>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          style={{ fontFamily: 'Avenir Next, sans-serif' }}
        >
          Maybe Later
        </button>
        <a
          href="/membership/upgrade"
          className="flex-1 px-4 py-2 bg-[#300001] text-white rounded-md text-center hover:bg-[#4a0002] transition-colors"
          style={{ fontFamily: 'Avenir Next, sans-serif' }}
        >
          Upgrade Now
        </a>
      </div>
    </div>
  </div>
);

/* ─────────── UI: teaching card ──── */
const TeachingCard: React.FC<{
  teaching: Teaching;
  onBookmark: (id: string | number) => void;
  membershipLevel: 'anon' | 'free' | 'gyani';
  onUpgradePrompt: () => void;
}> = ({ teaching, onBookmark, membershipLevel, onUpgradePrompt }) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  useEffect(() => setMounted(true), []);

  const handleClick = () => {
    if (membershipLevel === 'anon') {
      // Anonymous users can only access teachings with preview tags
      if (teaching.type === 'free') {
        router.push(`/teachings/${teaching.slug}`);
      } else {
        setShowLoginPrompt(true);
      }
    } else if (membershipLevel === 'free') {
      // Free members
      if (teaching.type === 'membership') {
        onUpgradePrompt();
      } else {
        // Can access free (full) and extra_preview (with preview functionality)
        router.push(`/teachings/${teaching.slug}`);
      }
    } else {
      // Gyani members - access to everything
      router.push(`/teachings/${teaching.slug}`);
    }
  };

  // Get the appropriate badge configuration
  const getBadgeConfig = () => {
    if (teaching.type === 'free') {
      return {
        text: 'Free',
        className: 'bg-green-100 text-green-800',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        )
      };
    } else if (teaching.type === 'extra_preview') {
      return {
        text: 'Preview',
        className: 'bg-blue-100 text-blue-800',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
        )
      };
    } else {
      return {
        text: 'Membership',
        className: 'bg-yellow-100 text-yellow-800',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        )
      };
    }
  };

  const badgeConfig = getBadgeConfig();

  // Determine if the card should show a lock overlay
  const isLocked = (membershipLevel === 'anon' && teaching.type !== 'free') ||
                   (membershipLevel === 'free' && teaching.type === 'membership');

  return (
    <>
      <div className="rounded-lg overflow-hidden bg-white shadow-sm border border-gray-200 h-full relative">
        <div className="relative aspect-video bg-gray-200">
          {mounted && (
            <Image
              src={teaching.imageUrl || '/placeholder-video.jpg'}
              alt={teaching.title}
              fill
              className="object-cover cursor-pointer"
              unoptimized
              onClick={handleClick}
            />
          )}

          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handleClick}
              className="w-16 h-16 rounded-full bg-white bg-opacity-90 flex items-center justify-center shadow-lg hover:bg-opacity-100 transition-all"
              disabled={isLocked && membershipLevel === 'anon'}
            >
              {isLocked ? (
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-[#300001] ml-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Lock overlay for restricted content */}
          {isLocked && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="text-white text-center">
                <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-xs">
                  {membershipLevel === 'anon' ? 'Sign in to access' : 'Upgrade to access'}
                </p>
              </div>
            </div>
          )}

          <div className="absolute top-3 left-3">
            <span 
              className={`px-3 py-1 rounded-md text-xs font-medium flex items-center ${badgeConfig.className}`}
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              {badgeConfig.icon}
              {badgeConfig.text}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookmark(teaching.id);
            }}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white bg-opacity-90 shadow-lg flex items-center justify-center hover:bg-opacity-100 transition-all"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between text-gray-500 text-sm mb-3" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span>{teaching.duration}</span>
            </div>
            <span className="text-xs">{teaching.date}</span>
          </div>

          <h3 
            className="text-lg font-medium mb-2 line-clamp-2 text-[#300001]"
            style={{ fontFamily: 'Avenir Next, sans-serif' }}
          >
            {teaching.title}
          </h3>
          <p 
            className="text-sm text-gray-600 line-clamp-3"
            style={{ fontFamily: 'Avenir Next, sans-serif' }}
          >
            {teaching.description}
          </p>
        </div>
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && membershipLevel === 'anon' && (
        <LoginOverlay onClose={() => setShowLoginPrompt(false)} />
      )}
    </>
  );
};

/* ─────────── main component ─────── */
const TeachingLibraryPage: React.FC<TeachingLibraryPageProps> = ({ initialTeachings }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Debug logging for session
  useEffect(() => {
    console.log('Session status:', status);
    console.log('Session data:', session);
    console.log('User membership:', session?.user?.membership);
  }, [session, status]);
  
  const membershipLevel = getMembershipLevel(session);

  const [activeFilter, setActiveFilter] = useState<(typeof contentTypes)[number]>('Teachings');
  const [bookmarks, setBookmarks] = useState<(string | number)[]>([]);
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [teachings, setTeachings] = useState<Teaching[]>(sortTeachingsByDate(initialTeachings));
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [categoryPages, setCategoryPages] = useState<Record<string, number>>({
    'Teachings': 1,
    'Guided Meditations': 1,
    'Q&A with Shunyamurti': 1,
    'Essay': 1,
  });

  // Get featured teaching based on membership level
  const featured = useMemo(() => {
    if (membershipLevel === 'anon') {
      // Anonymous users see preview teachings first
      const previewTeachings = teachings.filter(t => t.type === 'free');
      if (previewTeachings.length > 0) {
        return previewTeachings[0];
      }
    } else if (membershipLevel === 'free') {
      // Free members see preview first, then extra_preview
      const previewTeachings = teachings.filter(t => t.type === 'free');
      if (previewTeachings.length > 0) {
        return previewTeachings[0];
      }
      const extraPreviewTeachings = teachings.filter(t => t.type === 'extra_preview');
      if (extraPreviewTeachings.length > 0) {
        return extraPreviewTeachings[0];
      }
    }
    // Gyani members or fallback - get the latest teaching
    return teachings[0];
  }, [teachings, membershipLevel]);

  // Filter teachings by selected content type and membership level
  const visible = useMemo(() => {
    let filteredTeachings;
    
    if (membershipLevel === 'anon') {
      // Anonymous users: 3 preview + 6 membership = 9 total
      const categoryTeachings = teachings.filter(t => t.contentType === activeFilter);
      const previewTeachings = categoryTeachings.filter(t => t.type === 'free').slice(0, 3);
      const membershipTeachings = categoryTeachings.filter(t => t.type === 'membership').slice(0, 6);
      filteredTeachings = [...previewTeachings, ...membershipTeachings];
      
    } else if (membershipLevel === 'free') {
      // Free members: 3 preview + 3 extra_preview + remaining membership
      const categoryTeachings = teachings.filter(t => t.contentType === activeFilter);
      const previewTeachings = categoryTeachings.filter(t => t.type === 'free').slice(0, 3);
      const extraPreviewTeachings = categoryTeachings.filter(t => t.type === 'extra_preview').slice(0, 3);
      const membershipTeachings = categoryTeachings.filter(t => t.type === 'membership').slice(0, 20);
      
      // Order: preview first, then extra_preview, then membership
      filteredTeachings = [...previewTeachings, ...extraPreviewTeachings, ...membershipTeachings];
      
    } else if (membershipLevel === 'gyani') {
      // Gyani members: access to everything
      filteredTeachings = teachings.filter(t => t.contentType === activeFilter);
      filteredTeachings = sortTeachingsByDate(filteredTeachings);
    } else {
      // Fallback
      filteredTeachings = teachings.filter(t => t.contentType === activeFilter);
    }
    
    console.log(`Filtering by ${activeFilter} (membership: ${membershipLevel}):`, filteredTeachings.length, 'results');
    
    if (membershipLevel === 'free') {
      const preview = filteredTeachings.filter(t => t.type === 'free');
      const extraPreview = filteredTeachings.filter(t => t.type === 'extra_preview');
      const membership = filteredTeachings.filter(t => t.type === 'membership');
      console.log(`Free member view: ${preview.length} preview + ${extraPreview.length} extra_preview + ${membership.length} membership`);
    }
    
    return filteredTeachings;
  }, [teachings, activeFilter, membershipLevel]);

  // Load more teachings for current category (only for Gyani members)
  const loadMoreTeachings = async () => {
    if (isLoading || !hasMore || membershipLevel !== 'gyani') return;

    setIsLoading(true);
    try {
      const strapiContentType = contentTypeToStrapiMap[activeFilter];
      const currentPage = categoryPages[activeFilter];
      const nextPage = currentPage + 1;
      
      const response = await teachingsApi.getTeachings(
        nextPage,
        15,
        { contenttype: strapiContentType },
        'publishDate:desc'
      );
      
      if (!response.data || response.data.length === 0) {
        setHasMore(false);
      } else {
        const transformedTeachings = response.data.map(transformStrapiTeachingForUI);
        setTeachings(prev => {
          const existingIds = new Set(prev.map(t => t.id));
          const newTeachings = transformedTeachings.filter(t => !existingIds.has(t.id));
          return sortTeachingsByDate([...prev, ...newTeachings]);
        });
        
        setCategoryPages(prev => ({
          ...prev,
          [activeFilter]: nextPage
        }));

        if (response.meta?.pagination) {
          const { page, pageCount } = response.meta.pagination;
          if (page >= pageCount) {
            setHasMore(false);
          }
        }
      }
    } catch (error) {
      console.error('Error loading more teachings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = async (newFilter: typeof activeFilter) => {
    if (newFilter === activeFilter) return;
    
    setActiveFilter(newFilter);
    setHasMore(membershipLevel === 'gyani'); // Only Gyani members can load more
    
    const currentPage = categoryPages[newFilter];
    const existingTeachingsForCategory = teachings.filter(t => t.contentType === newFilter);
    
    if (membershipLevel === 'gyani' && currentPage === 1 && existingTeachingsForCategory.length >= 15) {
      setHasMore(true);
    } else if (currentPage === 1 && existingTeachingsForCategory.length < 15) {
      setHasMore(false);
    }
  };

  const toggleBookmark = (id: string | number) => {
    if (!id) return;
    if (membershipLevel !== 'anon') {
      setBookmarks((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } else {
      setShowLoginOverlay(true);
    }
  };

  return (
    <div className="bg-[#FAF8F1] min-h-screen pb-20">
      <LibraryHero />

      <div className="container mx-auto px-4">
        {/* Latest / featured */}
        {featured && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 
                className="text-3xl font-bold text-[#300001]"
                style={{ fontFamily: 'Optima, sans-serif', fontWeight: 700 }}
              >
                Latest Teaching
              </h2>
              <Link
                href="/teachings"
                className="bg-[#300001] text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-[#4a0002] transition-colors"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                View all
              </Link>
            </div>
            <div className="mb-16">
              <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row min-h-80">
                  {/* Left side - Image */}
                  <div className="md:w-1/2 relative">
                    <div className="relative h-80 md:h-full bg-gray-200">
                      <Image
                        src={featured.imageUrl || '/placeholder-video.jpg'}
                        alt={featured.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      
                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button
                          onClick={() => {
                            if (membershipLevel === 'anon' && featured.type !== 'free') {
                              setShowLoginOverlay(true);
                            } else if (membershipLevel === 'free' && featured.type === 'membership') {
                              setShowUpgradeModal(true);
                            } else {
                              router.push(`/teachings/${featured.slug}`);
                            }
                          }}
                          className="w-20 h-20 rounded-full bg-white bg-opacity-90 flex items-center justify-center shadow-lg hover:bg-opacity-100 transition-all"
                        >
                          <svg
                            className="w-10 h-10 text-[#300001] ml-1"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </button>
                      </div>

                      {/* Type badge */}
                      <div className="absolute top-4 left-4">
                        <span 
                          className={`px-3 py-1 rounded-md text-xs font-medium flex items-center ${
                            featured.type === 'free' 
                              ? 'bg-green-100 text-green-800' 
                              : featured.type === 'extra_preview'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                          style={{ fontFamily: 'Avenir Next, sans-serif' }}
                        >
                          {featured.type === 'free' ? 'Free' : featured.type === 'extra_preview' ? 'Preview' : 'Membership'}
                        </span>
                      </div>

                      {/* Bookmark button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(featured.id);
                        }}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white bg-opacity-90 shadow-lg flex items-center justify-center hover:bg-opacity-100 transition-all"
                      >
                        <svg
                          className="w-5 h-5 text-gray-600"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Right side - Content */}
                  <div className="md:w-1/2 p-6 flex flex-col">
                    <div className="flex-1">
                      {/* Date */}
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm mb-4">
                        <span style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                          {featured.date}
                        </span>
                      </div>

                      {/* Duration */}
                      <div className="flex items-center text-gray-500 text-sm mb-3" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                        <svg
                          className="w-4 h-4 mr-2"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        <span>Duration: {featured.duration}</span>
                      </div>

                      {/* Title */}
                      <h3 
                        className="text-xl font-medium mb-3 text-[#300001] leading-tight"
                        style={{ fontFamily: 'Avenir Next, sans-serif' }}
                      >
                        {featured.title}
                      </h3>

                      {/* Description */}
                      <p 
                        className="text-gray-600 text-sm leading-relaxed"
                        style={{ fontFamily: 'Avenir Next, sans-serif' }}
                      >
                        {featured.description}
                      </p>
                    </div>

                    {/* View button */}
                    <div className="flex justify-end mt-4 pt-4">
                      <button
                        onClick={() => {
                          if (membershipLevel === 'anon' && featured.type !== 'free') {
                            setShowLoginOverlay(true);
                          } else if (membershipLevel === 'free' && featured.type === 'membership') {
                            setShowUpgradeModal(true);
                          } else {
                            router.push(`/teachings/${featured.slug}`);
                          }
                        }}
                        className="bg-[#300001] text-white px-8 py-3 rounded-md text-sm font-medium hover:bg-[#4a0002] transition-colors"
                        style={{ fontFamily: 'Avenir Next, sans-serif' }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-300 mb-8">
          <div className="flex overflow-x-auto">
            {contentTypes.map((ct) => (
              <button
                key={ct}
                onClick={() => handleFilterChange(ct)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeFilter === ct
                    ? 'text-[#300001] border-[#300001]'
                    : 'text-gray-600 hover:text-[#300001] border-transparent'
                }`}
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                {ct}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="relative mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visible.map((t) => (
              <TeachingCard
                key={t.slug}
                teaching={t}
                onBookmark={toggleBookmark}
                membershipLevel={membershipLevel}
                onUpgradePrompt={() => setShowUpgradeModal(true)}
              />
            ))}

            {visible.length === 0 && !isLoading && (
              <p 
                className="col-span-full text-center text-gray-600 py-12"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                No teachings in this category yet.
              </p>
            )}
          </div>
        </div>

        {/* Load More Button - Only for Gyani members */}
        {visible.length > 0 && hasMore && membershipLevel === 'gyani' && (
          <div className="text-center mb-16">
            <button
              onClick={loadMoreTeachings}
              disabled={isLoading}
              className="bg-[#300001] text-white px-8 py-3 rounded-md text-sm font-medium hover:bg-[#4a0002] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                `Load More ${activeFilter}`
              )}
            </button>
          </div>
        )}

        {/* Sign up content - positioned below the grid for anonymous users */}
        {membershipLevel === 'anon' && visible.length > 0 && (
          <div className="text-center max-w-2xl mx-auto px-4 mb-16">
            <h2 
              className="text-3xl font-bold mb-4 text-[#300001]"
              style={{ fontFamily: 'Optima, sans-serif', fontWeight: 700 }}
            >
              Continue Browsing—Sign Up for Your Free Dashboard
            </h2>
            <p 
              className="text-gray-600 mb-8"
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              Create your free account to continue browsing the library and access exclusive teachings, 500+ publications, and a complimentary meditation course—all from your personal dashboard.
            </p>

            <div className="space-y-4 max-w-md mx-auto">
              <a
                href="/login?provider=google"
                className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064 5.963 5.963 0 014.23 1.74l2.694-2.689A9.99 9.99 0 0012.545 2.001a10.089 10.089 0 00-9.286 6.255 10.034 10.034 0 003.7 12.66 10.003 10.003 0 005.586 1.694c7.058 0 11.668-5.736 10.924-12.01l-10.924-.36z" />
                </svg>
                Sign in with Google
              </a>

              <a
                href="/login?provider=facebook"
                className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.007 3H3.993A.993.993 0 003 3.993v16.014c0 .549.444.993.993.993h8.628v-6.961h-2.343v-2.813h2.343V9.312c0-2.325 1.42-3.591 3.494-3.591.993 0 1.847.073 2.096.106v2.43h-1.44c-1.125 0-1.345.532-1.345 1.315v1.723h2.689l-.35 2.813h-2.339V21h4.573a.993.993 0 00.993-.993V3.993A.993.993 0 0020.007 3z" />
                </svg>
                Sign in with Facebook
              </a>

              <a
                href="/login?provider=apple"
                className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.45-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.47C2.79 15.22 3.51 7.89 8.42 7.56c1.57.05 2.62 1.06 3.54 1.1 1.35-.18 2.63-1.16 4.11-1.22.7.01 2.65.27 3.91 2.08-3.34 2.13-2.79 6.17.55 7.83-2.25 3.96-4.51 4.13-3.86 2.44.41-1.08 1.67-1.72 1.67-1.72-1.5-.92-1.82-3.32-1.29-4.79zM12.03 7.28c-.19-2.15 1.76-4 4.1-4.16.25 2.41-2.16 4.2-4.1 4.16z" />
                </svg>
                Sign in with Apple
              </a>

              <div className="flex items-center justify-center my-4">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="px-4 text-gray-500 text-sm" style={{ fontFamily: 'Avenir Next, sans-serif' }}>OR</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <a
                href="/signup"
                className="block text-center text-[#300001] font-medium hover:text-[#4a0002] transition-colors"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                Continue with email
              </a>
            </div>
          </div>
        )}

        {/* Upgrade CTA for free members */}
        {membershipLevel === 'free' && visible.length > 0 && (
          <div className="text-center max-w-2xl mx-auto px-4 mb-16">
            <h2 
              className="text-3xl font-bold mb-4 text-[#300001]"
              style={{ fontFamily: 'Optima, sans-serif', fontWeight: 700 }}
            >
              Unlock Complete Access with Gyani Membership
            </h2>
            <p 
              className="text-gray-600 mb-8"
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              Upgrade to Gyani membership to access our complete library of 500+ teachings, advanced courses, and exclusive content without any restrictions.
            </p>

            <button
              onClick={() => setShowUpgradeModal(true)}
              className="bg-[#300001] text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-[#4a0002] transition-colors"
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              Upgrade to Gyani
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showLoginOverlay && membershipLevel === 'anon' && (
        <LoginOverlay onClose={() => setShowLoginOverlay(false)} />
      )}

      {showUpgradeModal && membershipLevel === 'free' && (
        <UpgradeMembershipModal onClose={() => setShowUpgradeModal(false)} />
      )}
    </div>
  );
};

export default TeachingLibraryPage;