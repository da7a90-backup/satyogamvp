'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Lock, Heart, ArrowLeft, Download, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TeachingData } from '@/types/Teachings';
import VideoSelector, { MediaItem } from './VideoSelector';
import YouTubePlayer from './YouTubePlayer';
import { useSession } from 'next-auth/react';

interface TeachingDetailPageProps {
  data: TeachingData;
  relatedTeachings: TeachingData[];
  isAuthenticated: boolean;
  onLoginClick: () => void;
  onSignupClick: () => void;
}


// Get related videos based on current teaching
const getRelatedVideos = (currentTeaching: TeachingData, allTeachings: TeachingData[]): TeachingData[] => {
  // Filter teachings of the same content type, excluding current one
  const sameType = allTeachings.filter(
    t => t.content_type === currentTeaching.content_type && t.id !== currentTeaching.id
  );
  
  // If we have enough of the same type, return those
  if (sameType.length >= 10) {
    return sameType.slice(0, 10);
  }
  
  // Otherwise, get some from the same type and fill with others
  const others = allTeachings.filter(
    t => t.content_type !== currentTeaching.content_type && t.id !== currentTeaching.id
  );
  
  return [...sameType, ...others].slice(0, 10);
};

export default function TeachingDetailPage({
  data,
  relatedTeachings,
  isAuthenticated,
  onLoginClick,
  onSignupClick
}: TeachingDetailPageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'description' | 'transcription' | 'audio' | 'comments'>('description');
  const [showPreviewEndModal, setShowPreviewEndModal] = useState(false);
  const [showRelatedVideoLoginModal, setShowRelatedVideoLoginModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isInWatchLater, setIsInWatchLater] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

  // Toggle favorite
  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      onLoginClick();
      return;
    }

    try {
      const token = (session as any)?.user?.accessToken;
      const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || 'http://127.0.0.1:8000';

      const response = await fetch(`${API_URL}/api/teachings/${data.id}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });

      if (response.ok) {
        const result = await response.json();
        setIsFavorited(result.is_favorite);
      } else {
        console.error('Failed to toggle favorite:', response.status);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Build unified video array (YouTube + Cloudflare)
  const allVideos: MediaItem[] = [
    ...(data.youtube_ids || []).map((id, idx) => ({
      type: 'youtube' as const,
      id,
      label: data.youtube_ids!.length > 1 ? `YouTube ${idx + 1}` : undefined
    })),
    ...(data.cloudflare_ids || []).map((id, idx) => ({
      type: 'cloudflare' as const,
      id,
      label: data.cloudflare_ids!.length > 1 ? `Video ${idx + 1}` : undefined
    }))
  ];

  // Determine what content is available
  const hasYouTube = data.youtube_ids && data.youtube_ids.length > 0;
  const hasCloudflare = data.cloudflare_ids && data.cloudflare_ids.length > 0;
  const hasVideo = allVideos.length > 0;
  const hasMultipleVideos = allVideos.length > 1;
  const currentVideo = allVideos[selectedVideoIndex];
  const hasAudio = data.podbean_ids && data.podbean_ids.length > 0;
  const hasTranscription = !!data.content_text || !!data.transcription;
  const isEssay = data.content_type === 'essay';
  const isGuidedMeditation = data.content_type === 'guided_meditation';

  const isLocked = !isAuthenticated && data.accessType === 'restricted';
  const isPreviewMode = !isAuthenticated && data.accessType === 'free';

  // Get related videos
  const relatedVideos: TeachingData[] = relatedTeachings;
  // Database stores preview_duration in MINUTES, player needs SECONDS
  const previewDuration = (data.preview_duration || 30) * 60;
  const dashPreviewDuration = (data.dash_preview_duration || data.preview_duration || 60) * 60;

  // Check if we're on dashboard
  const isDashboard = typeof window !== 'undefined' && window.location.pathname.includes('/dashboard');
  const effectivePreviewDuration = isDashboard && isAuthenticated ? dashPreviewDuration : previewDuration;

  // Back link based on context
  const backLink = isDashboard ? '/dashboard/user/library' : '/teachings';
  const backText = isDashboard ? 'Back to Library' : 'Back to Teachings';

  // Get audio URLs
  const podbeanId = hasAudio ? data.podbean_ids![0] : null;
  const podbeanUrl = podbeanId ? `https://www.podbean.com/eu/pb-${podbeanId}` : null;

  // Get image URL
  const imageUrl = data.featured_media?.url || data.imageUrl || '';

  if (isLocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F1] p-5">
        <div className="bg-white rounded-xl p-12 max-w-md text-center shadow-lg">
          <div className="w-16 h-16 bg-[#FEE2E2] rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={32} color="#991B1B" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-[#000000]">Membership Required</h2>
          <p className="text-base text-[#384250] mb-8 leading-relaxed">
            This teaching is available to members only. Please log in to your account or sign up to access our complete library of spiritual content.
          </p>
          <div className="flex gap-4">
            <button onClick={onLoginClick} className="flex-1 px-6 py-3 bg-white border border-[#D5D7DA] rounded-lg font-semibold text-[#384250] hover:bg-gray-50 transition-colors">
              Log In
            </button>
            <button onClick={onSignupClick} className="flex-1 px-6 py-3 bg-[#7D1A13] rounded-lg font-semibold text-white hover:opacity-90 transition-opacity">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F1] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-5 py-10">
        <div className="flex gap-8">
          {/* Main Content Area */}
          <div className="flex-1 max-w-[900px]">
            <Link href={backLink} className="inline-flex items-center gap-2 text-sm text-[#717680] mb-6 hover:text-[#7D1A13] transition-colors">
              <ArrowLeft size={16} />
              {backText}
            </Link>

            <div className="bg-white rounded-xl p-10 shadow-sm">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex gap-3 items-center mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{
                      background: data.accessType === 'free' ? '#D1FAE5' : '#FEE2E2',
                      color: data.accessType === 'free' ? '#065F46' : '#991B1B'
                    }}>
                      {data.accessType === 'free' ? 'Free Preview' : 'Membership'}
                    </span>
                    <span className="text-sm text-[#717680] capitalize">{data.content_type.replace('_', ' ')}</span>
                  </div>
                  <h1 className="text-4xl font-bold mb-2 text-[#000000]" style={{ fontFamily: 'Optima, serif' }}>
                    {data.title}
                  </h1>
                  <div className="flex gap-4 text-sm text-[#717680]">
                    <span>{new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleToggleFavorite}
                    className="p-3 hover:bg-gray-50 rounded-full transition-colors"
                    title="Add to favorites"
                  >
                    <Heart size={24} fill={isFavorited ? '#7D1A13' : 'none'} stroke={isFavorited ? '#7D1A13' : '#717680'} />
                  </button>
                  <button
                    onClick={() => isAuthenticated ? setIsInWatchLater(!isInWatchLater) : onLoginClick()}
                    className="p-3 hover:bg-gray-50 rounded-full transition-colors"
                    title="Watch later"
                  >
                    <Clock size={24} fill={isInWatchLater ? '#7D1A13' : 'none'} stroke={isInWatchLater ? '#7D1A13' : '#717680'} />
                  </button>
                </div>
              </div>

              {/* Media Player */}
              {!isEssay && (
                <div className="mb-8">
                  {/* Video Selector (if multiple videos) */}
                  {hasMultipleVideos && (
                    <VideoSelector
                      videos={allVideos}
                      selectedIndex={selectedVideoIndex}
                      onSelect={setSelectedVideoIndex}
                    />
                  )}

                  {/* Video Player */}
                  {hasVideo && currentVideo && (
                    <>
                      {currentVideo.type === 'youtube' ? (
                        <YouTubePlayer
                          videoId={currentVideo.id}
                          title={data.title}
                          imageUrl={imageUrl}
                          isLoggedIn={isAuthenticated}
                          isPreviewMode={isPreviewMode}
                          previewDuration={effectivePreviewDuration}
                          onPreviewEnd={() => setShowPreviewEndModal(true)}
                          isDashboard={isDashboard}
                        />
                      ) : (
                        <VideoPlayer
                          videoId={currentVideo.id}
                          title={data.title}
                          imageUrl={imageUrl}
                          isLoggedIn={isAuthenticated}
                          isPreviewMode={isPreviewMode}
                          previewDuration={effectivePreviewDuration}
                          onPreviewEnd={() => setShowPreviewEndModal(true)}
                        />
                      )}
                    </>
                  )}

                  {/* Audio Player (shows alongside video or standalone) */}
                  {hasAudio && (
                    <div className={hasVideo ? "mt-4" : ""}>
                      <AudioPlayer
                        podbeanId={podbeanId!}
                        podbeanUrl={podbeanUrl!}
                        title={data.title}
                        isLoggedIn={isAuthenticated}
                        isPreviewMode={isPreviewMode}
                        previewDuration={effectivePreviewDuration}
                        onPreviewEnd={() => setShowPreviewEndModal(true)}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Preview Mode Banner */}
              {isPreviewMode && !isEssay && (
                <div className="flex items-center gap-3 p-4 bg-[#DBEAFE] border border-[#3B82F6] rounded-lg mb-8">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="#3B82F6">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-[#1E40AF]">
                    <strong>Preview Mode:</strong> You're watching a preview.{' '}
                    <span onClick={onSignupClick} className="underline cursor-pointer hover:no-underline">Sign up free</span> to access the full teaching.
                  </p>
                </div>
              )}

              {/* Tabs */}
              <div className="border-b border-[#E5E7EB] mb-6">
                <div className="flex gap-8">
                  <button
                    onClick={() => setActiveTab('description')}
                    className={`pb-3 px-1 border-b-2 transition-colors ${
                      activeTab === 'description' ? 'border-[#7D1A13] text-[#7D1A13]' : 'border-transparent text-[#717680] hover:text-[#7D1A13]'
                    }`}
                    style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '16px', fontWeight: 600 }}
                  >
                    Description
                  </button>
                  
                  {hasTranscription && (
                    <button
                      onClick={() => setActiveTab('transcription')}
                      className={`pb-3 px-1 border-b-2 transition-colors ${
                        activeTab === 'transcription' ? 'border-[#7D1A13] text-[#7D1A13]' : 'border-transparent text-[#717680] hover:text-[#7D1A13]'
                      }`}
                      style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '16px', fontWeight: 600 }}
                    >
                      Transcription
                    </button>
                  )}

                  {hasAudio && !isGuidedMeditation && (
                    <button
                      onClick={() => setActiveTab('audio')}
                      className={`pb-3 px-1 border-b-2 transition-colors ${
                        activeTab === 'audio' ? 'border-[#7D1A13] text-[#7D1A13]' : 'border-transparent text-[#717680] hover:text-[#7D1A13]'
                      }`}
                      style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '16px', fontWeight: 600 }}
                    >
                      Audio
                    </button>
                  )}

                  <button
                    onClick={() => setActiveTab('comments')}
                    className={`pb-3 px-1 border-b-2 transition-colors ${
                      activeTab === 'comments' ? 'border-[#7D1A13] text-[#7D1A13]' : 'border-transparent text-[#717680] hover:text-[#7D1A13]'
                    }`}
                    style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '16px', fontWeight: 600 }}
                  >
                    Comments
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="prose max-w-none">
                {activeTab === 'description' && (
                  <div style={{ fontFamily: 'Avenir Next, sans-serif' }} className="text-base leading-relaxed text-[#384250]">
                    <p>{data.excerpt_text || data.summary || data.description}</p>
                  </div>
                )}
                
                {activeTab === 'transcription' && hasTranscription && (
                  <div 
                    style={{ fontFamily: 'Avenir Next, sans-serif' }} 
                    className="text-base leading-relaxed text-[#384250]"
                    dangerouslySetInnerHTML={{ __html: data.content_text || data.transcription || '' }} 
                  />
                )}

                {activeTab === 'audio' && hasAudio && (
                  <div className="space-y-4">
                    <AudioPlayer
                      podbeanId={podbeanId!}
                      podbeanUrl={podbeanUrl!}
                      title={data.title}
                      isLoggedIn={isAuthenticated}
                      isPreviewMode={isPreviewMode}
                      onPreviewEnd={() => setShowPreviewEndModal(true)} 
                      previewDuration={previewDuration}                    />
                  </div>
                )}

                {activeTab === 'comments' && (
                  <div className="text-center py-12 text-[#717680]">
                    <p>Comments section coming soon...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Related Videos */}
          {!isEssay && relatedVideos.length > 0 && (
            <div className="w-[320px] flex-shrink-0">
              <RelatedVideos 
                teachings={relatedVideos} 
                isLoggedIn={isAuthenticated}
                onLoginPrompt={() => setShowRelatedVideoLoginModal(true)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showPreviewEndModal && (
        <PreviewEndModal
          onClose={() => setShowPreviewEndModal(false)}
          onLoginClick={onLoginClick}
          onSignupClick={onSignupClick}
        />
      )}

      {showRelatedVideoLoginModal && (
        <LoginRequiredModal onClose={() => setShowRelatedVideoLoginModal(false)} />
      )}
    </div>
  );
}


// Video Player Component with Proper Preview Logic
const VideoPlayer: React.FC<{
  videoId: string;
  title: string;
  imageUrl: string;
  isLoggedIn: boolean;
  isPreviewMode: boolean;
  previewDuration: number; // from data.preview_duration
  onPreviewEnd: () => void;
}> = ({ videoId, title, imageUrl, isLoggedIn, isPreviewMode, previewDuration, onPreviewEnd }) => {
  const [previewEnded, setPreviewEnded] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0); // Actual playback time from player
  
  const videoRef = useRef<HTMLIFrameElement>(null);
  const fallbackTimerRef = useRef<NodeJS.Timeout | undefined>();
  const playStartTimeRef = useRef<number>(0);
  const totalPlayedTimeRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isPreviewMode) return;

    // Cloudflare Stream message listener for ACTUAL playback time
    const handleMessage = (event: MessageEvent) => {
      if (previewEnded) return;
      if (event.origin !== 'https://iframe.videodelivery.net') return;
      
      // Listen for currentTime updates from Cloudflare
      if (event.data.__privateUnstableMessageType === 'propertyChange') {
        if (event.data.property === 'currentTime') {
          const currentTime = event.data.value;
          setPlaybackTime(currentTime);
          
          // Check if preview limit reached
          if (currentTime >= previewDuration && !previewEnded) {
            handlePreviewEnd();
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Fallback: Track play/pause to calculate actual playback time
    const handlePlayPause = (event: MessageEvent) => {
      if (event.origin !== 'https://iframe.videodelivery.net') return;
      
      if (event.data.event === 'play') {
        isPlayingRef.current = true;
        playStartTimeRef.current = Date.now();
        
        // Start fallback timer only when playing
        fallbackTimerRef.current = setInterval(() => {
          if (previewEnded) {
            if (fallbackTimerRef.current) {
              clearInterval(fallbackTimerRef.current);
            }
            return;
          }
          
          if (isPlayingRef.current) {
            const elapsed = (Date.now() - playStartTimeRef.current) / 1000;
            const totalPlayed = totalPlayedTimeRef.current + elapsed;
            setPlaybackTime(totalPlayed);
            
            if (totalPlayed >= previewDuration) {
              handlePreviewEnd();
            }
          }
        }, 1000);
      } else if (event.data.event === 'pause') {
        isPlayingRef.current = false;
        const elapsed = (Date.now() - playStartTimeRef.current) / 1000;
        totalPlayedTimeRef.current += elapsed;
        
        if (fallbackTimerRef.current) {
          clearInterval(fallbackTimerRef.current);
        }
      }
    };

    window.addEventListener('message', handlePlayPause);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('message', handlePlayPause);
      if (fallbackTimerRef.current) {
        clearInterval(fallbackTimerRef.current);
      }
    };
  }, [isPreviewMode, previewDuration, previewEnded]);

  const handlePreviewEnd = () => {
    if (previewEnded) return;
    
    setPreviewEnded(true);
    
    // Stop the video by replacing iframe source
    if (videoRef.current) {
      videoRef.current.src = 'about:blank';
    }
    
    if (fallbackTimerRef.current) {
      clearInterval(fallbackTimerRef.current);
    }
    
    onPreviewEnd();
  };

  const cloudflareUrl = `https://iframe.videodelivery.net/${videoId}`;

  if (previewEnded) {
    return (
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-black bg-opacity-60" />
      </div>
    );
  }

  return (
    <div className="relative">
      {isPreviewMode && playbackTime > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-800 text-sm font-medium">
              Preview: {Math.floor(playbackTime / 60)}:{(Math.floor(playbackTime % 60)).toString().padStart(2, '0')} / {Math.floor(previewDuration / 60)}:{(Math.floor(previewDuration % 60)).toString().padStart(2, '0')}
            </p>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ 
                width: `${Math.min((playbackTime / previewDuration) * 100, 100)}%` 
              }}
            ></div>
          </div>
        </div>
      )}
      
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          ref={videoRef}
          src={cloudflareUrl}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};

