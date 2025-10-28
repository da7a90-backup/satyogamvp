'use client';

import React, { useState, useRef, useEffect } from 'react';

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  imageUrl?: string;
  isLoggedIn: boolean;
  isPreviewMode: boolean;
  previewDuration: number; // in seconds
  onPreviewEnd: () => void;
  isDashboard?: boolean; // if true, use dash_preview_duration logic
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  title,
  imageUrl,
  isLoggedIn,
  isPreviewMode,
  previewDuration,
  onPreviewEnd,
  isDashboard = false,
}) => {
  const [previewEnded, setPreviewEnded] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<HTMLIFrameElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Start tracking playback time when playing
  useEffect(() => {
    if (isPlaying && isPreviewMode && !previewEnded) {
      intervalRef.current = setInterval(() => {
        setPlaybackTime((prev) => {
          const newTime = prev + 1;

          // Check if preview duration reached
          if (newTime >= previewDuration) {
            handlePreviewEnd();
            return prev;
          }

          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, isPreviewMode, previewEnded, previewDuration]);

  const handlePreviewEnd = () => {
    setPreviewEnded(true);
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    onPreviewEnd();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // If preview has ended, show overlay
  if (previewEnded && isPreviewMode) {
    return (
      <div className="relative w-full aspect-video bg-black flex items-center justify-center">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="relative z-10 text-center text-white p-8">
          <h3 className="text-2xl font-bold mb-4">Preview Ended</h3>
          <p className="text-lg mb-6">
            {isLoggedIn
              ? isDashboard
                ? "Upgrade your membership to continue watching"
                : "This preview has ended"
              : "Sign up or log in to continue watching"
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black">
      {/* YouTube iframe */}
      <iframe
        ref={playerRef}
        className="absolute inset-0 w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => setIsPlaying(true)}
      />

      {/* Preview progress overlay (only for preview mode) */}
      {isPreviewMode && !previewEnded && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-900/90 to-transparent p-4 z-10 pointer-events-none">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white text-sm font-medium">
              Preview: {formatTime(playbackTime)} / {formatTime(previewDuration)}
            </p>
          </div>
          <div className="w-full bg-blue-800/50 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min((playbackTime / previewDuration) * 100, 100)}%`
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubePlayer;
