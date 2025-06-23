'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { teachings as dump } from '@/lib/json_dump';
import type { Teaching } from '@/lib/types';

/* ─────────── constants ─────────── */
const contentTypes = [
  'Teachings',
  'Guided Meditations',
  'Q&A with Shunyamurti',
  'Essay',
] as const;

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

/* ─────────── UI: teaching card ──── */
const TeachingCard: React.FC<{
  teaching: Teaching;
  onBookmark: (id: string | null) => void;
}> = ({ teaching, onBookmark }) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const open = () => router.push(`/teachings/${teaching.slug}`);

  return (
    <div className="rounded-lg overflow-hidden bg-white shadow-sm border border-gray-200 h-full">
      <div className="relative aspect-video bg-gray-200">
        {mounted && (
          <Image
            src={teaching.imageUrl || '/placeholder-video.jpg'}
            alt={teaching.title}
            fill
            className="object-cover cursor-pointer"
            unoptimized
            onClick={open}
          />
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={open}
            className="w-16 h-16 rounded-full bg-white bg-opacity-90 flex items-center justify-center shadow-lg hover:bg-opacity-100 transition-all"
          >
            <svg
              className="w-8 h-8 text-[#300001] ml-1"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>

        <div className="absolute top-3 left-3">
          <span 
            className={`px-3 py-1 rounded-md text-xs font-medium ${
              teaching.type === 'free' 
                ? 'bg-white text-[#300001]' 
                : 'bg-[#300001] text-white'
            }`}
            style={{ fontFamily: 'Avenir Next, sans-serif' }}
          >
            {teaching.type === 'free' ? 'Free' : 'Membership'}
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
          <span>{teaching.duration}</span>
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
  );
};

/* ─────────── main component ─────── */
const TeachingLibraryPage: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const [activeFilter, setActiveFilter] =
    useState<(typeof contentTypes)[number]>('Teachings');
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);

  /* The local dump never changes, so memo is fine */
  const featured = dump[0];
  const visible = useMemo(
    () => dump.filter((t) => t.contentType === activeFilter),
    [activeFilter]
  );

  const toggleBookmark = (id: string | null) => {
    if (!id) return;
    if (session) {
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
                          onClick={() => router.push(`/teachings/${featured.slug}`)}
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
                          className={`px-3 py-1 rounded-md text-xs font-medium ${
                            featured.type === 'free' 
                              ? 'bg-white text-[#300001]' 
                              : 'bg-[#300001] text-white'
                          }`}
                          style={{ fontFamily: 'Avenir Next, sans-serif' }}
                        >
                          {featured.type === 'free' ? 'Free' : 'Membership'}
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
                      {/* Date - fallback if no publishedDate */}
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm mb-4">
                        <span style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                          {featured.date 
                            ? new Date(featured.date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })
                            : 'Nov 26, 2024'
                          }
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
                        onClick={() => router.push(`/teachings/${featured.slug}`)}
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
                onClick={() => setActiveFilter(ct)}
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
        <div className="relative mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(session ? visible : visible.slice(0, 9)).map((t) => (
              <TeachingCard
                key={t.slug}
                teaching={t}
                onBookmark={toggleBookmark}
              />
            ))}

            {visible.length === 0 && (
              <p 
                className="col-span-full text-center text-gray-600 py-12"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                No teachings in this category yet.
              </p>
            )}
          </div>
          
          {/* Gradient overlay for non-logged-in users - only covers part of 3rd row */}
          {!session && visible.length > 0 && (
            <div 
              className="absolute inset-x-0 bottom-0 pointer-events-auto"
              style={{
                background: 'linear-gradient(to top, rgba(250, 248, 241, 0.3) 0%, rgba(250, 248, 241, 0.7) 50%, transparent 100%)',
                height: 'calc(20% + 0.5rem)' // Only covers bottom portion of 3rd row
              }}
            />
          )}
        </div>

        {/* Sign up content - positioned below the grid for non-logged-in users */}
        {!session && visible.length > 0 && (
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

        {/* Continue Browsing Section - only show for logged in users */}
        {session && (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <h2 
              className="text-3xl font-bold mb-4 text-[#300001]"
              style={{ fontFamily: 'Optima, sans-serif', fontWeight: 700 }}
            >
              Continue Browsing—Sign Up for Your Free Dashboard
            </h2>
            <p 
              className="text-gray-600 mb-8 max-w-2xl mx-auto"
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
      </div>

      {/* login overlay - only show for bookmark action when not logged in */}
      {showLoginOverlay && !session && (
        <LoginOverlay onClose={() => setShowLoginOverlay(false)} />
      )}
    </div>
  );
};

export default TeachingLibraryPage;