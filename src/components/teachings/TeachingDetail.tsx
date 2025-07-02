'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { teachingsApi, getStrapiMedia } from '@/lib/api';
import { VideoPreviewUtils } from '@/lib/videoUtils';

// Rich Text Renderer Component
const RichTextRenderer: React.FC<{ content: any }> = ({ content }) => {
  if (!content) return null;

  // Handle string content
  if (typeof content === 'string') {
    return (
      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-serif">
        {content}
      </div>
    );
  }

  // Handle rich text blocks (array format)
  if (Array.isArray(content)) {
    return (
      <div className="prose max-w-none">
        {content.map((block, index) => renderBlock(block, index))}
      </div>
    );
  }

  // Handle object format
  if (typeof content === 'object') {
    return (
      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-serif">
        {JSON.stringify(content, null, 2)}
      </div>
    );
  }

  return null;
};

// Helper function to render individual blocks
const renderBlock = (block: any, index: number) => {
  if (!block || !block.type) return null;

  switch (block.type) {
    case 'paragraph':
      return (
        <p key={index} className="mb-4 text-gray-700 leading-relaxed">
          {renderChildren(block.children)}
        </p>
      );
    
    case 'heading':
      const level = block.level || 2;
      const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
      return (
        <HeadingTag key={index} className={`font-bold mb-3 text-gray-900 ${
          level === 1 ? 'text-3xl' : 
          level === 2 ? 'text-2xl' : 
          level === 3 ? 'text-xl' : 
          'text-lg'
        }`}>
          {renderChildren(block.children)}
        </HeadingTag>
      );
    
    case 'list':
      const ListTag = block.format === 'ordered' ? 'ol' : 'ul';
      return (
        <ListTag key={index} className={`mb-4 ml-6 ${
          block.format === 'ordered' ? 'list-decimal' : 'list-disc'
        }`}>
          {block.children?.map((item: any, itemIndex: number) => (
            <li key={itemIndex} className="mb-1 text-gray-700">
              {renderChildren(item.children)}
            </li>
          ))}
        </ListTag>
      );
    
    case 'quote':
      return (
        <blockquote key={index} className="border-l-4 border-gray-300 pl-4 mb-4 italic text-gray-600">
          {renderChildren(block.children)}
        </blockquote>
      );
    
    case 'code':
      return (
        <pre key={index} className="bg-gray-100 p-4 rounded-lg mb-4 overflow-x-auto">
          <code className="text-sm font-mono">
            {renderChildren(block.children)}
          </code>
        </pre>
      );
    
    default:
      // For unknown block types, render as paragraph
      return (
        <p key={index} className="mb-4 text-gray-700 leading-relaxed">
          {renderChildren(block.children)}
        </p>
      );
  }
};

// Helper function to render children (inline elements)
const renderChildren = (children: any[]) => {
  if (!Array.isArray(children)) return null;

  return children.map((child, index) => {
    if (typeof child === 'string') {
      return child;
    }

    if (!child || typeof child !== 'object') {
      return null;
    }

    let text = child.text || '';
    
    // Apply formatting
    if (child.bold) {
      text = <strong key={index}>{text}</strong>;
    }
    if (child.italic) {
      text = <em key={index}>{text}</em>;
    }
    if (child.underline) {
      text = <u key={index}>{text}</u>;
    }
    if (child.strikethrough) {
      text = <s key={index}>{text}</s>;
    }
    if (child.code) {
      text = <code key={index} className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{text}</code>;
    }

    // Handle links
    if (child.type === 'link') {
      return (
        <a 
          key={index}
          href={child.url} 
          className="text-[#300001] hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {renderChildren(child.children)}
        </a>
      );
    }

    return <span key={index}>{text}</span>;
  });
};

interface Teaching {
  id: string | number;
  slug: string;
  title: string;
  description?: string;
  summary?: string;
  content?: any;
  duration?: string;
  type: string;
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

interface Comment {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
}

interface TeachingDetailProps {
  teaching: Teaching;
  relatedTeachings?: Teaching[];
}


// Preview Ended Modal Component
const PreviewEndedModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
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
        Preview Ended
      </h2>
      <p className="text-gray-600 mb-6" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
        Create your free account to continue watching this teaching and access our complete library of 500+ publications and exclusive content.
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

// Login Required Modal Component for Related Videos
const LoginRequiredModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
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

      <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
      <p className="text-gray-600 mb-6">
        Create your free account to watch this video and access our complete library of 500+ teachings, publications, and exclusive content.
      </p>

      <div className="space-y-3 mb-6">
        <a href="/login?provider=google" className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors">
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064 5.963 5.963 0 014.23 1.74l2.694-2.689A9.99 9.99 0 0012.545 2.001a10.089 10.089 0 00-9.286 6.255 10.034 10.034 0 003.7 12.66 10.003 10.003 0 005.586 1.694c7.058 0 11.668-5.736 10.924-12.01l-10.924-.36z" />
          </svg>
          Sign in with Google
        </a>

        <a href="/login?provider=facebook" className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors">
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.007 3H3.993A.993.993 0 003 3.993v16.014c0 .549.444.993.993.993h8.628v-6.961h-2.343v-2.813h2.343V9.312c0-2.325 1.42-3.591 3.494-3.591.993 0 1.847.073 2.096.106v2.43h-1.44c-1.125 0-1.345.532-1.345 1.315v1.723h2.689l-.35 2.813h-2.339V21h4.573a.993.993 0 00.993-.993V3.993A.993.993 0 0020.007 3z" />
          </svg>
          Sign in with Facebook
        </a>

