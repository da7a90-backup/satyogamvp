'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import VideoPlayer from '@/components/videoPlayer/VideoPlayer';

import { teachings as dump } from '@/lib/json_dump';
import type { Teaching } from '@/lib/types';

interface Props {
  params: { slug: string };
}

const TeachingDetailPage: React.FC<Props> = ({ params }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);

  useEffect(() => setMounted(true), []);

  /* ───── find the requested post ───── */
  const teaching = dump.find((t) => t.slug === params.slug) as Teaching | undefined;

  if (!teaching) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl text-red-600 mb-6">Teaching not found.</p>
        <button onClick={() => router.back()} className="px-4 py-2 bg-gray-800 text-white rounded-md">
          Go back
        </button>
      </div>
    );
  }

  const requiresAuth = teaching.type === 'membership';

  /* ───── helpers to render media blocks ───── */
  const renderVideo = () => {
    if (teaching.videoPlatform === 'none' || !teaching.videoId) return null;

    if (teaching.videoPlatform === 'cloudflare') {
      return (
        <VideoPlayer
          videoId={teaching.videoId}
          isFreePreview={teaching.type === 'free'}
          previewDuration={60}
        />
      );
    }

    const src =
      teaching.videoPlatform === 'youtube'
        ? `https://www.youtube.com/embed/${teaching.videoId}`
        : teaching.videoPlatform === 'rumble'
        ? `https://rumble.com/embed/${teaching.videoId}/`
        : teaching?.videoUrl; // fallback

    return (
      <iframe
        className="w-full aspect-video"
        src={src || ""}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  };

  const renderAudio = () =>
    teaching.audioUrl && (
      <audio className="w-full my-6" controls src={teaching.audioUrl}>
        Your browser does not support the audio element.
      </audio>
    );

  /* ───── UI starts here ───── */
  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* breadcrumbs */}
        <div className="flex items-center text-sm text-gray-600 mb-6">
          <Link href="/teachings" className="hover:text-gray-900">
            Teachings
          </Link>
          <svg
            className="w-4 h-4 mx-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
          <span className="font-medium text-gray-900">{teaching.title}</span>
        </div>

        {/* membership gate */}
        {requiresAuth && !session ? (
          <div className="bg-gray-100 p-6 rounded-lg text-center">
            <h2 className="text-xl font-bold mb-2">Membership Required</h2>
            <p className="mb-6">
              This content is only available to members. Please log in or sign up to access it.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/login" className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700">
                Log In
              </Link>
              <Link href="/signup" className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                Sign Up
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* media */}
            {renderVideo()}
            {renderAudio()}

            {/* title & meta */}
            <div className="mt-6 mb-4">
              <div className="flex items-center text-gray-600 text-sm mb-2 gap-x-4">
                {teaching.date && <span>{teaching.date}</span>}
                {teaching.duration && (
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    {teaching.duration}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold mb-4">{teaching.title}</h1>

              <div className="prose max-w-none">
                {teaching.summary && <p>{teaching.summary}</p>}
                {!teaching.summary && teaching.description && <p>{teaching.description}</p>}

                {/* simple text body for essays or text posts */}
                {Array.isArray(teaching.content) && teaching.content.length > 0 && (
                  <div className="space-y-4">
                    {teaching.content.map((block: any, i: number) => (
                      <p key={i}>{block}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* free-preview overlay handled inside <VideoPlayer> */}
      {showLoginOverlay && !session && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowLoginOverlay(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl font-bold mb-4">Preview Ended</h2>
            <p className="text-gray-600 mb-6">
              Sign up for a free account or log in to continue watching this teaching and access our entire
              library.
            </p>

            <div className="space-y-3 mb-6">
              <a
                href="/login?provider=google"
                className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064 5.963 5.963 0 014.23 1.74l2.694-2.689A9.99 9.99 0 0012.545 2.001a10.089 10.089 0 00-9.286 6.255 10.034 10.034 0 003.7 12.66 10.003 10.003 0 005.586 1.694c7.058 0 11.668-5.736 10.924-12.01l-10.924-.36z" />
                </svg>
                Sign in with Google
              </a>
              {/* replicate FB / Apple / email links if you want */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachingDetailPage;
