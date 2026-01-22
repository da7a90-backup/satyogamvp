'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, SkipBack, SkipForward, Download, Music2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioPlayerModalProps {
  product: {
    title: string;
    description?: string;
    thumbnail_url?: string;
    featured_image?: string;
    portal_media?: {
      mp3?: string[];
      podbean?: string[];
    } | Array<{
      title: string;
      description?: string;
      audio_url?: string;
      youtube_url?: string;
    }>;
    digital_content_url?: string;
  };
  onClose: () => void;
}

export function AudioPlayerModal({ product, onClose }: AudioPlayerModalProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Get all audio tracks - handle both dict and list formats
  const getAudioTracks = () => {
    const tracks: { url: string; title?: string; type: 'audio' | 'podbean' }[] = [];

    console.log('[AudioPlayerModal] Getting audio tracks from product:', {
      title: product.title,
      digital_content_url: product.digital_content_url,
      portal_media_type: typeof product.portal_media,
      is_array: Array.isArray(product.portal_media),
      portal_media: product.portal_media
    });

    // Digital content URL
    if (product.digital_content_url) {
      console.log('[AudioPlayerModal] Adding digital_content_url:', product.digital_content_url);
      tracks.push({ url: product.digital_content_url, type: 'audio' });
    }

    // Handle list format (guided meditations)
    if (Array.isArray(product.portal_media)) {
      console.log('[AudioPlayerModal] Handling portal_media as array');
      product.portal_media.forEach((item, index) => {
        if (item.audio_url) {
          tracks.push({
            url: item.audio_url,
            title: item.title || `Track ${index + 1}`,
            type: 'audio'
          });
        }
      });
    }
    // Handle dict format (retreat packages)
    else if (product.portal_media) {
      console.log('[AudioPlayerModal] Handling portal_media as dict');
      const mp3Count = (product.portal_media.mp3 || []).length;
      const podbeanCount = (product.portal_media.podbean || []).length;
      console.log('[AudioPlayerModal] MP3 count:', mp3Count, 'Podbean count:', podbeanCount);

      (product.portal_media.mp3 || []).forEach((url, index) => {
        console.log(`[AudioPlayerModal] Adding MP3 ${index + 1}:`, url);
        tracks.push({ url, title: `Audio ${index + 1}`, type: 'audio' });
      });
      (product.portal_media.podbean || []).forEach((url, index) => {
        console.log(`[AudioPlayerModal] Adding Podbean ${index + 1}:`, url);
        tracks.push({ url, title: `Podbean ${index + 1}`, type: 'podbean' });
      });
    }

    console.log('[AudioPlayerModal] Total tracks found:', tracks.length);
    return tracks;
  };

  const allTracks = getAudioTracks();
  const currentTrack = allTracks[currentTrackIndex];
  const isPodbean = currentTrack?.type === 'podbean';

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (currentTrackIndex < allTracks.length - 1) {
        setCurrentTrackIndex(currentTrackIndex + 1);
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    };
    const handleWaiting = () => {
      console.log('[AudioPlayerModal] Audio waiting for data');
      setIsLoading(true);
    };
    const handlePlaying = () => {
      console.log('[AudioPlayerModal] Audio playing');
      setIsLoading(false);
      setIsPlaying(true);
    };
    const handlePause = () => {
      console.log('[AudioPlayerModal] Audio paused');
      if (!audio.ended) {
        setIsPlaying(false);
      }
    };
    const handleStalled = () => {
      console.warn('[AudioPlayerModal] Audio stalled');
      setIsLoading(true);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('stalled', handleStalled);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('stalled', handleStalled);
    };
  }, [currentTrackIndex, allTracks.length]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Load audio when track changes
  useEffect(() => {
    console.log('[AudioPlayerModal] Track changed, currentTrackIndex:', currentTrackIndex);
    console.log('[AudioPlayerModal] Current track:', currentTrack);
    if (audioRef.current && currentTrack && !isPodbean) {
      const audio = audioRef.current;
      const shouldAutoPlay = isPlaying;
      console.log('[AudioPlayerModal] Loading new audio source:', currentTrack.url, 'shouldAutoPlay:', shouldAutoPlay);

      // Reset playback state
      audio.pause();
      audio.currentTime = 0;
      setCurrentTime(0);
      setDuration(0);

      // If we should auto-play, wait for audio to be ready
      if (shouldAutoPlay) {
        setIsLoading(true);
        const handleCanPlay = () => {
          console.log('[AudioPlayerModal] Audio ready, auto-playing');
          audio.play().catch((error) => {
            console.error('[AudioPlayerModal] Error auto-playing:', error);
            setIsPlaying(false);
            setIsLoading(false);
          });
        };
        audio.addEventListener('canplay', handleCanPlay, { once: true });
      }

      // Load the new source
      audio.load();
    }
  }, [currentTrackIndex, currentTrack, isPodbean]);

  const togglePlay = () => {
    const audio = audioRef.current;
    console.log('[AudioPlayerModal] togglePlay called, isPlaying:', isPlaying, 'audio:', !!audio);

    if (!audio) {
      console.error('[AudioPlayerModal] audioRef.current is null!');
      return;
    }

    if (isPlaying) {
      console.log('[AudioPlayerModal] Pausing audio');
      audio.pause();
      // State will be updated by the 'pause' event listener
    } else {
      console.log('[AudioPlayerModal] Playing audio from URL:', audio.src, 'readyState:', audio.readyState);

      // Simply call play - the browser will handle buffering
      audio.play().catch((error) => {
        console.error('[AudioPlayerModal] Error playing audio:', error);
        setIsPlaying(false);
        setIsLoading(false);
      });
      // State will be updated by the 'playing' event listener
    }
  };

  const handlePrevious = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (currentTrackIndex < allTracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    if (currentTrack?.url) {
      window.open(currentTrack.url, '_blank');
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        if (audioRef.current) {
          audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
        }
      } else if (e.code === 'ArrowRight') {
        if (audioRef.current) {
          audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, duration]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-[#FAF8F1] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB] flex-shrink-0">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[#000000] mb-1" style={{ fontFamily: 'Optima, serif' }}>
              {product.title}
            </h2>
            {product.description && (
              <p className="text-sm text-[#717680] line-clamp-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                {product.description.replace(/<[^>]*>/g, '')}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="ml-4 text-[#717680] hover:text-[#000000]"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Player Area */}
        <div className="bg-gradient-to-br from-[#7D1A13] to-[#5D1410] p-8 flex-shrink-0">
          <div className="text-center text-white mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
              <Music2 className="w-10 h-10" />
            </div>
            <p className="text-lg font-semibold mb-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              {currentTrack?.title || `Track ${currentTrackIndex + 1}`}
            </p>
            <p className="text-sm opacity-80">
              {currentTrackIndex + 1} of {allTracks.length}
            </p>
          </div>

          {/* Audio Player */}
          {currentTrack && !isPodbean && (
            <>
              <audio
                ref={audioRef}
                src={currentTrack.url}
                preload="auto"
                crossOrigin="anonymous"
                className="hidden"
              />

              {/* Progress Bar */}
              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <div className="flex justify-between text-xs text-white/80 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevious}
                  disabled={currentTrackIndex === 0 || isLoading}
                  className="text-white hover:bg-white/20 disabled:opacity-30"
                >
                  <SkipBack className="w-6 h-6" />
                </Button>
                <Button
                  size="icon"
                  onClick={togglePlay}
                  disabled={isLoading}
                  className="w-14 h-14 rounded-full bg-white text-[#7D1A13] hover:bg-white/90 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#7D1A13]"></div>
                  ) : isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-1" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  disabled={currentTrackIndex >= allTracks.length - 1 || isLoading}
                  className="text-white hover:bg-white/20 disabled:opacity-30"
                >
                  <SkipForward className="w-6 h-6" />
                </Button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-3 justify-center">
                <Volume2 className="w-4 h-4 text-white" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-32 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
                />
              </div>
            </>
          )}

          {/* Podbean Embed */}
          {currentTrack && isPodbean && (
            <div className="bg-white/10 rounded-lg p-4">
              <iframe
                src={currentTrack.url}
                className="w-full h-32 border-0"
                scrolling="no"
                allowFullScreen
              />
            </div>
          )}
        </div>

        {/* Track List */}
        {allTracks.length > 1 && (
          <div className="px-6 pt-6 pb-4">
            <h3 className="text-lg font-bold text-[#000000] mb-3" style={{ fontFamily: 'Optima, serif' }}>
              Playlist
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {allTracks.map((track, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentTrackIndex(index);
                    setIsPlaying(true);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    currentTrackIndex === index
                      ? 'bg-[#7D1A13] text-white border-[#7D1A13] shadow-md'
                      : 'bg-white hover:bg-gray-50 border-[#E5E7EB]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentTrackIndex === index ? 'bg-white/20' : 'bg-[#7D1A13]/10'
                    }`}>
                      {currentTrackIndex === index && isPlaying ? (
                        <Pause className={`w-4 h-4 ${currentTrackIndex === index ? 'text-white' : 'text-[#7D1A13]'}`} />
                      ) : (
                        <Play className={`w-4 h-4 ${currentTrackIndex === index ? 'text-white' : 'text-[#7D1A13]'}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${
                        currentTrackIndex === index ? 'text-white' : 'text-[#000000]'
                      }`} style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                        {track.title || `Track ${index + 1}`}
                      </p>
                      <p className={`text-xs truncate ${
                        currentTrackIndex === index ? 'text-white/80' : 'text-[#717680]'
                      }`}>
                        {track.type === 'podbean' ? 'Podbean' : 'Audio'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#E5E7EB] flex justify-between items-center flex-shrink-0">
          <p className="text-sm text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            Use Space to play/pause, Arrow keys to seek
          </p>
          {currentTrack && !isPodbean && (
            <Button
              onClick={handleDownload}
              variant="outline"
              className="border-[#7D1A13] text-[#7D1A13] hover:bg-[#7D1A13]/5"
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