        <a href="/login?provider=apple" className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors">
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.45-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.47C2.79 15.22 3.51 7.89 8.42 7.56c1.57.05 2.62 1.06 3.54 1.1 1.35-.18 2.63-1.16 4.11-1.22.7.01 2.65.27 3.91 2.08-3.34 2.13-2.79 6.17.55 7.83-2.25 3.96-4.51 4.13-3.86 2.44.41-1.08 1.67-1.72 1.67-1.72-1.5-.92-1.82-3.32-1.29-4.79zM12.03 7.28c-.19-2.15 1.76-4 4.1-4.16.25 2.41-2.16 4.2-4.1 4.16z" />
          </svg>
          Sign in with Apple
        </a>
      </div>

      <div className="flex items-center justify-center my-4">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="px-4 text-gray-500 text-sm">OR</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      <a href="/signup" className="block text-center text-[#300001] font-medium hover:text-[#4a0002] transition-colors">
        Continue with email
      </a>
    </div>
  </div>
);

// Audio Player Component with Preview Functionality
// Podbean Widget API types
declare global {
  interface Window {
    PB: any;
  }
}

interface PBWidget {
  bind(eventName: string, listener: (data: any) => void): void;
  unbind(eventName: string): void;
  play(): void;
  pause(): void;
  toggle(): void;
  seekTo(milliseconds: number): void;
  setVolume(volume: number): void;
  getPosition(callback: (position: number) => void): void;
  getDuration(callback: (duration: number) => void): void;
  isPaused(callback: (paused: boolean) => void): void;
}

