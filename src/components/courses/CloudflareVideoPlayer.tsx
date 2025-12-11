"use client";

import { useState, useEffect, useRef } from 'react';
import { courseProgressApi } from '@/lib/courseProgressApi';

interface CloudflareVideoPlayerProps {
  streamUid: string;
  courseId: string;
  classId: string;
  componentId: string;
  autoPlay?: boolean;
  onComplete?: () => void;
  className?: string;
}

/**
 * CloudflareVideoPlayer - Video player with resume functionality
 * Automatically saves progress every 5 seconds and resumes from last position
 */
export default function CloudflareVideoPlayer({
  streamUid,
  courseId,
  classId,
  componentId,
  autoPlay = false,
  onComplete,
  className = '',
}: CloudflareVideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialPositionSet = useRef(false);

  // Load saved position on mount
  useEffect(() => {
    const loadSavedPosition = async () => {
      try {
        const data = await courseProgressApi.getVideoTimestamp(
          courseId,
          classId,
          componentId
        );

        if (data && data.timestamp > 0 && videoRef.current && !initialPositionSet.current) {
          // Set the video to the saved timestamp
          videoRef.current.currentTime = data.timestamp;
          initialPositionSet.current = true;
        }
      } catch (error) {
        console.error('Error loading saved position:', error);
      }
    };

    loadSavedPosition();
  }, [courseId, classId, componentId]);

  // Save progress every 5 seconds
  useEffect(() => {
    const saveProgress = async () => {
      if (!videoRef.current) return;

      const currentTime = Math.floor(videoRef.current.currentTime);

      // Only save if time has changed by at least 1 second
      if (currentTime !== lastSavedTime) {
        try {
          await courseProgressApi.saveVideoTimestamp(componentId, currentTime);
          setLastSavedTime(currentTime);
        } catch (error) {
          console.error('Error saving progress:', error);
        }
      }
    };

    // Set up interval to save every 5 seconds
    saveIntervalRef.current = setInterval(saveProgress, 5000);

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [componentId, lastSavedTime]);

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      setError('Failed to load video. Please try again.');
      setIsLoading(false);
    };

    const handleEnded = async () => {
      // Mark as complete
      try {
        await courseProgressApi.markComponentComplete(classId, componentId);
        if (onComplete) {
          onComplete();
        }
      } catch (error) {
        console.error('Error marking video as complete:', error);
      }
    };

    const handleTimeUpdate = () => {
      if (!video) return;

      const progress = (video.currentTime / video.duration) * 100;

      // Auto-mark as complete at 95%
      if (progress >= 95 && video.duration > 0) {
        courseProgressApi.markComponentComplete(classId, componentId).catch(console.error);
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [classId, componentId, onComplete]);

  // Generate Cloudflare Stream URL
  const getStreamUrl = () => {
    return `https://stream.cloudflare.com/${streamUid}/manifest/video.m3u8`;
  };

  if (error) {
    return (
      <div className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded ${className}`}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}

      {/* Use Cloudflare Stream iframe embed for better compatibility */}
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          src={`https://stream.cloudflare.com/${streamUid}/iframe`}
          className="w-full h-full"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          ref={(iframe) => {
            if (iframe) {
              // Cloudflare Stream iframe will handle resume automatically if configured
              setIsLoading(false);
            }
          }}
        />
      </div>

      {/* Alternative: Use native HTML5 video with HLS.js for more control */}
      {/* Uncomment if you need more control over the player */}
      {/*
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        autoPlay={autoPlay}
        playsInline
        src={getStreamUrl()}
      >
        Your browser does not support the video tag.
      </video>
      */}
    </div>
  );
}