// Audio Player Component with Proper Preview Logic
const AudioPlayer: React.FC<{
  podbeanId: string;
  podbeanUrl: string;
  title: string;
  isLoggedIn: boolean;
  isPreviewMode: boolean;
  previewDuration: number; // from data.preview_duration
  onPreviewEnd: () => void;
}> = ({ podbeanId, podbeanUrl, title, isLoggedIn, isPreviewMode, previewDuration, onPreviewEnd }) => {
  const [previewEnded, setPreviewEnded] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0); // Actual playback time from player
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const podbeanWidgetRef = useRef<any>(null);
  const fallbackTimerRef = useRef<NodeJS.Timeout | undefined>();
  const playStartTimeRef = useRef<number>(0);
  const totalPlayedTimeRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);

  // Load Podbean Widget API
  useEffect(() => {
    if (isPreviewMode && typeof window !== 'undefined' && !(window as any).PB) {
      const script = document.createElement('script');
      script.src = 'https://podbean.com/assets/js/widget.js';
      script.async = true;
      document.head.appendChild(script);
      
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, [isPreviewMode]);

  // Initialize Podbean Widget for actual playback tracking
  useEffect(() => {
    if (isPreviewMode && iframeRef.current && (window as any).PB && !podbeanWidgetRef.current) {
      try {
        const widget = new (window as any).PB(iframeRef.current);
        podbeanWidgetRef.current = widget;
        
        // Listen for ACTUAL playback progress from Podbean
        widget.bind((window as any).PB.Widget.Events.PLAY_PROGRESS, (event: any) => {
          if (previewEnded) return;
          
          const currentPosition = event.currentPosition || 0; // This is actual playback time in seconds
          setPlaybackTime(currentPosition);
          
          if (currentPosition >= previewDuration) {
            handlePreviewEnd();
          }
        });

        // Track play/pause for fallback
        widget.bind((window as any).PB.Widget.Events.PLAY, () => {
          isPlayingRef.current = true;
          playStartTimeRef.current = Date.now();
        });

        widget.bind((window as any).PB.Widget.Events.PAUSE, () => {
          isPlayingRef.current = false;
          const elapsed = (Date.now() - playStartTimeRef.current) / 1000;
          totalPlayedTimeRef.current += elapsed;
        });

      } catch (error) {
        console.error('Failed to initialize Podbean widget:', error);
        setupFallbackTimer();
      }
    }

    return () => {
      if (podbeanWidgetRef.current) {
        try {
          podbeanWidgetRef.current.unbind((window as any).PB.Widget.Events.PLAY_PROGRESS);
          podbeanWidgetRef.current.unbind((window as any).PB.Widget.Events.PLAY);
          podbeanWidgetRef.current.unbind((window as any).PB.Widget.Events.PAUSE);
        } catch (error) {
          console.error('Error cleaning up Podbean widget:', error);
        }
      }
    };
  }, [isPreviewMode, previewEnded, previewDuration]);

  const setupFallbackTimer = () => {
    fallbackTimerRef.current = setInterval(() => {
      if (previewEnded) {
        if (fallbackTimerRef.current) {
          clearInterval(fallbackTimerRef.current);
        }
        return;
      }
      
      if (isPlayingRef.current) {
        const elapsed = (Date.now() - playStartTimeRef.current) / 1000;
        const totalPlayed = totalPlayedTimeRef.current + elapsed;
        setPlaybackTime(totalPlayed);
        
        if (totalPlayed >= previewDuration) {
          handlePreviewEnd();
        }
      }
    }, 1000);
  };

  const handlePreviewEnd = () => {
    if (previewEnded) return;
    
    setPreviewEnded(true);
    
    // Pause Podbean player
    if (podbeanWidgetRef.current) {
      try {
        podbeanWidgetRef.current.pause();
      } catch (error) {
        console.error('Failed to pause Podbean:', error);
      }
    }
    
    // Replace iframe
    if (iframeRef.current) {
      iframeRef.current.src = 'about:blank';
    }
    
    if (fallbackTimerRef.current) {
      clearInterval(fallbackTimerRef.current);
    }
    
    onPreviewEnd();
  };

  const embedUrl = `https://www.podbean.com/player-v2/?i=${podbeanId}&from=embed&square=1&share=1&download=1&rtl=0&fonts=Arial&skin=1&font-color=auto&logo_link=episode_page&btn-skin=7`;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (previewEnded) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-white relative">
        <div className="text-center py-8">
          <p className="text-lg font-medium mb-2">Preview Ended</p>
          <p className="text-sm opacity-75">Sign up to continue listening</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 text-white">
      <div className="text-center mb-4">
        <h3 className="font-medium text-lg">{title}</h3>
        <p className="text-gray-400 text-sm">Shunyamurti</p>
        {isPreviewMode && playbackTime > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-yellow-400 text-sm font-medium">
                Preview: {formatTime(playbackTime)} / {formatTime(previewDuration)}
              </p>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
                style={{ 
                  width: `${Math.min((playbackTime / previewDuration) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <iframe
          ref={iframeRef}
          src={embedUrl}
          allow="autoplay"
          width="100%"
          height="150"
          style={{ border: 'none', borderRadius: '8px' }}
          title={title}
        />
      </div>

      <div className="mt-4 text-center">
        
          <a href={podbeanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
        >
          <Download size={16} />
          Download Audio
        </a>
      </div>
    </div>
  );
};





// Related Videos Component
const RelatedVideos: React.FC<{
  teachings: TeachingData[];
  isLoggedIn: boolean;
  onLoginPrompt: () => void;
}> = ({ teachings, isLoggedIn, onLoginPrompt }) => {
  const router = useRouter();

  const handleVideoClick = (e: React.MouseEvent, teaching: TeachingData) => {
    e.preventDefault();

    if (!isLoggedIn && teaching.accessType === 'restricted') {
      onLoginPrompt();
    } else {
      router.push(`/teachings/${teaching.slug}`);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Related Videos</h3>
      <div className="space-y-4">
        {teachings.map((teaching) => {
          const imageUrl = teaching.featured_media?.url || teaching.imageUrl || '';
          
          return (
            <div
              key={teaching.id}
              onClick={(e) => handleVideoClick(e, teaching)}
              className="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              <div className="relative w-32 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={imageUrl}
                  alt={teaching.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>

                {!isLoggedIn && teaching.accessType === 'restricted' && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-black bg-opacity-70 rounded-full flex items-center justify-center">
                    <Lock size={12} className="text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-2 mb-1">{teaching.title}</h4>
                <p className="text-xs text-gray-500 line-clamp-2">{teaching.excerpt_text}</p>

                {!isLoggedIn && teaching.accessType === 'restricted' && (
                  <p className="text-xs text-amber-600 mt-1 font-medium">
                    Sign in to watch
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Preview End Modal
// Preview End Modal - Matching Screenshot Design
function PreviewEndModal({
  onClose,
  onLoginClick,
  onSignupClick
}: {
  onClose: () => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl p-12 max-w-lg w-full relative">
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3 text-gray-900" style={{ fontFamily: 'Optima, serif' }}>
            Continue browsing our free library
          </h2>
          <p className="text-gray-600 text-base">
            Gain access to 500+ publications, exclusive content, and a free meditation course
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => window.location.href = '/api/auth/signin?provider=google'}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          <button
            onClick={() => window.location.href = '/api/auth/signin?provider=facebook'}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Sign in with Facebook
          </button>

          <button
            onClick={() => window.location.href = '/api/auth/signin?provider=apple'}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.45-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.47C2.79 15.22 3.51 7.89 8.42 7.56c1.57.05 2.62 1.06 3.54 1.1 1.35-.18 2.63-1.16 4.11-1.22 1.78-.08 3.12.62 4.02 2.08-3.34 2.13-2.79 6.17.55 7.83-.43 1.08-.99 2.13-1.59 3.13zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Sign in with Apple
          </button>
        </div>

        <div className="flex items-center justify-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm font-medium">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button
          onClick={() => window.location.href = '/signup'}
          className="w-full text-center text-gray-700 font-medium hover:text-gray-900 transition-colors text-base"
        >
          Continue with email
        </button>
      </div>
    </div>
  );
}

// Login Required Modal
const LoginRequiredModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
      <p className="text-gray-600 mb-6">
        Create your free account to watch this video and access our complete library of 500+ teachings.
      </p>

      <div className="space-y-3">
        <a href="/login" className="block w-full py-3 px-4 border border-gray-300 rounded-md text-center bg-white text-gray-700 hover:bg-gray-50 transition-colors">
          Sign In
        </a>
        <a href="/signup" className="block w-full py-3 px-4 bg-[#7D1A13] text-white rounded-md text-center hover:opacity-90 transition-opacity">
          Sign Up Free
        </a>
      </div>
    </div>
  </div>
);