// Audio Player Component with Enhanced Preview Functionality
// Audio Player Component with Enhanced Preview Functionality
const AudioPlayer: React.FC<{ 
  audioUrl: string; 
  title: string; 
  duration?: string; 
  audioPlatform: string;
  isLoggedIn: boolean;
  previewDuration: number;
  onPreviewEnd: () => void;
}> = ({ 
  audioUrl, 
  title, 
  duration,
  audioPlatform = 'podbean',
  isLoggedIn,
  previewDuration,
  onPreviewEnd
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const originalSrcRef = useRef<string>('');
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioError, setAudioError] = useState(false);
  const [previewEnded, setPreviewEnded] = useState(false);
  const [showPreviewOverlay, setShowPreviewOverlay] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const isPreviewContent = !isLoggedIn && previewDuration > 0;

  // Debug logging function
  const addDebugLog = (message: string) => {
    console.log(`[AudioPlayer Debug] ${message}`);
    setDebugLog(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Initialize start time and debug logging
  useEffect(() => {
    startTimeRef.current = Date.now();
    addDebugLog(`AudioPlayer initialized - Platform: ${audioPlatform}, Preview: ${isPreviewContent}, Duration: ${previewDuration}s`);
    
    if (audioPlatform === 'podbean') {
      addDebugLog('Using Podbean postMessage API for time tracking');
    } else {
      addDebugLog('Using timer fallback for time tracking');
    }
    
    return () => {
      clearPreviewTimer();
    };
  }, [audioPlatform, isPreviewContent, previewDuration]);

  // Extract Podbean ID from URL
  const extractPodbeanId = (url: string) => {
    // URL format: https://www.podbean.com/eu/pb-ueanj-18c9a40-pb
    const match = url.match(/pb-([^-]+)-([^-]+)-pb/);
    if (match) {
      return `${match[1]}-${match[2]}`;
    }
    // Alternative format: https://www.podbean.com/media/share/pb-{id}
    const altMatch = url.match(/pb-([a-z0-9\-]+)/);
    return altMatch ? altMatch[1] : null;
  };

  // Comprehensive audio stopping function
  const stopAudio = () => {
    addDebugLog('Executing comprehensive audio stop...');
    
    // Method 1: Try Podbean postMessage controls using their API format
    if (audioPlatform === 'podbean' && iframeRef.current) {
      try {
        // Use Podbean Widget API postMessage format
        const pauseMessage = {
          event: 'command',
          func: 'pause',
          args: []
        };
        
        iframeRef.current.contentWindow?.postMessage(pauseMessage, '*');
        addDebugLog('Podbean postMessage pause command sent');
        
        // Also try alternative formats as fallback
        const altMessages = [
          { type: 'pause' },
          { action: 'pause' },
          { command: 'pause' }
        ];
        
        altMessages.forEach((message, index) => {
          iframeRef.current?.contentWindow?.postMessage(message, '*');
          addDebugLog(`Podbean postMessage fallback ${index + 1} sent`);
        });
        
      } catch (error) {
        addDebugLog(`Podbean postMessage failed: ${error}`);
      }
    }
    
    // Method 2: Direct audio control
    if (audioRef.current) {
      audioRef.current.pause();
      addDebugLog('Direct audio paused');
    }
    
    // Method 3: Iframe src reset (most reliable)
    if (iframeRef.current) {
      try {
        iframeRef.current.src = 'about:blank';
        addDebugLog('Iframe src permanently reset to about:blank');
      } catch (error) {
        addDebugLog(`Iframe src reset failed: ${error}`);
      }
    }
    
    // Method 4: Show overlay
    setShowPreviewOverlay(true);
    addDebugLog('Preview overlay displayed');
    
    // Clear timer
    clearPreviewTimer();
  };

  // Handle preview end
  const handlePreviewEnd = () => {
    if (previewEnded) {
      addDebugLog('handlePreviewEnd called but preview already ended');
      return;
    }
    
    addDebugLog(`Preview ended after ${currentTime}s`);
    setPreviewEnded(true);
    setIsPlaying(false);
    
    // Immediately stop audio with all methods
    stopAudio();
    
    onPreviewEnd();
  };

  const clearPreviewTimer = () => {
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
  };

  // Podbean postMessage listener
  useEffect(() => {
    if (audioPlatform === 'podbean' && isPreviewContent) {
      addDebugLog('Setting up Podbean postMessage listener');
      
      const handleMessage = (event: MessageEvent) => {
        // Stop processing if preview already ended
        if (previewEnded) {
          return;
        }
        
        // Accept messages from Podbean iframe - they come from various origins
        if (event.origin.includes('podbean.com') || event.origin.includes('pbcdn')) {
          addDebugLog(`Podbean message received: ${JSON.stringify(event.data)}`);
          
          // Parse Podbean Widget API format
          if (typeof event.data === 'object' && event.data !== null) {
            const message = event.data;
            
            // Handle Podbean Widget Events format: {"event":"PB.Widget.Events.PLAY_PROGRESS","data":{...}}
            if (message.event && message.data) {
              const eventType = message.event;
              const eventData = message.data;
              
              // Process time updates from PLAY_PROGRESS and LOAD_PROGRESS events
              if (eventType === 'PB.Widget.Events.PLAY_PROGRESS' || 
                  eventType === 'PB.Widget.Events.LOAD_PROGRESS') {
                
                if (eventData.currentPosition !== undefined) {
                  const currentPos = eventData.currentPosition;
                  setCurrentTime(currentPos);
                  addDebugLog(`Time update: ${currentPos}s`);
                  
                  // Check preview limit
                  if (currentPos >= previewDuration && !previewEnded) {
                    addDebugLog(`Podbean preview limit reached: ${currentPos}s >= ${previewDuration}s`);
                    handlePreviewEnd();
                  }
                }
                
                // Update duration if available
                if (eventData.relativePosition && eventData.relativePosition > 0 && eventData.currentPosition) {
                  const calculatedDuration = eventData.currentPosition / eventData.relativePosition;
                  if (calculatedDuration > totalDuration) {
                    setTotalDuration(calculatedDuration);
                    addDebugLog(`Duration calculated: ${calculatedDuration}s`);
                  }
                }
              }
              
              // Handle play/pause events
              if (eventType === 'PB.Widget.Events.PLAY') {
                setIsPlaying(true);
                addDebugLog('Podbean play event detected');
              } else if (eventType === 'PB.Widget.Events.PAUSE') {
                setIsPlaying(false);
                addDebugLog('Podbean pause event detected');
              } else if (eventType === 'PB.Widget.Events.FINISH') {
                setIsPlaying(false);
                addDebugLog('Podbean finish event detected');
              }
            }
          }
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [audioPlatform, isPreviewContent, previewDuration, previewEnded, totalDuration]);

  // No timer fallback needed - we have reliable postMessage data from Podbean
  // Timer fallback only for non-Podbean platforms without postMessage support
  useEffect(() => {
    if (isPreviewContent && audioPlatform !== 'podbean') {
      addDebugLog(`Setting up timer fallback for ${audioPlatform} platform`);
      
      previewTimerRef.current = setInterval(() => {
        if (previewEnded) {
          clearPreviewTimer();
          return;
        }
        
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        
        // Only update if we don't have other time sources
        if (currentTime === 0) {
          setCurrentTime(elapsed);
        }
        
        if (elapsed >= previewDuration && !previewEnded) {
          addDebugLog(`Timer preview limit reached: ${elapsed}s`);
          handlePreviewEnd();
        }
      }, 1000);

      return () => clearPreviewTimer();
    }
  }, [isPreviewContent, audioPlatform, previewDuration, previewEnded, currentTime]);

  // Store original src for reset functionality
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.src) {
      originalSrcRef.current = iframeRef.current.src;
    }
  }, []);

  // Handle different audio platforms
  const getAudioConfig = (url: string, platform: string) => {
    switch (platform) {
      case 'podbean':
        const podbeanId = extractPodbeanId(url);
        return {
          type: 'embed',
          embedUrl: podbeanId ? `https://www.podbean.com/player-v2/?i=${podbeanId}&from=embed&square=1&share=1&download=1&rtl=0&fonts=Arial&skin=1&font-color=auto&logo_link=episode_page&btn-skin=7` : null,
          directUrl: null
        };
      case 'direct':
        return {
          type: 'direct',
          embedUrl: null,
          directUrl: url
        };
      default:
        return {
          type: 'direct',
          embedUrl: null,
          directUrl: url
        };
    }
  };

  const audioConfig = getAudioConfig(audioUrl, audioPlatform);

  // Direct audio file handling
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || audioConfig.type !== 'direct' || !audioConfig.directUrl) return;

    const updateTime = () => {
      const currentTime = audio.currentTime;
      setCurrentTime(currentTime);
      
      // Check preview limit for non-logged-in users
      if (isPreviewContent && currentTime >= previewDuration && !previewEnded) {
        audio.pause();
        setIsPlaying(false);
        handlePreviewEnd();
      }
    };
    
    const updateDuration = () => setTotalDuration(audio.duration);
    const handleError = () => {
      console.error('Audio loading error:', audio.error);
      setAudioError(true);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [audioConfig, isPreviewContent, previewDuration, previewEnded]);

  // Control functions for direct audio
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || audioConfig.type !== 'direct' || !audioConfig.directUrl) return;

    if (previewEnded && !isLoggedIn) {
      onPreviewEnd();
      return;
    }

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(error => {
        console.error('Audio play error:', error);
        setAudioError(true);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || audioConfig.type !== 'direct') return;

    const seekTime = (parseFloat(e.target.value) / 100) * totalDuration;
    
    // Prevent seeking beyond preview for non-logged-in users
    if (isPreviewContent && seekTime > previewDuration) {
      return;
    }

    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio || audioConfig.type !== 'direct') return;

    const newTime = Math.max(0, Math.min(totalDuration, audio.currentTime + seconds));
    
    // Prevent skipping beyond preview for non-logged-in users
    if (isPreviewContent && newTime > previewDuration) {
      return;
    }

    audio.currentTime = newTime;
  };

  const changeSpeed = (rate: number) => {
    const audio = audioRef.current;
    if (!audio || audioConfig.type !== 'direct') return;

    audio.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;
  const previewProgress = isPreviewContent && totalDuration > 0 ? (previewDuration / totalDuration) * 100 : 100;

  // Show embedded player for Podbean
  if (audioConfig.type === 'embed' && audioConfig.embedUrl) {
    // Show preview ended overlay
    if (previewEnded || showPreviewOverlay) {
      return (
        <div className="bg-gray-800 rounded-lg p-6 text-white">
          <div className="text-center mb-4">
            <h3 className="font-medium text-lg">{title}</h3>
            <p className="text-gray-400 text-sm">Shunyamurti</p>
          </div>

          <div className="aspect-[4/3] bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-lg font-medium mb-2">Preview Ended</p>
              <p className="text-sm opacity-75 mb-4">
                You've reached the {Math.floor(previewDuration / 60)}-minute preview limit
              </p>
              <button
                onClick={onPreviewEnd}
                className="bg-white text-gray-900 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Sign Up to Continue
              </button>
            </div>
          </div>

          {/* Debug Panel - Development only */}
          {process.env.NODE_ENV === 'development' && debugLog.length > 0 && (
            <div className="mt-4 bg-gray-900 p-3 rounded-lg">
              <div className="text-xs font-medium mb-2">Debug Log:</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {debugLog.map((log, index) => (
                  <div key={index} className="text-xs text-gray-400 font-mono">{log}</div>
                ))}
              </div>
              <button
                onClick={() => setDebugLog([])}
                className="mt-2 text-xs bg-gray-700 px-2 py-1 rounded"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      );
    }

    // Show regular embedded player
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-white">
        {/* Title */}
        <div className="text-center mb-4">
          <h3 className="font-medium text-lg">{title}</h3>
          <p className="text-gray-400 text-sm">Shunyamurti</p>
          {isPreviewContent && (
            <p className="text-yellow-400 text-sm mt-2">
              ⚠️ Preview limited to {Math.floor(previewDuration / 60)} minutes. Sign up for full access.
            </p>
          )}
        </div>

        {/* Preview Progress Indicator */}
        {isPreviewContent && currentTime > 0 && (
          <div className="mb-4">
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-1000" 
                style={{ 
                  width: `${Math.min((currentTime / previewDuration) * 100, 100)}%` 
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-1 text-center">
              Preview: {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')} / 
              {Math.floor(previewDuration / 60)}:{(Math.floor(previewDuration % 60)).toString().padStart(2, '0')}
            </p>
          </div>
        )}

        {/* Podbean Embedded Player - No duplicate controls */}
        <div className="relative">
          <iframe
            ref={iframeRef}
            src={audioConfig.embedUrl}
            allow="autoplay"
            width="100%"
            height="150"
            style={{ border: 'none', borderRadius: '8px' }}
            title={title}
            onLoad={() => addDebugLog('Podbean iframe loaded')}
          />
        </div>

        {/* Debug Panel - Development only */}
        {process.env.NODE_ENV === 'development' && debugLog.length > 0 && (
          <div className="mt-4 bg-gray-900 p-3 rounded-lg">
            <div className="text-xs font-medium mb-2">Debug Log:</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {debugLog.map((log, index) => (
                <div key={index} className="text-xs text-gray-400 font-mono">{log}</div>
              ))}
            </div>
            <button
              onClick={() => setDebugLog([])}
              className="mt-2 text-xs bg-gray-700 px-2 py-1 rounded"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    );
  }

  // Show fallback for unsupported embeds
  if (audioConfig.type === 'embed' && !audioConfig.embedUrl) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-white">
        <div className="text-center mb-4">
          <h3 className="font-medium text-lg">{title}</h3>
          <p className="text-gray-400 text-sm">Shunyamurti</p>
        </div>

        <div className="text-center">
          <p className="text-gray-300 mb-4">Unable to extract audio ID for embedding</p>
          <a
            href={audioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Listen on Podbean
          </a>
        </div>
      </div>
    );
  }

  // For direct audio files, show full player with preview functionality
  return (
    <div className="bg-gray-800 rounded-lg p-6 text-white">
      {audioConfig.directUrl && <audio ref={audioRef} src={audioConfig.directUrl} preload="metadata" />}
      
      {/* Title */}
      <div className="text-center mb-4">
        <h3 className="font-medium text-lg">{title}</h3>
        <p className="text-gray-400 text-sm">Shunyamurti</p>
        {isPreviewContent && (
          <p className="text-yellow-400 text-sm mt-2">
            ⚠️ Preview limited to {Math.floor(previewDuration / 60)} minutes. Sign up for full access.
          </p>
        )}
      </div>

      {audioError ? (
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">Unable to load audio file</p>
          <a
            href={audioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            Download Audio
          </a>
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <button
              onClick={() => changeSpeed(playbackRate === 1 ? 1.5 : 1)}
              className="text-sm bg-gray-700 px-2 py-1 rounded"
              disabled={previewEnded && !isLoggedIn}
            >
              {playbackRate}x
            </button>
            
            <button
              onClick={() => skip(-30)}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
              disabled={previewEnded && !isLoggedIn}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
            </button>

            <button
              onClick={() => skip(-10)}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
              disabled={previewEnded && !isLoggedIn}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
            </button>

            <button
              onClick={togglePlay}
              className="p-3 bg-white text-gray-800 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
              disabled={audioError}
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            <button
              onClick={() => skip(10)}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
              disabled={previewEnded && !isLoggedIn}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>
              </svg>
            </button>

            <button
              onClick={() => skip(30)}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
              disabled={previewEnded && !isLoggedIn}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
            </button>

            {audioConfig.directUrl && (
              <a
                href={audioConfig.directUrl}
                download
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
              </a>
            )}
          </div>

          {/* Progress Bar with Preview Indicator */}
          <div className="space-y-2">
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                disabled={previewEnded && !isLoggedIn}
              />
              {/* Preview limit indicator for non-logged-in users */}
              {isPreviewContent && (
                <div 
                  className="absolute top-0 h-2 bg-yellow-500 rounded-lg pointer-events-none"
                  style={{ width: `${previewProgress}%` }}
                />
              )}
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(totalDuration)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};



// Video Player Component with Preview Functionality
interface VideoPlayerProps {
  teaching: Teaching;
  isLoggedIn: boolean;
  onPreviewEnd: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ teaching, isLoggedIn, onPreviewEnd }) => {
  const [previewEnded, setPreviewEnded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showPreviewOverlay, setShowPreviewOverlay] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const originalSrcRef = useRef<string>('');
  
  const previewDuration = teaching.previewDuration || 30; // Default 30 seconds
  const isPreviewContent = !isLoggedIn && teaching.type === 'free';

  // Debug logging function
  const addDebugLog = (message: string) => {
    console.log(`[VideoPlayer Debug] ${message}`);
    setDebugLog(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Initialize start time and debug logging
  useEffect(() => {
    startTimeRef.current = Date.now();
    addDebugLog(`VideoPlayer initialized - Platform: ${teaching.videoPlatform}, Preview: ${isPreviewContent}, Duration: ${previewDuration}s`);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Method 1: YouTube postMessage API Control
  const controlYouTubeVideo = (command: 'pauseVideo' | 'stopVideo' | 'playVideo') => {
    if (!videoRef.current) return false;
    
    try {
      const message = JSON.stringify({
        event: 'command',
        func: command,
        args: []
      });
      
      videoRef.current.contentWindow?.postMessage(message, '*');
      addDebugLog(`YouTube postMessage sent: ${command}`);
      return true;
    } catch (error) {
      addDebugLog(`YouTube postMessage failed: ${error}`);
      return false;
    }
  };

  // Method 2: Cloudflare Stream postMessage API Control
  const controlCloudflareVideo = (command: 'pause' | 'play') => {
    if (!videoRef.current) return false;
    
    try {
      // Try multiple message formats for Cloudflare
      const messages = [
        // Standard format
        JSON.stringify({ type: command }),
        // Alternative format
        JSON.stringify({ 
          __privateUnstableMessageType: 'command',
          command: command 
        }),
        // Player API format
        JSON.stringify({
          method: command
        })
      ];
      
      messages.forEach((message, index) => {
        videoRef.current?.contentWindow?.postMessage(message, 'https://iframe.videodelivery.net');
        addDebugLog(`Cloudflare postMessage attempt ${index + 1}: ${command}`);
      });
      
      // Also try sending to wildcard origin as fallback
      videoRef.current.contentWindow?.postMessage(
        JSON.stringify({ type: command }), 
        '*'
      );
      
      return true;
    } catch (error) {
      addDebugLog(`Cloudflare postMessage failed: ${error}`);
      return false;
    }
  };

  // Method 3: Iframe Source Reset (Universal Fallback)
  const resetIframeSrc = () => {
    if (!videoRef.current) return false;
    
    try {
      // For preview blocking, permanently set to blank - don't restore
      videoRef.current.src = 'about:blank';
      addDebugLog('Iframe src permanently reset to about:blank');
      return true;
    } catch (error) {
      addDebugLog(`Iframe src reset failed: ${error}`);
      return false;
    }
  };

  // Method 4: Replace iframe with placeholder
  const replaceIframeWithPlaceholder = () => {
    setShowPreviewOverlay(true);
    addDebugLog('Iframe replaced with placeholder overlay');
  };

  // Comprehensive video stopping function
  const stopVideo = () => {
    addDebugLog('Executing comprehensive video stop...');
    
    let stopped = false;
    
    // Try platform-specific methods first
    switch (teaching.videoPlatform) {
      case 'youtube':
        stopped = controlYouTubeVideo('pauseVideo') || controlYouTubeVideo('stopVideo');
        break;
      case 'cloudflare':
        stopped = controlCloudflareVideo('pause');
        break;
      case 'rumble':
        // Rumble doesn't have reliable postMessage API, use fallback
        break;
    }
    
    // ALWAYS use iframe src reset as it's the most reliable method
    addDebugLog('Using iframe src reset as primary stop method');
    resetIframeSrc();
    
    // Always show placeholder overlay as final guarantee
    replaceIframeWithPlaceholder();
    
    // Clear any running timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Handle preview end
  const handlePreviewEnd = () => {
    // Prevent multiple calls
    if (previewEnded) {
      addDebugLog('handlePreviewEnd called but preview already ended');
      return;
    }
    
    addDebugLog(`Preview ended after ${currentTime}s`);
    setPreviewEnded(true);
    
    // Immediately stop video with all methods
    stopVideo();
    
    // Force overlay to show immediately
    setShowPreviewOverlay(true);
    
    onPreviewEnd();
  };

  // YouTube Player API Integration
  useEffect(() => {
    if (teaching.videoPlatform === 'youtube' && isPreviewContent) {
      addDebugLog('Setting up YouTube API listener');
      
      let player: any = null;
      let checkInterval: NodeJS.Timeout;

      // Load YouTube API if not already loaded
      if (!(window as any).YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      // YouTube API ready callback
      const initializePlayer = () => {
        if (videoRef.current && (window as any).YT && (window as any).YT.Player) {
          try {
            player = new (window as any).YT.Player(videoRef.current, {
              events: {
                onStateChange: (event: any) => {
                  addDebugLog(`YouTube state change: ${event.data}`);
                  
                  if (event.data === (window as any).YT.PlayerState.PLAYING) {
                    // Start monitoring playback time
                    checkInterval = setInterval(() => {
                      if (player && typeof player.getCurrentTime === 'function') {
                        const time = player.getCurrentTime();
                        setCurrentTime(time);
                        
                        if (time >= previewDuration && !previewEnded) {
                          clearInterval(checkInterval);
                          addDebugLog(`YouTube preview limit reached: ${time}s`);
                          player.pauseVideo();
                          handlePreviewEnd();
                        }
                      }
                    }, 1000);
                  } else {
                    if (checkInterval) clearInterval(checkInterval);
                  }
                },
                onError: (event: any) => {
                  addDebugLog(`YouTube player error: ${event.data}`);
                }
              }
            });
          } catch (error) {
            addDebugLog(`YouTube player initialization failed: ${error}`);
          }
        }
      };

      // Wait for API or initialize immediately
      if ((window as any).YT && (window as any).YT.Player) {
        initializePlayer();
      } else {
        (window as any).onYouTubeIframeAPIReady = initializePlayer;
      }

      return () => {
        if (checkInterval) clearInterval(checkInterval);
        if (player && typeof player.destroy === 'function') {
          try {
            player.destroy();
          } catch (error) {
            addDebugLog(`YouTube player cleanup error: ${error}`);
          }
        }
      };
    }
  }, [teaching.videoPlatform, isPreviewContent, previewDuration, previewEnded]);

  // Cloudflare Stream postMessage listener
  useEffect(() => {
    if (teaching.videoPlatform === 'cloudflare' && isPreviewContent) {
      addDebugLog('Setting up Cloudflare Stream listener');
      
      const handleMessage = (event: MessageEvent) => {
        // Stop processing if preview already ended
        if (previewEnded) {
          return;
        }
        
        // Only accept messages from Cloudflare Stream
        if (event.origin !== 'https://iframe.videodelivery.net') {
          return;
        }
        
        addDebugLog(`Cloudflare message received: ${JSON.stringify(event.data)}`);
        
        // Handle Cloudflare's actual message format
        if (event.data.__privateUnstableMessageType === 'propertyChange' && 
            event.data.property === 'currentTime') {
          const time = event.data.value;
          setCurrentTime(time);
          
          if (time >= previewDuration && !previewEnded) {
            addDebugLog(`Cloudflare preview limit reached: ${time}s`);
            controlCloudflareVideo('pause');
            handlePreviewEnd();
          }
        }
        
        // Also handle standard timeupdate format as fallback
        if (event.data.type === 'timeupdate' && event.data.currentTime !== undefined) {
          const time = event.data.currentTime;
          setCurrentTime(time);
          
          if (time >= previewDuration && !previewEnded) {
            addDebugLog(`Cloudflare preview limit reached: ${time}s`);
            controlCloudflareVideo('pause');
            handlePreviewEnd();
          }
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [teaching.videoPlatform, isPreviewContent, previewDuration, previewEnded]);

  // Universal timer fallback for other platforms
  useEffect(() => {
    if (isPreviewContent && 
        teaching.videoPlatform !== 'youtube' && 
        teaching.videoPlatform !== 'cloudflare') {
      
      addDebugLog(`Setting up universal timer fallback for ${teaching.videoPlatform}`);
      
      timerRef.current = setInterval(() => {
        // Stop if preview already ended
        if (previewEnded) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return;
        }
        
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setCurrentTime(elapsed);
        
        if (elapsed >= previewDuration && !previewEnded) {
          addDebugLog(`Universal timer preview limit reached: ${elapsed}s`);
          handlePreviewEnd();
        }
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [isPreviewContent, teaching.videoPlatform, previewDuration, previewEnded]);

  // Store original src for reset functionality
  useEffect(() => {
    if (videoRef.current && videoRef.current.src) {
      originalSrcRef.current = videoRef.current.src;
    }
  }, []);

  // Build iframe src with necessary parameters
  const buildIframeSrc = () => {
    let src = '';
    
    switch (teaching.videoPlatform) {
      case 'youtube':
        if (teaching.videoId) {
          src = `https://www.youtube.com/embed/${teaching.videoId}?enablejsapi=1&rel=0`;
          if (typeof window !== 'undefined') {
            src += `&origin=${window.location.origin}`;
          }
        }
        break;
      case 'rumble':
        if (teaching.videoId) {
          src = `https://rumble.com/embed/${teaching.videoId}/`;
        }
        break;
      case 'cloudflare':
        if (teaching.videoId) {
          src = `https://iframe.videodelivery.net/${teaching.videoId}`;
        }
        break;
      default:
        src = teaching.videoUrl || '';
    }
    
    return src;
  };

  const iframeSrc = buildIframeSrc();

  // Show preview ended overlay
  if (previewEnded || showPreviewOverlay) {
    return (
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
        <Image
          src={teaching.imageUrl}
          alt={teaching.title}
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="text-white text-center p-6">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-75" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-lg font-medium mb-2">Preview Ended</p>
            <p className="text-sm opacity-75 mb-4">
              You've reached the {Math.floor(previewDuration / 60)}-minute preview limit
            </p>
            <button
              onClick={onPreviewEnd}
              className="bg-white text-gray-900 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Sign Up to Continue
            </button>
          </div>
        </div>
        
        {/* Debug Panel - Only show in development 
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-80 text-white p-2 rounded text-xs max-w-xs">
            <div className="font-bold mb-1">Debug Log:</div>
            {debugLog.map((log, index) => (
              <div key={index} className="text-xs opacity-75">{log}</div>
            ))}
          </div>
        )}*/}
      </div>
    );
  }

  // Show regular video player
  return (
    <div className="relative">
      {/* Preview warning for non-logged-in users */}
      {isPreviewContent && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            ⚠️ Preview limited to {Math.floor(previewDuration / 60)} minutes. 
            <Link href="/signup" className="text-yellow-900 underline ml-1">
              Sign up for full access
            </Link>
          </p>
          {currentTime > 0 && (
            <div className="mt-2">
              <div className="w-full bg-yellow-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full transition-all duration-1000" 
                  style={{ 
                    width: `${Math.min((currentTime / previewDuration) * 100, 100)}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')} / 
                {Math.floor(previewDuration / 60)}:{(Math.floor(previewDuration % 60)).toString().padStart(2, '0')}
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Video iframe */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {iframeSrc ? (
          <iframe
            ref={videoRef}
            src={iframeSrc}
            title={teaching.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => addDebugLog('Iframe loaded successfully')}
            onError={() => addDebugLog('Iframe load error')}
          />
        ) : (
          // Fallback thumbnail if no valid src
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={teaching.imageUrl}
              alt={teaching.title}
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-center">
                <svg className="w-16 h-16 mx-auto mb-2 opacity-75" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <p className="text-sm opacity-75">Video not available</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Debug Panel - Only show in development 
      {process.env.NODE_ENV === 'development' && debugLog.length > 0 && (
        <div className="mt-4 bg-gray-100 p-3 rounded-lg">
          <div className="text-sm font-medium mb-2">Debug Log:</div>
          <div className="space-y-1">
            {debugLog.map((log, index) => (
              <div key={index} className="text-xs text-gray-600 font-mono">{log}</div>
            ))}
          </div>
          <button
            onClick={() => setDebugLog([])}
            className="mt-2 text-xs bg-gray-200 px-2 py-1 rounded"
          >
            Clear Log
          </button>
        </div>
      )}*/}
    </div>
  );
};

// Related Videos Component
const RelatedVideos: React.FC<{ 
  teachings: Teaching[]; 
  isLoggedIn: boolean; 
  onLoginPrompt: () => void; 
}> = ({ teachings, isLoggedIn, onLoginPrompt }) => {
  const router = useRouter();
  
  const handleVideoClick = (e: React.MouseEvent, teaching: Teaching) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      onLoginPrompt();
    } else {
      router.push(`/teachings/${teaching.slug}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Related videos</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </button>
      </div>
      
      <div className="space-y-3">
        {teachings.map((teaching) => (
          <div
            key={teaching.id}
            onClick={(e) => handleVideoClick(e, teaching)}
            className="flex space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="relative w-32 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={teaching.imageUrl}
                alt={teaching.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              
              {!isLoggedIn && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-black bg-opacity-70 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm line-clamp-2 mb-1">{teaching.title}</h4>
              <p className="text-xs text-gray-500 line-clamp-2">{teaching.description}</p>
              
              {!isLoggedIn && (
                <p className="text-xs text-amber-600 mt-1 font-medium">
                  Sign in to watch
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
// Comments Component
const CommentsSection: React.FC<{ teachingId: string | number }> = ({ teachingId }) => {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !session) return;

    const comment: Comment = {
      id: Date.now().toString(),
      user: { name: session.user?.name || 'Anonymous' },
      content: newComment,
      timestamp: 'just now'
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  return (
    <div className="space-y-6">
      {/* Comment List */}
      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 overflow-hidden">
                <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm">{comment.user.name}</span>
                  <span className="text-xs text-gray-500">{comment.timestamp}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}

      {/* Comment Form */}
      {session ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a post"
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[#300001] focus:border-transparent"
              rows={3}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button type="button" className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </button>
              <button type="button" className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </button>
              <button type="button" className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </button>
            </div>
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="bg-[#300001] text-white px-6 py-2 rounded-lg hover:bg-[#4a0002] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <p>Please <Link href="/login" className="text-[#300001] hover:underline">log in</Link> to leave a comment.</p>
        </div>
      )}
    </div>
  );
};

// Main Teaching Detail Component
const TeachingDetailPage: React.FC<TeachingDetailProps> = ({ 
  teaching, 
  relatedTeachings = [] 
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  
  const [showPreviewEndedModal, setShowPreviewEndedModal] = useState(false);
  const [showRelatedVideoLoginModal, setShowRelatedVideoLoginModal] = useState(false);
  // Determine initial tab based on content availability
  const getInitialTab = () => {
    if (teaching.content) return 'text';
    return 'description';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [relatedVideos, setRelatedVideos] = useState<Teaching[]>(relatedTeachings);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);

  // Handle preview end
  const handlePreviewEnd = () => {
    setShowPreviewEndedModal(true);
  };

  // Fetch related teachings from same content type
  useEffect(() => {
    const fetchRelatedTeachings = async () => {
      if (relatedTeachings.length > 0) return; // Already provided
      
      setIsLoadingRelated(true);
      try {
        // Map UI content type back to Strapi content type
        const contentTypeToStrapiMap: Record<string, string> = {
          'Teachings': 'teaching',
          'Guided Meditations': 'guided_meditation',
          'Q&A with Shunyamurti': 'qa_with_shunyamurti',
          'Essay': 'essay',
          'Book Group': 'book_group',
        };

        const strapiContentType = contentTypeToStrapiMap[teaching.contentType];
        if (!strapiContentType) return;

        const response = await teachingsApi.getTeachings(
          1, // page
          12, // pageSize - get 12 related videos
          { 
            contenttype: strapiContentType as any,
            // Exclude current teaching if we have the ID
            ...(teaching.id && { id: { $ne: teaching.id } })
          },
          'publishDate:desc'
        );

        if (response.data) {
          // Transform to UI format
          const transformedTeachings = response.data.map((t: any) => ({
            id: t.id,
            slug: t.attributes.slug,
            title: t.attributes.title,
            description: t.attributes.description,
            summary: t.attributes.summary,
            content: t.attributes.content,
            duration: t.attributes.duration || '',
            type: (t.attributes.access === 'anon' || t.attributes.access === 'free') ? 'free' : 'membership',
            access: t.attributes.access,
            contentType: teaching.contentType, // Same as current
            date: new Date(t.attributes.publishDate || t.attributes.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            publishDate: new Date(t.attributes.publishDate || t.attributes.createdAt).toISOString(),
            imageUrl: t.attributes.featuredImage?.data?.attributes?.url 
              ? (getStrapiMedia(t.attributes.featuredImage.data.attributes.url) || '/placeholder-video.jpg')
              : '/placeholder-video.jpg',
            videoUrl: t.attributes.videoUrl,
            videoPlatform: t.attributes.videoPlatform,
            videoId: t.attributes.videoId,
            audioUrl: t.attributes.audioUrl,
            audioPlatform: t.attributes.audioPlatform,
            hiddenTags: t.attributes.hiddenTags,
            previewDuration: t.attributes.previewDuration || 300,
            transcription: t.attributes.transcription,
          }));

          setRelatedVideos(transformedTeachings);
        }
      } catch (error) {
        console.error('Error fetching related teachings:', error);
      } finally {
        setIsLoadingRelated(false);
      }
    };

    fetchRelatedTeachings();
  }, [teaching.contentType, teaching.id, relatedTeachings.length]);

  // Determine available tabs based on content
  const availableTabs = [
    ...(teaching.content ? [{ id: 'text', label: 'Text' }] : []),
    { id: 'description', label: 'Description' },
    ...(teaching.transcription ? [{ id: 'transcription', label: 'Transcription' }] : []),
    ...(teaching.audioUrl ? [{ id: 'audio', label: 'Audio' }] : []),
    { id: 'comments', label: 'Comments' }
  ];

  const hasVideo = teaching.videoUrl && teaching.videoPlatform !== 'none';
  const hasAudio = teaching.audioUrl && teaching.audioPlatform !== 'none' && !hasVideo;

  return (
    <div className="bg-[#FAF8F1] min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#300001] focus:border-transparent"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-6">{teaching.title}</h1>

            {/* Social Share */}
            <div className="flex items-center space-x-3 mb-6">
              <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
            </div>

            {/* Media Content */}
            <div className="mb-6">
              {hasVideo && (
                <VideoPlayer 
                  teaching={teaching} 
                  isLoggedIn={isLoggedIn}
                  onPreviewEnd={handlePreviewEnd}
                />
              )}
              {hasAudio && !hasVideo && (
                <AudioPlayer 
                  audioUrl={teaching.audioUrl!}
                  title={teaching.title}
                  duration={teaching.duration} 
                  audioPlatform={teaching.audioPlatform}
                  isLoggedIn={isLoggedIn}
                  previewDuration={teaching.previewDuration || 300}
                  onPreviewEnd={handlePreviewEnd}
                />
              )}
              {!hasVideo && !hasAudio && (
                <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
                  <Image
                    src={teaching.imageUrl}
                    alt={teaching.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex space-x-8">
                {availableTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-[#300001] text-[#300001]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'text' && teaching.content && (
                <div className="max-w-none">
                  <RichTextRenderer content={teaching.content} />
                </div>
              )}

              {activeTab === 'description' && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    {teaching.date}
                  </div>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {teaching.description || teaching.summary}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'transcription' && teaching.transcription && (
                <div className="space-y-4">
                  {/* Download Link */}
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-red-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">PDF</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Transcription . pdf</p>
                      <p className="text-xs text-gray-500">16 MB</p>
                    </div>
                    <button className="text-[#300001] hover:text-[#4a0002] font-medium text-sm">
                      Download
                    </button>
                  </div>
                  
                  {/* Transcription Text */}
                  <div className="max-w-none">
                    <RichTextRenderer content={teaching.transcription} />
                  </div>
                </div>
              )}

              {activeTab === 'audio' && teaching.audioUrl && (
                <div className="space-y-4">
                  <AudioPlayer 
                    audioUrl={teaching.audioUrl} 
                    title={teaching.title}
                    duration={teaching.duration}
                    audioPlatform={teaching.audioPlatform}
                    isLoggedIn={isLoggedIn}
                    previewDuration={teaching.previewDuration || 300}
                    onPreviewEnd={handlePreviewEnd}
                  />
                  
                  {/* Download Link */}
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">MP4</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Audio</p>
                      <p className="text-xs text-gray-500">16 MB</p>
                    </div>
                    <a 
                      href={teaching.audioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#300001] hover:text-[#4a0002] font-medium text-sm"
                    >
                      Open Audio
                    </a>
                  </div>
                </div>
              )}

              {activeTab === 'comments' && (
                <CommentsSection teachingId={teaching.id} />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {isLoadingRelated ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Related videos</h3>
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex space-x-3 p-2 animate-pulse">
                      <div className="w-32 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
<RelatedVideos 
  teachings={relatedVideos} 
  isLoggedIn={isLoggedIn}
  onLoginPrompt={() => setShowRelatedVideoLoginModal(true)}
/>            )}
          </div>
        </div>
      </div>

      {/* Preview Ended Modal */}
      {showPreviewEndedModal && !isLoggedIn && (
        <PreviewEndedModal onClose={() => setShowPreviewEndedModal(false)} />
      )}

      {/* Related Video Login Modal */}
{showRelatedVideoLoginModal && !isLoggedIn && (
  <LoginRequiredModal onClose={() => setShowRelatedVideoLoginModal(false)} />
)}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .prose {
          color: #374151;
          line-height: 1.75;
        }
        
        .prose p {
          margin-bottom: 1.25em;
        }
        
        .prose strong {
          color: #111827;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default TeachingDetailPage;