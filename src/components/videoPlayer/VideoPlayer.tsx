'use client'

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// Define interface for props
interface VideoPlayerProps {
  videoId: string;
  isFreePreview?: boolean;
  previewDuration?: number; // in seconds
}

/**
 * Video Player Component with preview limit functionality
 */
const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoId, 
  isFreePreview = false,
  previewDuration = 60, // 1 minute in seconds
}) => {
  const { data: session } = useSession();
  const [showPreviewEnd, setShowPreviewEnd] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);
  
  // Fix hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // For free preview videos, show login overlay after specified duration
  useEffect(() => {
    if (!isClient || !isFreePreview || session) return;
    
    // Set a timer to eject the iframe and show login overlay after previewDuration
    const timer = setTimeout(() => {
      setShowPreviewEnd(true);
    }, previewDuration * 1000);
    
    // Clear the timer on unmount
    return () => clearTimeout(timer);
  }, [isClient, isFreePreview, session, previewDuration]);

  // If not client-side yet, show loading placeholder
  if (!isClient) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading video player...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black">
      {/* Show iframe only if preview hasn't ended OR user is logged in */}
      {(!showPreviewEnd || session) && (
        <iframe
          className="w-full h-full"
          src={`https://iframe.cloudflarestream.com/${videoId}?loop=false&autoplay=true&muted=false&preload=true&controls=true`}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ border: 'none' }}
        ></iframe>
      )}

      {/* Show login overlay when preview ends and user is not logged in */}
      {showPreviewEnd && !session && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 bg-black bg-opacity-90">
          {/* Main content container - matching your design */}
          <div className="bg-white rounded-lg max-w-md w-full p-8 text-black text-center">
            <h2 className="text-2xl font-bold text-black mb-4">
              Continue browsing our free library
            </h2>
            <p className="text-gray-600 mb-6">
              Gain access to 500+ publications, exclusive content, and a free meditation course
            </p>
            
            {/* Social login buttons */}
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
              
              <a 
                href="/login?provider=facebook" 
                className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.007 3H3.993A.993.993 0 003 3.993v16.014c0 .549.444.993.993.993h8.628v-6.961h-2.343v-2.813h2.343V9.312c0-2.325 1.42-3.591 3.494-3.591.993 0 1.847.073 2.096.106v2.43h-1.44c-1.125 0-1.345.532-1.345 1.315v1.723h2.689l-.35 2.813h-2.339V21h4.573a.993.993 0 00.993-.993V3.993A.993.993 0 0020.007 3z" />
                </svg>
                Sign in with Facebook
              </a>
              
              <a 
                href="/login?provider=apple" 
                className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.45-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.47C2.79 15.22 3.51 7.89 8.42 7.56c1.57.05 2.62 1.06 3.54 1.1 1.35-.18 2.63-1.16 4.11-1.22.7.01 2.65.27 3.91 2.08-3.34 2.13-2.79 6.17.55 7.83-2.25 3.96-4.51 4.13-3.86 2.44.41-1.08 1.67-1.72 1.67-1.72-1.5-.92-1.82-3.32-1.29-4.79zM12.03 7.28c-.19-2.15 1.76-4 4.1-4.16.25 2.41-2.16 4.2-4.1 4.16z" />
                </svg>
                Sign in with Apple
              </a>
            </div>
            
            {/* OR divider */}
            <div className="flex items-center justify-center my-4">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="px-4 text-gray-500 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
            
            {/* Email signup link */}
            <a 
              href="/signup" 
              className="block text-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
            >
              Continue with email
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;